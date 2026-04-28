const fileInput = document.getElementById('fileInput');
  const dropZone = document.getElementById('dropZone');
  const processing = document.getElementById('processing');
  const results = document.getElementById('results');

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
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('originalImg').src = e.target.result;
      results.classList.remove('visible');
      processing.classList.add('visible');
      setTimeout(() => runAnalysis(), 1800);
    };
    reader.readAsDataURL(file);
  }

  function runAnalysis() {
    /*
      TODO: Replace this simulation with a real API call once your
      FastAPI backend is deployed. It should look like this:

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      const res = await fetch('https://your-cloud-run-url/predict', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      // data = { verdict: 'FAKE', confidence: 98.8, heatmap_url: '...' }

      showResults(data.verdict, data.confidence, data.heatmap_url);
    */

    // SIMULATED RESULT (remove once backend is connected)
    const isFake = Math.random() > 0.4;
    const confidence = isFake
      ? parseFloat((75 + Math.random() * 24).toFixed(1))
      : parseFloat((55 + Math.random() * 38).toFixed(1));

    const verdict = isFake ? 'FAKE' : 'REAL';
    showResults(verdict, confidence, null);
  }

  function showResults(verdict, confidence, heatmapUrl) {
    const isFake = verdict === 'FAKE';
    const riskLevel = confidence > 90 ? 'HIGH' : confidence > 70 ? 'MEDIUM' : 'LOW';

    const explanations = {
      fake: [
        'Elevated activation detected across the forehead and periorbital regions. Texture inconsistencies around the eye contours suggest boundary blending typical of face-swap manipulation. Jawline shows compression artefacts consistent with generative synthesis.',
        'Heatmap highlights strong anomaly signals near the hairline and cheek boundaries. These regions show unnatural smoothing and loss of micro-texture — a characteristic signature of GAN-generated imagery.',
        'Suspicious activity concentrated around the nose bridge and upper lip. Pixel-level analysis reveals tonal mismatches at skin-to-background edges, indicating deepfake synthesis or post-processing manipulation.'
      ],
      real: [
        'No significant manipulation signatures detected. Activation is distributed naturally across the face with no concentrated anomaly zones. Texture gradients and edge sharpness are consistent with authentic photographic capture.',
        'Heatmap shows diffuse, low-intensity activation with no focal hotspots. Facial boundaries, skin texture, and lighting consistency all fall within expected parameters for an unmodified image.',
        'Analysis complete. No deepfake indicators present. The image passes all heuristic checks for authentic facial photography.'
      ]
    };

    const pool = isFake ? explanations.fake : explanations.real;
    const explanation = pool[Math.floor(Math.random() * pool.length)];

    // Verdict
    const verdictEl = document.getElementById('verdictVal');
    verdictEl.textContent = verdict;
    verdictEl.className = 'rai-metric-value ' + (isFake ? 'fake' : 'real');

    // Confidence
    document.getElementById('confidenceVal').textContent = confidence.toFixed(1) + '%';
    const bar = document.getElementById('confidenceBar');
    bar.className = 'rai-bar ' + (isFake ? 'fake' : 'real');
    setTimeout(() => { bar.style.width = confidence + '%'; }, 100);

    // Risk
    const riskEl = document.getElementById('riskVal');
    riskEl.textContent = riskLevel;
    riskEl.className = 'rai-metric-value ' + riskLevel.toLowerCase();

    // Explanation
    document.getElementById('explanationText').textContent = explanation;

    // Heatmap
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
    document.getElementById('verdictVal').textContent = '—';
    document.getElementById('confidenceVal').textContent = '—';
    document.getElementById('riskVal').textContent = '—';
    document.getElementById('confidenceBar').style.width = '0%';
    document.getElementById('explanationText').textContent = '—';
    document.getElementById('originalImg').src = '';
    document.getElementById('heatmapImg').src = '';
    document.getElementById('heatmapImg').style.display = 'none';
    document.getElementById('heatmapPlaceholder').style.display = 'flex';
    fileInput.value = '';
  }