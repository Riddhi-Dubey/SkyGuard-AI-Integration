# SkyGuard AI — Complete Integration & Deployment Guide
**Smart India Hackathon 2026 (SIH PS 26073)**  
*Intelligent Real-Time Anomaly Detection System for Automatic Weather Stations (AWS)*

---

## 📌 Executive Overview for the Team Member & AI Assistant

Welcome! This repository contains the complete, production-ready implementation of **SkyGuard AI**:
1. **Machine Learning Core**: Hybrid Rule Engine + 12-Dimensional Unsupervised Isolation Forest model.
2. **Explainability Engine (SHAP)**: Quantitative feature attribution with waterfall charts and structured JSON outputs.
3. **Agentic GenAI Layer (LangGraph)**: Multi-node parallel graph executing Score Calibration, SHAP Formatting, Baseline Interpolation, Maintenance Risk Tool, and Groq LLM Narration (`openai/gpt-oss-120b`).
4. **Backend API (FastAPI)**: High-performance in-memory ring-buffer streaming layer for real-time ingestion, station tracking, and anomaly routing.
5. **Frontend Dashboard (React / Vite / Tailwind)**: Interactive AWS network map, real-time 60-minute sensor charts, live anomaly feed, and full diagnostic slide-over drawers.

---

## 📂 Repository Structure

```
SIH2/
├── sih-ml-project-main/          # Backend & AI/ML Layer (Python)
│   ├── data/
│   │   └── weather_data.csv      # Raw AWS sensor dataset
│   ├── models/                   # Trained models
│   │   ├── anomaly_model.pkl     # Isolation Forest (12 features)
│   │   └── scaler.pkl            # Preprocessing StandardScaler
│   ├── outputs/                  # Static charts & evaluation reports
│   ├── src/
│   │   ├── data_preprocessing.py # 12-feature engineering pipeline
│   │   ├── train.py              # Model training script
│   │   ├── evaluation.py         # Model evaluation & 3D visualizations
│   │   ├── predict.py            # Hybrid inference engine (Rules + ML)
│   │   ├── explain.py            # SHAP calculation & JSON attribution
│   │   ├── test_shap.py          # SHAP validation test script
│   │   ├── test_hybrid.py        # Rule engine & flatline test script
│   │   ├── api/                  # FastAPI Web Backend
│   │   │   ├── app.py            # FastAPI endpoints & CORS
│   │   │   └── state_store.py    # In-memory circular buffer streaming store
│   │   └── pipeline/             # LangGraph Agentic GenAI Layer
│   │       ├── state.py          # StateGraph schema & contracts
│   │       ├── nodes.py          # 5 Graph nodes (Calibration, SHAP, Correction, Risk, LLM)
│   │       ├── tools.py          # PostgreSQL tool with in-memory fallback
│   │       ├── graph.py          # LangGraph StateGraph builder & process_flagged_reading()
│   │       └── demo_pipeline.py  # End-to-end verification demo
│   └── requirements.txt          # Python dependencies
│
└── frontend/                     # Frontend Dashboard (React + Vite)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx               # Route management
        ├── main.jsx              # Entry point
        ├── services/
        │   └── api.js            # API client with automatic offline fallback
        ├── pages/
        │   ├── Dashboard.jsx     # Main command center & live sensor monitoring
        │   └── Landing.jsx       # Public overview page
        ├── data/
        │   └── mockData.js       # Central data contract & offline mock data
        └── components/
            ├── AnomalyDetail.jsx # Slide-over drawer with AI assessment & correction
            ├── AnomalyTable.jsx  # Recent anomalies table
            ├── SensorChart.jsx   # 60-minute interactive timeseries charts
            ├── StationInspector.jsx # Station telemetry & health card
            ├── NetworkMap.jsx    # Stylized vector map of India with station nodes
            ├── KPICard.jsx       # Network metrics & sparklines
            ├── AIInsight.jsx     # Narrative assessment card
            ├── ShapChart.jsx     # Horizontal SHAP impact bars
            ├── MaintenanceRisk.jsx # Circular maintenance risk gauge
            ├── StatusBadge.jsx   # Severity badges (critical, warning, normal)
            └── Toast.jsx         # Live notification popups
```

