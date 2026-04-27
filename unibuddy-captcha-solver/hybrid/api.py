import asyncio
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from PIL import Image
import onnxruntime as ort
import uvicorn

MAX_QUEUE_SIZE = 64
INFERENCE_TIMEOUT = 10
CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
IDX2CHAR = {i + 1: c for i, c in enumerate(CHARS)}

# Manual preprocessing to replace torchvision (saves ~500MB RAM)
def preprocess_image(img):
    # 1. Resize to target dimensions
    img = img.resize((120, 32), Image.Resampling.BILINEAR)
    # 2. Convert to numpy and scale to [0, 1]
    img_np = np.array(img).astype(np.float32) / 255.0
    # 3. Normalize (mean=0.5, std=0.5) => (x - 0.5) / 0.5
    img_np = (img_np - 0.5) / 0.5
    # 4. Add channel and batch dimensions => (1, 1, 32, 120)
    img_np = np.expand_dims(img_np, axis=(0, 1))
    return img_np

import os

# Get absolute path to the directory containing this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "captcha_crnn.onnx")

session = ort.InferenceSession(
    MODEL_PATH,
    providers=["CPUExecutionProvider"]
)

def decode(logits):
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
            future.set_result(decode(logits)[0])
        except Exception as e:
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
        img_np = preprocess_image(img)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"invalid image: {str(e)}")

    loop = asyncio.get_running_loop()
    future = loop.create_future()
    await queue.put((img_np, future))

    try:
        return await asyncio.wait_for(future, timeout=INFERENCE_TIMEOUT)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="timeout")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 6006))
    print(f"Starting Unibuddy Captcha Solver on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
