import asyncio
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from PIL import Image
import torchvision.transforms as T
import onnxruntime as ort
import uvicorn
import os

MAX_QUEUE_SIZE = 64
INFERENCE_TIMEOUT = 10

TARGET_W = 120
TARGET_H = 25

def crop_captcha(img):
    """Crop to the captcha region before resizing — critical for accuracy."""
    w, h = img.size
    if w > TARGET_W or h > TARGET_H:
        img = img.crop((0, 0, TARGET_W, TARGET_H))
    return img

# Character set matching captcha_crnn.onnx training
# Index 0 = CTC blank token, indices 1-36 = actual characters
CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
IDX2CHAR = {i + 1: c for i, c in enumerate(CHARS)}

# Transforms matching captcha_crnn.onnx training
# The model was trained with Grayscale -> Resize(32,120) -> ToTensor -> Normalize(0.5, 0.5)
tf = T.Compose([
    T.Grayscale(),
    T.Resize((32, 120)),
    T.ToTensor(),
    T.Normalize((0.5,), (0.5,))
])

# Get absolute path to the model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "captcha_crnn.onnx")

session = ort.InferenceSession(
    MODEL_PATH,
    providers=["CPUExecutionProvider"]
)

def decode(logits):
    """CTC decoding: skip blanks (index 0) and repeated characters."""
    preds = logits.argmax(2).T
    out = []
    for p in preds:
        s, prev = "", 0
        for c in p:
            if c != prev and c != 0:
                s += IDX2CHAR[c]
            prev = c
        out.append(s)
    return out

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "service": "unibuddy-captcha-solver"}

@app.on_event("startup")
async def startup():
    app.state.request_queue = asyncio.Queue(maxsize=MAX_QUEUE_SIZE)
    asyncio.create_task(worker())

async def worker():
    queue = app.state.request_queue
    while True:
        img, future = await queue.get()
        try:
            logits = session.run(None, {"input": img})[0]
            result = decode(logits)[0]
            print(f"DEBUG: Solved captcha: [{result}]")
            future.set_result(result)
        except Exception as e:
            print(f"DEBUG: WORKER ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            future.set_exception(e)
        finally:
            queue.task_done()

@app.post("/captcha", response_class=PlainTextResponse)
async def predict(file: UploadFile = File(...)):
    queue = app.state.request_queue

    if queue.full():
        raise HTTPException(status_code=503, detail="busy")

    try:
        img = Image.open(file.file).convert("L")
        img = crop_captcha(img)
        img = tf(img).unsqueeze(0).numpy()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"invalid image: {str(e)}")

    loop = asyncio.get_running_loop()
    future = loop.create_future()
    await queue.put((img, future))

    try:
        return await asyncio.wait_for(future, timeout=INFERENCE_TIMEOUT)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="timeout")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 6000))  # 6000 for local
    print(f"Starting Unibuddy Captcha Solver on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
