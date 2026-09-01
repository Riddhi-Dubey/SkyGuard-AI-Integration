"""
SkyGuard AI — LangGraph Node Definitions
SIH 2026 Problem Statement 26073
"""

import os
import json
import numpy as np
from typing import Dict, Any, List
from dotenv import load_dotenv

from .state import PipelineAgentState, AnomalyFrontendContract, MaintenanceRisk
from .tools import query_station_24h_anomaly_count, get_station_name

# Load environment variables
load_dotenv()

# Feature display and parameter mappings
FEATURE_DISPLAY_MAP = {
    "temp": ("Temperature", "Temperature"),
    "temp_diff": ("Temperature Delta", "Temperature"),
    "temp_roll_std_6": ("Rolling Temperature Std", "Temperature"),
    "pressure": ("Pressure", "Pressure"),
    "pressure_diff": ("Pressure Delta", "Pressure"),
    "pressure_roll_std_6": ("Rolling Pressure Std", "Pressure"),
    "humidity": ("Humidity", "Humidity"),
    "humidity_diff": ("Humidity Delta", "Humidity"),
    "humidity_roll_std_6": ("Rolling Humidity Std", "Humidity"),
    "hour": ("Hour of Day", "Temporal"),
    "month": ("Month", "Temporal"),
    "day_of_year": ("Day of Year", "Temporal"),
}

PARAM_KEY_MAP = {
    "Temperature": "temp",
    "Pressure": "pressure",
    "Humidity": "humidity"
}

# ==============================================================================
# NODE 1: Score Calibration (Deterministic, Zero LLM)
# ==============================================================================
def score_calibration_node(state: PipelineAgentState) -> Dict[str, Any]:
    """
    Calibrates raw ML Isolation Forest decision score or rule violation into
    a 0-100% confidence percentage and maps to critical/warning/normal severity tiers.
    """
    ml_output = state.get("ml_output", {})
    rule_violation = ml_output.get("rule_violation")
    engine = ml_output.get("engine", "isolation_forest")
    anomaly_score = ml_output.get("anomaly_score", 0.0)

    # 1. Rule-Based Interceptions: Hard physical boundary/flatline failures
    if rule_violation is not None or engine == "rule_based":
        confidence = 98.5
        severity = "critical"
        return {"confidence": confidence, "severity": severity}

    # 2. Isolation Forest Decision Function Calibration
    # Isolation Forest decision scores: negative = anomalous (e.g. -0.05 to -0.35), positive = normal
    if anomaly_score <= 0.0:
        # Scale anomaly score from [-0.35, 0.0] into [70.0, 99.5] confidence
        abs_score = abs(float(anomaly_score))
        scaled_confidence = 72.0 + (abs_score / 0.25) * 26.0
        confidence = round(min(99.5, max(70.0, scaled_confidence)), 1)
    else:
        # Normal reading: lower anomaly confidence
        scaled_confidence = max(10.0, min(68.0, 50.0 - float(anomaly_score) * 100.0))
        confidence = round(scaled_confidence, 1)

    # 3. Severity Bucketing
    if confidence >= 90.0:
        severity = "critical"
    elif confidence >= 70.0:
        severity = "warning"
    else:
        severity = "normal"

    return {
        "confidence": confidence,
        "severity": severity
    }