---

## ⚡ Quick Start: Running Locally (2-Minute Setup)

### 1. Environment Setup

#### Python Environment (Backend)
Recommended Python Version: **Python 3.10, 3.11, or 3.12**.

1. Open a terminal in `sih-ml-project-main`:
   ```bash
   cd sih-ml-project-main
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. *(Optional)* Configure your Groq API Key:  
   Create a `.env` file in `sih-ml-project-main/`:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
   > **Note**: If `GROQ_API_KEY` is omitted, the backend automatically uses its deterministic fallback generator so it never crashes offline.

#### Node.js Environment (Frontend)
Recommended Node Version: **Node.js 18+ or 20+**.

1. Open a terminal in `frontend`:
   ```bash
   cd frontend
   ```
2. Install frontend packages:
   ```bash
   npm install
   ```

---

## 🚀 Running the Full Stack

### Terminal 1 — Start the Python FastAPI Backend
```bash
cd sih-ml-project-main
python -m uvicorn src.api.app:app --host 127.0.0.1 --port 8000 --reload
```
* Backend URL: `http://127.0.0.1:8000`
* Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

### Terminal 2 — Start the React Frontend Dashboard
```bash
cd frontend
npm run dev
```
* Dashboard URL: `http://localhost:5173`

Open `http://localhost:5173/dashboard` in your browser. The dashboard will automatically connect to your live FastAPI backend!

---

## 🔗 Backend API Contracts & Endpoints

| Endpoint | Method | Purpose | Response Format |
| :--- | :---: | :--- | :--- |
| `/api/stations` | `GET` | Returns all 12 AWS stations with live status & readings | Array of `{ id, name, state, x, y, status, temp, pressure, humidity, health }` |
| `/api/stations/{id}/series` | `GET` | Returns 60-minute sliding window time-series for charts | Array of `{ time, minutesAgo, temp, pressure, humidity, anomaly }` |
| `/api/stats` | `GET` | Returns network-wide KPI metrics and sparkline arrays | `{ stationsOnline, observations, activeAnomalies, networkHealth, sparklines }` |
| `/api/anomalies` | `GET` | Returns recent anomaly incidents list | Array of `{ id, time, station, stationName, parameter, observed, expected, severity, confidence, rootCause }` |
| `/api/anomalies/{id}` | `GET` | Returns full LangGraph diagnostic detail | Full `AnomalyFrontendContract` (see below) |
| `/api/ingest` | `POST` | Ingests live reading, runs ML & LangGraph | `{ status: "processed", anomaly: bool, detail: {...} }` |
| `/api/simulate-anomaly` | `POST` | **Interactive Demo Trigger**: Injects live test anomaly | Injects spike/drift/freeze and broadcasts to live feed |

### The Core Anomaly Contract Schema (`AnomalyDetail`):
```json
{
  "id": "AN-10231",
  "station": "AWS-DEL-01",
  "stationName": "Delhi, India",
  "parameter": "Temperature",
  "severity": "critical",
  "confidence": 98.5,
  "observed": 55.0,
  "expected": 24.6,
  "correction": 24.6,
  "correctionMethod": "Temporal interpolation + local station context",
  "correctionConfidence": 95.4,
  "aiAssessment": "Temperature shifted abruptly from expected 24.6°C to observed 55.0°C within one observation interval. The magnitude and rate of change are inconsistent with recent temporal baselines for Delhi, India.",
  "probableRootCause": "Transient electrical interference or momentary sensor malfunction causing an isolated temperature sensor spike",
  "recommendedAction": "Replace or recalibrate the temperature sensor on AWS-DEL-01 and verify data integrity after replacement",
  "maintenanceRisk": {
    "level": "MEDIUM-HIGH",
    "score": 74,
    "reason": "Five sensor spike incidents in the past 24 hours elevate the maintenance risk to MEDIUM-HIGH (score 74/100)."
  },
  "shapContributions": [
    { "feature": "Temperature Delta", "value": 0.82 },
    { "feature": "Rolling Temperature Std", "value": 0.61 },
    { "feature": "Temperature", "value": 0.31 },
    { "feature": "Humidity", "value": 0.08 },
    { "feature": "Pressure", "value": 0.03 }
  ]
}
```

