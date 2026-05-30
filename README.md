# RevealAI 🔍

A deepfake detection web application built for the 
Google Solution Challenge 2026.

Analyzes images to determine whether they are real or 
AI-manipulated, with visual explanations powered by 
Grad-CAM and plain-English forensic summaries via 
the Gemini API.

---

## Features
- Real vs. deepfake image classification using EfficientNet-B0
- Grad-CAM heatmaps highlighting manipulated facial regions
- Gemini 1.5 Flash integration for human-readable detection reports
- Separated frontend and backend architecture

## Project Structure
RevealAI/
├── backend/
│   ├── main.py         # Core detection pipeline
│   ├── revealai_model.pth       # Trained EfficientNet-B0 weights
│   └── requirements.txt       # Model configuration
├── frontend/
│   ├── revealai.html
│   ├── revealai.css
│   └── revealai.js

## Tech Stack
- **Model:** EfficientNet-B0, Grad-CAM
- **AI Summary:** Gemini 1.5 Flash API
- **Frontend:** HTML, CSS, JavaScript
- **Runtime:** Python, Google Colab

## Screenshots
*Coming soon*

## Note
Deployment is currently non-functional. 
The detection pipeline runs locally via the Python backend.