# ==============================================================================
# NODE 2: SHAP & Parameter Formatting (Deterministic, Zero LLM)
# ==============================================================================
def shap_formatting_node(state: PipelineAgentState) -> Dict[str, Any]:
    """
    Extracts top feature contribution, maps raw features to human-readable labels,
    determines the primary anomalous parameter, and classifies the root-cause category.
    """
    ml_output = state.get("ml_output", {})
    current_reading = state.get("current_reading", {})
    shap_raw = ml_output.get("shap_contributions", [])
    rule_violation = ml_output.get("rule_violation")

    # 1. Format SHAP contributions with display names
    formatted_shap: List[Dict[str, Any]] = []
    top_feature_key = "temp"
    
    if shap_raw and isinstance(shap_raw, list):
        for item in shap_raw:
            raw_feat = item.get("feature", "")
            val = item.get("value", 0.0)
            display_name, _ = FEATURE_DISPLAY_MAP.get(raw_feat, (raw_feat, "Temperature"))
            formatted_shap.append({
                "feature": display_name,
                "value": round(float(val), 2)
            })
        if shap_raw:
            top_feature_key = shap_raw[0].get("feature", "temp")

    # 2. Parameter Detection
    parameter = "Temperature"
    if rule_violation:
        rv_lower = rule_violation.lower()
        if "pressure" in rv_lower:
            parameter = "Pressure"
        elif "humidity" in rv_lower:
            parameter = "Humidity"
        elif "temp" in rv_lower:
            parameter = "Temperature"
    elif shap_raw:
        # Map from top feature
        _, detected_param = FEATURE_DISPLAY_MAP.get(top_feature_key, ("Temperature", "Temperature"))
        if detected_param in ["Temperature", "Pressure", "Humidity"]:
            parameter = detected_param
        else:
            # If top feature is temporal, pick the highest meteorological feature
            for item in shap_raw:
                f_key = item.get("feature", "")
                _, p = FEATURE_DISPLAY_MAP.get(f_key, ("", ""))
                if p in ["Temperature", "Pressure", "Humidity"]:
                    parameter = p
                    break

    # 3. Root Cause Classification
    root_cause_category = "Sensor Anomaly"
    if rule_violation:
        rv_lower = rule_violation.lower()
        if "flatline" in rv_lower or "stuck" in rv_lower:
            root_cause_category = "Frozen Sensor"
        elif "extreme" in rv_lower or "leap" in rv_lower or "spike" in rv_lower:
            root_cause_category = "Sensor Spike"
        elif "invalid" in rv_lower or "range" in rv_lower:
            root_cause_category = "Out of Bounds Range Violation"
    elif top_feature_key.endswith("_diff"):
        root_cause_category = "Sensor Spike"
    elif top_feature_key.endswith("_roll_std_6"):
        root_cause_category = "Calibration Drift"
    elif top_feature_key in ["temp", "pressure", "humidity"]:
        root_cause_category = "Possible Sensor Drift"

    # 4. Extract Observed Value for the anomalous parameter
    param_key = PARAM_KEY_MAP.get(parameter, "temp")
    observed = float(current_reading.get(param_key, 0.0))

    top_display_feature, _ = FEATURE_DISPLAY_MAP.get(top_feature_key, (top_feature_key, parameter))

    return {
        "parameter": parameter,
        "observed": round(observed, 1),
        "top_feature": top_display_feature,
        "root_cause_category": root_cause_category,
        "shap_contributions_formatted": formatted_shap
    }


# ==============================================================================
# NODE 3: Correction Estimate (Deterministic, Zero LLM)
# ==============================================================================
def correction_estimate_node(state: PipelineAgentState) -> Dict[str, Any]:
    """
    Computes expected baseline and suggested corrected values via temporal interpolation
    and rolling history stability scoring.
    """
    current_reading = state.get("current_reading", {})
    history_readings = state.get("history_readings", [])
    
    # Infer parameter if not already set (runs concurrently)
    parameter = state.get("parameter", "Temperature")
    param_key = PARAM_KEY_MAP.get(parameter, "temp")
    
    observed = float(current_reading.get(param_key, 0.0))

    # Extract historical readings for this parameter
    hist_vals = [
        float(r[param_key]) 
        for r in history_readings 
        if isinstance(r, dict) and param_key in r and r[param_key] is not None
    ]

    if len(hist_vals) >= 1:
        # Calculate expected baseline from recent chronological window
        expected = round(float(np.mean(hist_vals)), 1)
        
        # Smoothed correction estimate
        correction = expected
        
        # Calculate stability confidence (lower variance = higher confidence)
        std_val = float(np.std(hist_vals)) if len(hist_vals) > 1 else 0.2
        confidence_calc = 96.0 - (std_val * 6.0)
        correction_confidence = round(min(98.0, max(65.0, confidence_calc)), 1)
        correction_method = "Temporal interpolation + local station context"
    else:
        # Fallback if no history is provided
        expected = round(observed, 1)
        correction = round(observed, 1)
        correction_confidence = 50.0
        correction_method = "Baseline fallback (insufficient history)"

    return {
        "expected": expected,
        "correction": correction,
        "correction_method": correction_method,
        "correction_confidence": correction_confidence
    }


