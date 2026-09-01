"""
SkyGuard AI — LangGraph End-to-End Demo & Verification Script
SIH 2026 Problem Statement 26073
"""

import os
import sys
import json
import warnings
import pandas as pd

warnings.filterwarnings("ignore")

# Ensure workspace root and src directory are in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, BASE_DIR)
sys.path.insert(0, os.path.join(BASE_DIR, "src"))

try:
    from ml.src.predict import predict_anomaly_with_history
except ImportError:
    from src.predict import predict_anomaly_with_history

from src.pipeline.graph import process_flagged_reading

def run_demo():
    print("=" * 78)
    print("       SkyGuard AI — LangGraph GenAI / Agentic Pipeline Demo")
    print("=" * 78)

    # -------------------------------------------------------------------------
    # SCENARIO 1: Isolation Forest Multi-Dimensional Anomaly (with SHAP)
    # -------------------------------------------------------------------------
    print("\n" + "#" * 78)
    print("  SCENARIO 1: ISOLATION FOREST ANOMALY (SHAP ATTRIBUTION PIPELINE)")
    print("#" * 78)

    pred_csv = os.path.join(BASE_DIR, "outputs", "predictions.csv")
    if not os.path.exists(pred_csv):
        pred_csv = os.path.join(BASE_DIR, "ml", "outputs", "predictions.csv")

    df = pd.read_csv(pred_csv)
    anom_row = df[df['anomaly'] == -1].sort_values(by='anomaly_score').iloc[0]
    station_df = df[df['station_id'] == anom_row['station_id']]
    station_df['timestamp'] = pd.to_datetime(station_df['timestamp'])
    target_time = pd.to_datetime(anom_row['timestamp'])
    history_df = station_df[station_df['timestamp'] < target_time].tail(5)

    history_1 = history_df[['temp', 'pressure', 'humidity', 'timestamp']].to_dict(orient='records')
    reading_1 = {
        "temp": float(anom_row['temp']),
        "pressure": float(anom_row['pressure']),
        "humidity": float(anom_row['humidity']),
        "timestamp": str(anom_row['timestamp']),
        "station_id": str(anom_row['station_id'])
    }

    print(f"Reading: Temp={reading_1['temp']}°C, Pressure={reading_1['pressure']} hPa, Humidity={reading_1['humidity']}%")
    print(f"Station: {reading_1['station_id']}, Timestamp: {reading_1['timestamp']}")

    print("\n[1] Running ML Prediction & SHAP Engine...")
    ml_output_1 = predict_anomaly_with_history(reading_1, history_1)
    print(f"    Status: {ml_output_1.get('status')}")
    print(f"    Engine: {ml_output_1.get('engine')}")
    print(f"    Anomaly Score: {ml_output_1.get('anomaly_score')}")
    print(f"    SHAP Contributions: {len(ml_output_1.get('shap_contributions', []))} features extracted")
    if ml_output_1.get('shap_contributions'):
        top3 = ml_output_1['shap_contributions'][:3]
        print(f"    Top 3 SHAP Drivers: {top3}")

    print("\n[2] Executing LangGraph Multi-Node Pipeline...")
    res_1 = process_flagged_reading(
        reading=reading_1,
        ml_output=ml_output_1,
        history_readings=history_1,
        incident_id="AN-10229"
    )

    print("\n>>> Output Object (Frontend Contract):")
    print(json.dumps(res_1, indent=2))

    # Assertions for Scenario 1
    assert res_1["id"] == "AN-10229"
    assert res_1["severity"] in ["critical", "warning", "normal"]
    assert res_1["confidence"] >= 70.0
    assert "maintenanceRisk" in res_1

    # -------------------------------------------------------------------------
    # SCENARIO 2: Rule-Based Interception (Injected Temperature Spike)
    # -------------------------------------------------------------------------
    print("\n" + "#" * 78)
    print("  SCENARIO 2: RULE-BASED ENGINE INTERCEPTION (EXTREME TEMP LEAP)")
    print("#" * 78)

    history_2 = [
        {"temp": 24.5, "pressure": 1012.4, "humidity": 68.0, "timestamp": "2026-08-30T10:00:00", "station_id": "AWS-DEL-01"},
        {"temp": 24.6, "pressure": 1012.5, "humidity": 67.8, "timestamp": "2026-08-30T10:10:00", "station_id": "AWS-DEL-01"},
        {"temp": 24.7, "pressure": 1012.3, "humidity": 68.1, "timestamp": "2026-08-30T10:20:00", "station_id": "AWS-DEL-01"},
        {"temp": 24.6, "pressure": 1012.4, "humidity": 67.9, "timestamp": "2026-08-30T10:30:00", "station_id": "AWS-DEL-01"},
        {"temp": 24.8, "pressure": 1012.6, "humidity": 67.5, "timestamp": "2026-08-30T10:40:00", "station_id": "AWS-DEL-01"},
    ]
    reading_2 = {
        "temp": 55.0,
        "pressure": 1012.6,
        "humidity": 67.2,
        "timestamp": "2026-08-30T10:41:52",
        "station_id": "AWS-DEL-01"
    }

    print(f"Reading: Temp={reading_2['temp']}°C (jump from 24.8°C), Station={reading_2['station_id']}")
    print("\n[1] Running ML Prediction & Rule Engine...")
    ml_output_2 = predict_anomaly_with_history(reading_2, history_2)
    print(f"    Status: {ml_output_2.get('status')}")
    print(f"    Engine: {ml_output_2.get('engine')}")
    print(f"    Rule Violation: {ml_output_2.get('rule_violation')}")

    print("\n[2] Executing LangGraph Multi-Node Pipeline...")
    res_2 = process_flagged_reading(
        reading=reading_2,
        ml_output=ml_output_2,
        history_readings=history_2,
        incident_id="AN-10231"
    )

    print("\n>>> Output Object (Frontend Contract):")
    print(json.dumps(res_2, indent=2))

    # Assertions for Scenario 2
    assert res_2["id"] == "AN-10231"
    assert res_2["severity"] == "critical"
    assert res_2["confidence"] >= 95.0
    assert len(res_2["probableRootCause"]) > 0 and ("spike" in res_2["probableRootCause"].lower() or "sensor" in res_2["probableRootCause"].lower())

    print("\n" + "=" * 78)
    print("  ALL TESTS & PIPELINE SCENARIOS PASSED SUCCESSFULLY!")
    print("=" * 78)

if __name__ == "__main__":
    run_demo()
