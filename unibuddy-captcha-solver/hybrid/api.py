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
import string

MAX_QUEUE_SIZE = 64
INFERENCE_TIMEOUT = 10

# Original character set from test.py
CHARS = string.ascii_uppercase + string.digits + "_"
IDX2CHAR = {i: c for i, c in enumerate(CHARS)}

# Original Transforms from test.py
tf = T.Compose([
    T.Grayscale(),
    T.ToTensor()
])

# Get absolute path to the model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "captcha_crnn.onnx")

session = ort.InferenceSession(
    MODEL_PATH,
    providers=["CPUExecutionProvider"]
)

def decode(logits):
    # Shape-agnostic decoding to handle both (1, seq, chars) and (seq, 1, chars)
    preds = np.argmax(logits, axis=2)
    
    # If it's (1, seq), take the first row
    if preds.shape[0] == 1:
        pred = preds[0]
    # If it's (seq, 1), take the first column
    else:
        pred = preds[:, 0]
        
    text = "".join([IDX2CHAR[i] for i in pred]).replace("_", "")
    return [text]

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
        # Original preprocessing from test.py
        img = Image.open(file.file).convert("L")
        img = img.crop((0, 0, 120, 25))
        img_tensor = tf(img).unsqueeze(0).numpy()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"invalid image: {str(e)}")

    loop = asyncio.get_running_loop()
    future = loop.create_future()
    await queue.put((img_tensor, future))

    try:
        return await asyncio.wait_for(future, timeout=INFERENCE_TIMEOUT)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="timeout")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 7860)) # Hugging Face uses 7860 by default
    print(f"Starting High Accuracy Solver on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