# ==============================================================================
# NODE 4: Maintenance Risk (Tool Call / PostgreSQL Query, Zero LLM)
# ==============================================================================
def maintenance_risk_node(state: PipelineAgentState) -> Dict[str, Any]:
    """
    Queries PostgreSQL for 24-hour station incident frequency and calculates
    the maintenance risk gauge score and categorical level.
    """
    station_id = state.get("station_id") or state.get("current_reading", {}).get("station_id", "AWS-DEL-01")
    
    # Execute database query tool (or fallback stub)
    incident_count = query_station_24h_anomaly_count(station_id)
    
    # Map frequency to risk categories
    if incident_count <= 1:
        level = "LOW"
        score = incident_count * 20
    elif incident_count <= 3:
        level = "MEDIUM"
        score = 40 + (incident_count - 2) * 15
    elif incident_count <= 6:
        level = "MEDIUM-HIGH"
        score = 70 + (incident_count - 4) * 4  # e.g., 5 -> 74
    else:
        level = "HIGH"
        score = min(100, 85 + (incident_count - 7) * 2)

    return {
        "maintenance_level": level,
        "maintenance_score": int(score),
        "maintenance_raw_data": {
            "count": incident_count,
            "window_hours": 24
        }
    }


# ==============================================================================
# NODE 5: Grounded Narration (Groq LLM Node with openai/gpt-oss-120b)
# ==============================================================================
def narration_llm_node(state: PipelineAgentState) -> Dict[str, Any]:
    """
    Generates explainable, grounded narrative fields using Groq LLM (model: openai/gpt-oss-120b).
    Strictly references computed state numbers and falls back to deterministic templated text if offline.
    """
    # Extract merged values
    incident_id = state.get("id", "AN-10231")
    station_id = state.get("station_id") or state.get("current_reading", {}).get("station_id", "AWS-DEL-01")
    station_name = state.get("station_name") or get_station_name(station_id)
    
    parameter = state.get("parameter", "Temperature")
    severity = state.get("severity", "critical")
    confidence = state.get("confidence", 96.8)
    
    # Ensure parameter-aligned observed value
    param_key = PARAM_KEY_MAP.get(parameter, "temp")
    observed = state.get("observed", float(state.get("current_reading", {}).get(param_key, 55.0)))
    expected = state.get("expected", 24.7)
    correction = state.get("correction", expected)
    correction_method = state.get("correction_method", "Temporal interpolation + local station context")
    correction_confidence = state.get("correction_confidence", 91.4)
    
    root_cause_category = state.get("root_cause_category", "Sensor Spike")
    top_feature = state.get("top_feature", "Temperature Delta")
    
    m_level = state.get("maintenance_level", "MEDIUM-HIGH")
    m_score = state.get("maintenance_score", 78)
    m_raw = state.get("maintenance_raw_data", {"count": 5, "window_hours": 24})
    count = m_raw.get("count", 5)
    window_hours = m_raw.get("window_hours", 24)

    unit = "°C" if parameter == "Temperature" else " hPa" if parameter == "Pressure" else "%"

    # Default Deterministic Fallback Template
    fallback_ai_assessment = (
        f"{parameter} shifted abruptly from expected {expected}{unit} to observed {observed}{unit} "
        f"within one observation interval. The magnitude and rate of change ({top_feature}) are "
        f"inconsistent with recent temporal baselines for {station_name}."
    )
    fallback_probable_cause = f"{root_cause_category} / Possible Sensor Malfunction"
    fallback_action = f"Inspect {parameter.lower()} sensor hardware and verify calibration against station baseline."
    fallback_m_reason = f"Repeated {parameter.lower()} anomalies ({count} incidents) detected in the last {window_hours} hours."

    ai_assessment = fallback_ai_assessment
    probable_root_cause = fallback_probable_cause
    recommended_action = fallback_action
    maintenance_reason = fallback_m_reason

    # Attempt Groq LLM Generation
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        try:
            from langchain_groq import ChatGroq
            from langchain_core.messages import SystemMessage, HumanMessage

            llm = ChatGroq(
                groq_api_key=groq_api_key,
                model_name="openai/gpt-oss-120b",
                temperature=0.1,
                max_tokens=1200,
                model_kwargs={"response_format": {"type": "json_object"}}
            )

            system_prompt = (
                "You are SkyGuard AI, an expert meteorologist and weather sensor diagnostics system. "
                "Your task is to generate concise, highly professional narrative explanations for flagged sensor anomalies. "
                "STRICT CONSTRAINT: You must ONLY reference the exact numbers and categories provided in the context. "
                "Never invent or modify numeric values. Output your response as a valid JSON object with keys: "
                "'aiAssessment', 'probableRootCause', 'recommendedAction', 'maintenanceReason'."
            )

            user_prompt = f"""
Context:
- Station: {station_id} ({station_name})
- Parameter: {parameter}
- Observed Value: {observed}{unit}
- Expected Value: {expected}{unit}
- Suggested Correction: {correction}{unit}
- Severity: {severity}
- Confidence: {confidence}%
- Primary Driver / Top Feature: {top_feature}
- Root Cause Category: {root_cause_category}
- 24h Incident Count: {count} in last {window_hours} hours
- Maintenance Risk: {m_level} (score {m_score}/100)

Requirements:
1. aiAssessment: 2-3 sentence narrative explaining the discrepancy, rate of change, and baseline divergence.
2. probableRootCause: Expand '{root_cause_category}' into a detailed diagnostic phrase.
3. recommendedAction: 1 clear actionable mitigation step for AWS field technicians.
4. maintenanceReason: 1 sentence explaining why maintenance risk is {m_level} using the {count} incidents in {window_hours} hours.

Respond with valid JSON:
{{"aiAssessment": "...", "probableRootCause": "...", "recommendedAction": "...", "maintenanceReason": "..."}}
"""
            response = llm.invoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ])

            content = response.content.strip()
            # Clean markdown codeblocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            content = content.strip()

            # Find first { and last } to isolate JSON
            first_brace = content.find('{')
            last_brace = content.rfind('}')
            if first_brace != -1 and last_brace != -1:
                content = content[first_brace:last_brace+1]

            parsed = json.loads(content)
            ai_assessment = parsed.get("aiAssessment", fallback_ai_assessment)
            probable_root_cause = parsed.get("probableRootCause", fallback_probable_cause)
            recommended_action = parsed.get("recommendedAction", fallback_action)
            maintenance_reason = parsed.get("maintenanceReason", fallback_m_reason)
        except Exception as e:
            print(f"Notice: Groq LLM call returned ({e}). Utilizing deterministic narration fallback.")

    # Assemble Final Frontend Contract
    final_output: AnomalyFrontendContract = {
        "id": incident_id,
        "station": station_id,
        "stationName": station_name,
        "parameter": parameter,
        "severity": severity,
        "confidence": confidence,
        "observed": observed,
        "expected": expected,
        "correction": correction,
        "correctionMethod": correction_method,
        "correctionConfidence": correction_confidence,
        "aiAssessment": ai_assessment,
        "probableRootCause": probable_root_cause,
        "recommendedAction": recommended_action,
        "maintenanceRisk": {
            "level": m_level,
            "score": m_score,
            "reason": maintenance_reason
        }
    }

    return {
        "ai_assessment": ai_assessment,
        "probable_root_cause": probable_root_cause,
        "recommended_action": recommended_action,
        "maintenance_reason": maintenance_reason,
        "final_output": final_output
    }
