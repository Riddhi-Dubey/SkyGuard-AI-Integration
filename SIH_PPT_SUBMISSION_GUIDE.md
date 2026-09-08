# SkyGuard AI — Smart India Hackathon (SIH 2025/2026) Presentation Guide
**Problem Statement ID:** 26073 | **Ministry:** Ministry of Earth Sciences (IMD)  
**Project Title:** SkyGuard AI — Real-Time Quality Control & Agentic GenAI Diagnostics for Automatic Weather Stations

---

## 📌 SLIDE 1: Proposed Solution (Describe your Idea/Solution/Prototype)

### **Header:**
* **Team Name:** *[Your Team Name]*
* **Main Title:** `SKYGUARD AI`
* **Tagline:** `Real-Time Quality Control & Agentic Diagnostics for AWS Weather Networks`
* **Top Mini-Process Banner:**  
  `[AWS Sensors 📡] ➔ [Physics Engine ⚡] ➔ [Isolation Forest 🤖] ➔ [LangGraph GenAI 🧠] ➔ [Email Alert 📧] ➔ [Live Dashboard 📊]`

---

### **[ Box 1: PROBLEM ] (Left Column)**
* **Frequent Sensor Failures in Harsh Field Conditions:** AWS weather stations suffer from electrical spikes, frozen flatlines, and calibration drifts due to extreme weather exposure.
* **Flawed Rule-Based Systems:** Traditional static threshold filters fail to catch slow calibration drift and trigger massive false alarms during real storms.
* **Black-Box ML Lacks Diagnostics:** Existing ML models flag anomalies as simple `True/False` without explaining *which* transducer failed or *why*.
* **Polluted Forecasting Datasets:** Delayed manual quality control allows corrupted data to enter Numerical Weather Prediction (NWP) and disaster early warning models.

---

### **[ Box 2: Our Solution ] (Center Column)**
**An Agentic AI-powered AWS Intelligence Pipeline that:**
* **Ingests Real-Time Telemetry:** Streams 10-minute multi-parameter readings ($T$, $P$, $RH$) across distributed AWS stations.
* **Hybrid Two-Tier Engine:** Evaluates thermodynamic physical gradient limits ($\Delta T > 5^\circ\text{C}/10\text{min}$) alongside unsupervised Isolation Forest.
* **LangGraph Agentic Diagnostics:** Deploys a 6-node state machine that calibrates confidence and synthesizes GenAI root-cause explanations.
* **Non-Destructive Baseline Correction:** Estimates physical correction values using temporal interpolation without overwriting raw telemetry.
* **Autonomous Action & Alerting:** Dispatches instant HTML diagnostic alerts to field technicians with recommended mitigation steps.

---

### **[ Box 3: Why Different ] (Top-Right Card)**
* **Physics-Coupled Validation:** Differentiates real extreme weather (coupled $T/P/RH$ shifts) from isolated hardware glitches.
* **SHAP Explainability:** Quantifies exact feature attributions driving each anomaly score.
* **Autonomous Agentic Workflow:** Goes beyond passive monitoring by diagnosing root causes and autonomously dispatching alerts.

---

### **[ Box 4: Key Value Proposition ] (Bottom-Right Card)**
* **99%+ Meteorological Data Trust:** Guarantees clean, trusted inputs for climate models and disaster management.
* **Proactive Maintenance & Faster MTTR:** Decreases troubleshooting time with prescriptive field-technician action plans.
* **Zero Infrastructure Overhead:** Ultra-fast in-memory execution (<15ms per station) with zero mandatory database lock-in.

---

## 📌 SLIDE 2: Technical Approach

