from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
import io
from PIL import Image

app = FastAPI()

# This allows your React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your model (Make sure the architecture class is defined here too!)
# model = MyEfficientNetModel()
# model.load_state_dict(torch.load("model.pth", map_location="cpu"))
# model.eval()

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    # 1. Read image
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    
    # 2. Run your EfficientNet + GradCAM logic here
    # result = model(image)
    
    return {"prediction": "Fake", "confidence": 0.95, "heatmap": "base64_string_here"}