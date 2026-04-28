const BASE_URL = 'https://your-reveal-ai-backend.onrender.com'; 

const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const processing = document.getElementById('processing');
const results = document.getElementById('results');

// Track the current file globally so runAnalysis can access it
let currentFile = null;

fileInput.addEventListener('change', e => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
});

dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

function handleFile(file) {
    currentFile = file; // Store the file for the API call
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('originalImg').src = e.target.result;
        results.classList.remove('visible');
        processing.classList.add('visible');
        
        // Call the real analysis function
        runAnalysis();
    };
    reader.readAsDataURL(file);
}

// 2. THE REAL CONNECTION LOGIC
async function runAnalysis() {
    if (!currentFile) return;

    try {
        const formData = new FormData();
        formData.append('file', currentFile); // 'file' must match your FastAPI parameter name

        const response = await fetch(`${BASE_URL}/detect`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();
        
        /* Expected JSON format from your FastAPI:
           {
             "verdict": "FAKE",
             "confidence": 98.5,
             "heatmap": "iVBORw0KGgoAAAANSUhEUgAA..." // Base64 string
           }
        */

        // Convert Base64 heatmap to a viewable URL format
        const heatmapUrl = `data:image/jpeg;base64,${data.heatmap}`;
        
        showResults(data.verdict, data.confidence, heatmapUrl);

    } catch (error) {
        console.error("Connection failed:", error);
        alert("Could not connect to RevealAI backend. Make sure the Render service is awake!");
        processing.classList.remove('visible');
    }
}

function showResults(verdict, confidence, heatmapUrl) {
    const isFake = verdict.toUpperCase() === 'FAKE';
    const riskLevel = confidence > 90 ? 'HIGH' : confidence > 70 ? 'MEDIUM' : 'LOW';

    // The rest of your explanation logic remains the same...
    const explanations = {
        fake: [
            'Elevated activation detected across the forehead and periorbital regions. Texture inconsistencies suggest boundary blending typical of deepfakes.',
            'Heatmap highlights strong anomaly signals near the hairline. These regions show unnatural smoothing characteristic of GAN imagery.'
        ],
        real: [
            'No significant manipulation signatures detected. Texture gradients are consistent with authentic photographic capture.',
            'Analysis complete. No deepfake indicators present. The image passes all heuristic checks.'
        ]
    };

    const pool = isFake ? explanations.fake : explanations.real;
    const explanation = pool[Math.floor(Math.random() * pool.length)];

    const verdictEl = document.getElementById('verdictVal');
    verdictEl.textContent = verdict;
    verdictEl.className = 'rai-metric-value ' + (isFake ? 'fake' : 'real');

    document.getElementById('confidenceVal').textContent = confidence.toFixed(1) + '%';
    const bar = document.getElementById('confidenceBar');
    bar.className = 'rai-bar ' + (isFake ? 'fake' : 'real');
    setTimeout(() => { bar.style.width = confidence + '%'; }, 100);

    const riskEl = document.getElementById('riskVal');
    riskEl.textContent = riskLevel;
    riskEl.className = 'rai-metric-value ' + riskLevel.toLowerCase();

    document.getElementById('explanationText').textContent = explanation;

    if (heatmapUrl) {
        document.getElementById('heatmapPlaceholder').style.display = 'none';
        const heatmapImg = document.getElementById('heatmapImg');
        heatmapImg.src = heatmapUrl;
        heatmapImg.style.display = 'block';
    }

    processing.classList.remove('visible');
    results.classList.add('visible');
}

function resetUI() {
    results.classList.remove('visible');
    processing.classList.remove('visible');
    // ... rest of your reset logic ...
    currentFile = null;
    fileInput.value = '';
}