### **[ Right Card: Tech Stack Used ]**
* **Python 3.12** (Core ML & Backend Architecture)
* **Scikit-Learn** (Isolation Forest Unsupervised Model)
* **SHAP** (Shapley Additive Feature Explainability)
* **LangGraph** (Stateful Agentic Directed Acyclic Graph)
* **LangChain & Groq API** (Llama-3.3 / GPT-OSS 120B)
* **FastAPI & Uvicorn** (Asynchronous High-Throughput REST API)
* **NumPy & Pandas** (Rolling Volatility & $\Delta t$ Feature Engineering)
* **React 19 & Vite** (Frontend Interactive Dashboard)
* **Tailwind CSS** (Daylight Clean Theme & Glassmorphism)
* **Leaflet.js** (India Geospatial Radar Map & GIS Layers)
* **Recharts** (60-Minute Sliding Window Telemetry Series)
* **SMTP / Email.MIME** (Automated Diagnostic Dispatcher)

---

### **[ Diagram 1: System Architecture ]**
```text
[AWS Stations (10-min Stream)] ➔ [FastAPI Streaming Gateway & In-Memory Buffers]
                                            ↓
               [Stage 1: Physics Engine (ΔT > 5°C/10min, σ=0 Flatline)]
                                            ↓
               [Stage 2: Isolation Forest Model (12-D Engineered Features)]
                                            ↓ (Flagged)
               [LangGraph 6-Node State Machine: Calibration -> SHAP -> Correction -> LLM]
                                            ↓
          ┌─────────────────────────────────┴─────────────────────────────────┐
          ↓                                                                   ↓
[Autonomous Email Dispatcher]                                   [React Dashboard + GIS Map]
(HTML Report & 180s Cooldown)                                   (Human-in-the-Loop Correction)
```

---

### **[ Diagram 2: Process Flowchart ]**
```text
1. Raw Telemetry Ingest (T, P, RH)
   ↓
2. Feature Extraction (Rolling Deltas Δt, 1-hr Volatility σ_roll, Diurnal Cycle)
   ↓
3. Thermodynamic Physics Gate?
   ├─► [Violates Limit] ───────────────► 5. LangGraph Diagnostics & SHAP Attribution
   └─► [Physically Plausible]            ▲
            ↓                            │
       4. Isolation Forest Score <= 0.0? │
            ├─► [Anomalous] ─────────────┘
            └─► [Normal] ───────────────► Baseline Telemetry OK
                                         ↓
                                      6. Suggest Non-Destructive Correction
                                         ↓
                                      7. Dispatch Autonomous Alert & Operator HITL Action
```

---

## 📌 SLIDE 3: Feasibility and Viability

* **Computational Feasibility:** ML engine processes observations in `< 15ms` per station, supporting 5,000+ simultaneous AWS telemetry streams on basic server/edge hardware.
* **Cost Efficiency:** Built on 100% open-source software with minimal LLM token consumption.
* **Overcoming Sparse Stations:** Uses Regional Climate Clustering (e.g. North-Central Grid) and Altitude Lapse Rate Normalization ($\approx 6.5^\circ\text{C}/1000\text{m}$) to eliminate false spatial alarms.
* **Edge & Cloud Deployment:** Stateless in-memory engine runs on cloud servers or directly on remote AWS Edge Data Loggers (Raspberry Pi/Linux) over satellite links.

---

## 📌 SLIDE 4: Impact and Benefits

* **Target Audience Impact:** IMD meteorologists gain automated quality control; ground technicians receive prescriptive repair orders with exact root-cause classifications.
* **Economic Benefit:** Prevents premature sensor replacements through predictive maintenance risk scoring.
* **Disaster Resilience:** Ensures reliable ground telemetry for cyclone, cloudburst, and heatwave early warnings.
* **Aviation & Agriculture:** Guarantees trusted micro-climate inputs for precision farming and airport meteorological radars.

---

## 📌 SLIDE 5: Research and References

* **WMO-No. 8 (World Meteorological Organization):** *Guide to Meteorological Instruments and Methods of Observation.*
* **India Meteorological Department (IMD):** *AWS Network Guidelines and Quality Assurance Protocols.*
* **Liu, Ting & Zhou (2008):** *Isolation Forest.* IEEE ICDM.
* **Lundberg & Lee (2017):** *A Unified Approach to Interpreting Model Predictions (SHAP).* NeurIPS.
* **LangChain & LangGraph (2024–2026):** *Stateful Multi-Agent Workflows.*
