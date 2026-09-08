"""
SkyGuard AI — FastAPI Web Backend Server
SIH 2026 Problem Statement 26073

Provides RESTful endpoints for real-time sensor streaming, station telemetry,
sliding window historical series, and on-demand ML/LangGraph anomaly diagnostic contracts.
"""

import os
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Resilient import of state store
try:
    from src.api.state_store import STORE
except ImportError:
    try:
        from api.state_store import STORE
    except ImportError:
        from state_store import STORE

# Initialize FastAPI App
app = FastAPI(
    title="SkyGuard AI — Weather Intelligence API",
    description="Real-time hybrid anomaly detection and agentic GenAI diagnostic pipeline for Automatic Weather Stations (AWS).",
    version="2.0.0"
)

# Enable CORS for local Vite dev server and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Request Models
class ObservationIngestRequest(BaseModel):
    station_id: str = Field(..., example="AWS-DEL-01")
    temp: float = Field(..., example=24.6)
    pressure: float = Field(..., example=1012.4)
    humidity: float = Field(..., example=68.0)
    timestamp: Optional[str] = Field(None, example="2026-08-30 10:41:52")

class SimulateAnomalyRequest(BaseModel):
    station_id: Optional[str] = Field("AWS-DEL-01", example="AWS-DEL-01")
    anomaly_type: Optional[str] = Field("spike", example="spike")  # 'spike', 'freeze', 'humidity_spike'

# Endpoints
@app.get("/")
def root():
    return {
        "service": "SkyGuard AI Real-Time Anomaly Detection API",
        "status": "online",
        "docs_url": "/docs",
        "version": "2.0.0"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": os.environ.get("SERVER_START", "live"),
        "stations_monitored": len(STORE.stations)
    }

@app.get("/api/stations")
def get_stations():
    """
    Returns all 12 AWS stations with live status, position, and latest readings.
    """
    return STORE.get_stations()

@app.get("/api/stations/{station_id}/series")
def get_station_series(station_id: str):
    """
    Returns 60-minute sliding window time-series observations for interactive charts.
    """
    series = STORE.get_station_series(station_id)
    if not series:
        raise HTTPException(status_code=404, detail=f"Station '{station_id}' not found.")
    return series

@app.get("/api/stats")
def get_network_stats():
    """
    Returns network-wide KPI metrics and sparkline history.
    """
    return STORE.get_stats()

@app.get("/api/anomalies")
def get_anomalies():
    """
    Returns list of recent anomaly incidents.
    """
    return STORE.get_anomalies()

@app.get("/api/anomalies/{anomaly_id}")
def get_anomaly_detail(anomaly_id: str):
    """
    Returns full LangGraph diagnostic detail (matching AnomalyFrontendContract).
    """
    detail = STORE.get_anomaly_detail(anomaly_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Anomaly incident '{anomaly_id}' not found.")
    return detail

@app.post("/api/ingest")
def ingest_observation(payload: ObservationIngestRequest):
    """
    Live ingestion endpoint: evaluates incoming observation through Hybrid ML Engine
    and executes LangGraph GenAI pipeline if an anomaly is detected.
    """
    reading = payload.model_dump()
    result = STORE.ingest_reading(reading)
    return result

@app.post("/api/simulate-anomaly")
def trigger_simulate_anomaly(payload: Optional[SimulateAnomalyRequest] = Body(default=None)):
    """
    Interactive demonstration endpoint: injects a realistic sensor anomaly
    into the selected station and returns the full diagnostic contract.
    """
    station_id = payload.station_id if payload else "AWS-DEL-01"
    anomaly_type = payload.anomaly_type if payload else "spike"
    
    result = STORE.simulate_anomaly(station_id=station_id, anomaly_type=anomaly_type)
    return result

@app.get("/api/alerts/status")
def get_alert_status():
    """
    Returns the current alert dispatcher configuration (recipient, SMTP configured, mode).
    """
    smtp_user = os.getenv("SMTP_USER", "").strip()
    recipient = os.getenv("ALERT_RECIPIENT_EMAIL", "").strip()
    return {
        "configured": bool(smtp_user and recipient),
        "smtp_server": os.getenv("SMTP_SERVER", "smtp.gmail.com"),
        "sender_email": smtp_user if smtp_user else "Not set (simulation mode active)",
        "recipient_email": recipient if recipient else "Not set (simulation mode active)",
        "mode": "live_smtp" if (smtp_user and recipient) else "simulation"
    }

@app.post("/api/alerts/test")
def test_alert_dispatch(payload: Optional[Dict[str, Any]] = Body(default=None)):
    """
    Manual test endpoint to verify email dispatching for a sample anomaly.
    """
    try:
        from src.api.alert_service import send_email_alert
    except ImportError:
        try:
            from api.alert_service import send_email_alert
        except ImportError:
            from alert_service import send_email_alert

    station_id = payload.get("station_id", "AWS-SXR-11") if payload else "AWS-SXR-11"
    sample_incident = {
        "id": "AN-TEST-99",
        "station": station_id,
        "stationName": "Srinagar, Jammu & Kashmir",
        "parameter": "Temperature",
        "severity": "critical",
        "confidence": 98.5,
        "observed": 55.0,
        "expected": 14.2,
        "correction": 14.2,
        "probableRootCause": "Sensor Spike / Transducer Malfunction",
        "aiAssessment": "Test alert: ambient temperature jumped abruptly to 55.0°C exceeding maximum physical rate-of-change constraints.",
        "recommendedAction": "Inspect temperature sensor cabling and verify calibration against baseline."
    }
    result = send_email_alert(sample_incident, force=True)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