---

## 🧪 Testing and Verification Suite

To verify individual components before demoing:

```bash
# 1. Run full LangGraph Pipeline Demo (Tests both Isolation Forest & Rule Engine scenarios)
python src/pipeline/demo_pipeline.py

# 2. Run SHAP Feature Extraction Test
python src/test_shap.py

# 3. Run Rule-Based Physical & Flatline Validation Tests
python src/test_hybrid.py

# 4. Run ML Model Prediction Self-Test
python src/predict.py
```

---

## 🌐 Production Cloud Deployment Guide

### Option A: Deploy Backend to Render / Railway
1. **Root Directory**: `sih-ml-project-main`
2. **Build Command**: `pip install -r requirements.txt`
3. **Start Command**: `uvicorn src.api.app:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**: Add `GROQ_API_KEY` (if using live Groq LLM).

### Option B: Deploy Frontend to Vercel / Netlify
1. **Root Directory**: `frontend`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variable**: Set `VITE_API_URL=https://your-backend-api.onrender.com` (if backend is deployed remotely).

---

## 🎯 Live Presentation & Demo Script for Judges

1. **Open Dashboard (`/dashboard`)**:
   - Show the **AWS Network Map**: Point out the live telemetry from 12 stations across India.
   - Click a station (e.g. **Delhi - AWS-DEL-01**): Show the **Live Sensor Charts** rendering 60 minutes of real-time temperature, pressure, and humidity.
2. **Demonstrate AI Anomaly Detection**:
   - Click the **"Inject Test Anomaly"** button in the header (or trigger `/api/simulate-anomaly`).
   - Notice the instant **Toast Alert** and station pin changing to pulsing RED/AMBER.
3. **Show Explainability & GenAI Agent (LangGraph)**:
   - Click the new anomaly in the **Recent Anomalies** table.
   - Walk the judges through the slide-over drawer:
     - **Observed vs Expected vs Correction**: Show the suggested imputation ($24.6^\circ\text{C}$ replacing $55.0^\circ\text{C}$ spike).
     - **SHAP Chart**: Explain how quantitative feature attribution proves *why* the AI flagged it (Temperature rate-of-change delta).
     - **Grounded AI Insight**: Highlight the Groq LLM narrative explaining the root cause and actionable mitigation for field technicians.
     - **Maintenance Risk Gauge**: Explain the 24-hour frequency tracking predicting sensor failure.

---

## 🏆 Key Points to Emphasize for SIH Scoring

* **Innovation & Novelty (25%)**: Multi-node LangGraph parallel architecture combining unsupervised ML (Isolation Forest), meteorological physics rules, quantitative SHAP attribution, and LLM diagnostics.
* **Detection Accuracy (20%)**: 12-dimensional feature engineering capturing rates of change and 1-hour rolling volatility to eliminate false alarms.
* **Real-Time Capability (15%)**: In-memory ring-buffer ingestion capable of sub-millisecond anomaly scoring across thousands of observations.
* **Explainability (10%)**: Direct SHAP feature attribution + plain-English root-cause narration.
* **Practical Deployability (10%)**: Self-contained, portable, zero-database friction for instant deployment, with seamless cloud upgrade path.

---
*Created for SkyGuard AI — Smart India Hackathon 2026.*
