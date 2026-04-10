# Deepfake Detection Platform

Detecting manipulated media with AI-powered analysis. A comprehensive deepfake detection system combining deep learning with advanced forensic analysis to identify manipulated images, videos, and audio files.

---

## Overview

This platform provides an end-to-end solution for detecting deepfakes using:

- **Deep Learning**: ResNet18-based architecture with transfer learning
- **Forensic Analysis**: Multi-channel detection including frequency analysis, compression artifacts, and facial inconsistencies
- **Web Interface**: Modern, responsive UI for file analysis
- **REST API**: Production-ready backend for integration

**Current Capabilities:**
- Image deepfake detection
- Video frame-by-frame analysis
- Audio manipulation detection
- Confidence scoring with detailed reports
- Batch processing support
- Real-time dashboards and history tracking

---

## Features

### Multi-Format Support
- **Images**: JPG, PNG, WebP with comprehensive artifact detection
- **Videos**: MP4, WebM frame-by-frame analysis
- **Audio**: WAV, MP3 speech synthesis detection

### Advanced Analysis
- Confidence scoring (0-100% reliability)
- Compression artifacts detection
- Frequency anomalies analysis
- Facial inconsistencies detection
- Noise pattern analysis
- Temporal consistency for videos

### Dashboard
- Real-time upload and analysis
- Visual result indicators (Fake/Real)
- Historical scan tracking
- Statistical overview and trends
- Filterable media type browsing

### Production Ready
- Database persistence
- RESTful API endpoints
- CORS-enabled configuration
- Error handling and validation
- Performance optimizations

---

## Quick Start

### Prerequisites
- Node.js 16+ and npm/pnpm
- Python 3.9+
- Git

### Installation & Running

#### 1. Clone the Repository
```bash
git clone https://github.com/Bhuvana-chandrika07/fake-media-detection.git
cd "fake media detection"
```

#### 2. Install Dependencies
```bash
# Frontend
cd artifacts/artifacts/deepfake-detector
pnpm install

# Backend/ML
cd ../api-server
pip install flask flask-cors pillow numpy

cd ../../..
pip install torch torchvision tqdm scikit-learn pandas
```

#### 3. Run Services

**API Server** (Port 8080):
```bash
cd artifacts/artifacts/api-server
python server_mock.py
```

**Frontend** (Port 5173):
```bash
cd artifacts/artifacts/deepfake-detector
pnpm run dev
```

#### 4. Access the Application
- Frontend: http://localhost:5173
- API: http://localhost:8080/api
- Demo Login: demo@auradetect.ai (auto-applied)

---

## Project Structure

```
fake-media-detection/
├── artifacts/artifacts/
│   ├── deepfake-detector/          # React + Vite frontend
│   │   ├── src/
│   │   │   ├── pages/              # Dashboard, History, Results, Upload
│   │   │   ├── components/         # Reusable UI components
│   │   │   └── api-client-react.ts # API integration
│   │   └── vite.config.ts          # Build configuration
│   │
│   └── api-server/                 # Flask backend API
│       ├── server_mock.py          # Main API server
│       ├── database.py             # SQLite persistence
│       └── inference.py            # ML model inference
│
├── ml/                             # Machine Learning modules
│   ├── model/
│   │   ├── train.py               # Model training pipeline
│   │   ├── inference.py           # Model inference wrapper
│   │   ├── model_tuner.py         # Hyperparameter tuning
│   │   └── deepfake_detector.pth  # Trained model weights
│   └── datasets/
│       └── processed/              # Training data
│
├── FEATURES_GUIDE.md               # Detailed feature documentation
├── SETUP_STATUS.md                 # Installation guide
└── README.md
```

---

## API Endpoints

### Health Check
```http
GET /api/health
```

### Detection
```http
POST /api/detect/image
POST /api/detect/video
POST /api/detect/audio
```

**Response Example:**
```json
{
  "id": "uuid",
  "prediction": "Real|Fake",
  "confidence": 85.5,
  "explanation": "Analysis indicates...",
  "analysisDetails": {
    "compressionArtifacts": 0.05,
    "frequencyAnomaly": 0.8,
    "facialInconsistency": 0.2,
    "processingTime": 1500
  }
}
```

### Statistics
```http
GET /api/stats
GET /api/history?limit=50&mediaType=image
GET /api/history/:id
```

---

## Model Performance

- **Architecture**: ResNet18 with transfer learning
- **Dataset**: 2,000+ labeled images (Real/Fake)
- **Validation Accuracy**: ~94.7%
- **Processing Time**: ~1.5 seconds per image

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Backend | Flask + CORS |
| Database | SQLite |
| ML | PyTorch |
| State Management | TanStack Query |
| Routing | Wouter |

---

## How It Works

1. **File Upload** - User selects media file through web interface
2. **Pre-processing** - Extract frames, convert audio, normalize dimensions
3. **Feature Extraction** - Run model and compute forensic features
4. **Classification** - Combine predictions with forensic scores
5. **Results** - Display prediction with confidence and detailed analysis
6. **Storage** - Save scan result to database

---

## Troubleshooting
```bash
# Check if port 8080 is in use
netstat -ano | findstr :8080

# If in use, kill the process:
taskkill /PID <PID> /F

# Then restart
python server_mock.py
```

### Frontend Blank Page
1. Ensure backend is running on port 8080
2. Check browser console for errors (F12)
3. Clear cache: `Ctrl+Shift+Delete`
4. Verify Vite proxy in `vite.config.ts`

### Model Not Loading
```bash
# Check if model file exists
ls ml/model/deepfake_detector.pth

# If missing, train a new model:
cd ml/model
python train.py
```

### Database Errors
```bash
# Reset database (removes all scans)
rm artifacts/artifacts/api-server/auradetect.db

# Restart server to recreate
python server_mock.py
```

---

## Documentation

- [FEATURES_GUIDE.md](FEATURES_GUIDE.md) - Detailed feature documentation
- [SETUP_STATUS.md](SETUP_STATUS.md) - Installation troubleshooting
- [Frontend README](artifacts/artifacts/deepfake-detector/README.md) - React app guide

---

## Advanced Usage

### Train Custom Model
```bash
cd ml/model
python train.py --epochs 100 --batch-size 32 --lr 0.0005
```

### Model Inference
```python
from inference import DeepfakeDetector

detector = DeepfakeDetector()
result = detector.predict("path/to/image.jpg")
print(f"Prediction: {result['prediction']}, Confidence: {result['confidence']}")
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is open source and available under the MIT License.

---

## Support

- Issues: [GitHub Issues](https://github.com/Bhuvana-chandrika07/fake-media-detection/issues)
- Email: contact@auradetect.ai

---

Built with modern technologies for deep learning and web development.
