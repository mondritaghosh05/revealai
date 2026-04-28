from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn.functional as F
import io
import base64
import numpy as np
import cv2
from PIL import Image
from torchvision import transforms
from efficientnet_pytorch import EfficientNet

app = FastAPI()

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Load Model (Ensure version 'b0' matches your training!)
model = EfficientNet.from_pretrained('efficientnet-b0')
# Load your weights
model.load_state_dict(torch.load("revealai_model.pth", map_location="cpu"))
model.eval()

# 2. Image Preprocessing
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def generate_heatmap(input_tensor, model):
    """Simple Grad-CAM implementation for the final layer"""
    # Get the features from the last convolutional layer
    features = model.extract_features(input_tensor)
    
    # Simple heatmap: average of the feature maps
    heatmap = torch.mean(features, dim=1).squeeze()
    heatmap = F.relu(heatmap)
    heatmap /= torch.max(heatmap)
    
    # Convert to NumPy/OpenCV for coloring
    heatmap = heatmap.detach().cpu().numpy()
    heatmap = cv2.resize(heatmap, (224, 224))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    
    # Convert back to base64 for the frontend
    _, buffer = cv2.imencode('.jpg', heatmap)
    return base64.b64encode(buffer).decode('utf-8')

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    # 1. Read image
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    input_tensor = preprocess(image).unsqueeze(0)
    
    # 2. Prediction
    with torch.no_grad():
        logits = model(input_tensor)
        probs = torch.sigmoid(logits)
        confidence = probs.item()

    # Determine Verdict
    # Adjust 0.5 threshold based on your model's training
    is_fake = confidence > 0.5
    verdict = "FAKE" if is_fake else "REAL"
    final_conf = confidence if is_fake else (1 - confidence)

    # 3. Generate Heatmap
    heatmap_b64 = generate_heatmap(input_tensor, model)
    
    return {
        "verdict": verdict, 
        "confidence": round(final_conf * 100, 2), 
        "heatmap": heatmap_b64
    }