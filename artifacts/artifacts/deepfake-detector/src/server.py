from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    return {
        "result": random.choice(["Real", "Deepfake"]),
        "confidence": random.randint(85, 99)
    }

@app.post("/detect/video")
async def detect_video(file: UploadFile = File(...)):
    return {
        "result": random.choice(["Real", "Deepfake"]),
        "confidence": random.randint(85, 99)
    }

@app.post("/detect/audio")
async def detect_audio(file: UploadFile = File(...)):
    return {
        "result": random.choice(["Real", "Deepfake"]),
        "confidence": random.randint(85, 99)
    }