import os
import warnings
import pandas as pd
import numpy as np
import joblib

warnings.filterwarnings("ignore")

_MODEL = None
_SCALER = None
_MODELS_DIR = "ml/models"

def _get_resource_path(filename):
    """
    Finds the model or scaler file across common workspace directory structures.
    """
    candidates = [
        os.path.join(_MODELS_DIR, filename),
        os.path.join("models", filename),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "models", filename),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", filename),
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return os.path.join(_MODELS_DIR, filename)

def _load_resources():
    """
    Lazy loads the Isolation Forest model and StandardScaler.
    """
    global _MODEL, _SCALER
    if _MODEL is None or _SCALER is None:
        model_path = _get_resource_path("anomaly_model.pkl")
        scaler_path = _get_resource_path("scaler.pkl")
        
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            raise FileNotFoundError(
                f"Model or Scaler not found. Please run the training pipeline first.\n"
                f"Searched locations include:\n  - {model_path}\n  - {scaler_path}"
            )
            
        _MODEL = joblib.load(model_path)
        _SCALER = joblib.load(scaler_path)

def check_physical_rules(temp, pressure, humidity, temp_diff=0.0, pressure_diff=0.0, humidity_diff=0.0,
                         temp_roll_std=None, pressure_roll_std=None, humidity_roll_std=None):
    """
    Rule-Based Hybrid Engine:
    Checks if values violate absolute thermodynamic boundaries, meteorological thresholds,
    or stuck sensor flatline patterns.
    
    Returns:
    --------
    str or None: Description of rule violated, or None if reading is physically plausible.
    """
    # 1. Absolute physical range limits
    if not (0.0 <= humidity <= 100.0):
        return f"Invalid Humidity ({humidity}%): Must be between 0% and 100%"
        
    if not (-50.0 <= temp <= 60.0):
        return f"Invalid Temperature ({temp}°C): Must be between -50°C and 60°C"
        
    if not (800.0 <= pressure <= 1100.0):
        return f"Invalid Pressure ({pressure} hPa): Must be between 800 hPa and 1100 hPa"
        
    # 2. Extreme rate of change limits (e.g. impossible physical leaps in 10 minutes)
    if abs(temp_diff) > 5.0:
        return f"Extreme Temp Leap ({temp_diff}°C in 10 mins): Exceeds maximum physical gradient of 5°C/10mins"
        
    if abs(pressure_diff) > 10.0:
        return f"Extreme Pressure Drop/Spike ({pressure_diff} hPa in 10 mins): Exceeds maximum physical gradient of 10 hPa/10mins"
        
    if abs(humidity_diff) > 30.0:
        return f"Extreme Humidity Leap ({humidity_diff}% in 10 mins): Exceeds maximum physical gradient of 30%/10mins"
        
    # 3. Stuck sensor flatline checks (only if full 1-hour/6-record window is available)
    if temp_roll_std is not None and temp_roll_std == 0.0:
        return f"Stuck Sensor: Temperature flatlined at {temp}°C for 1 hour"
        
    if pressure_roll_std is not None and pressure_roll_std == 0.0:
        return f"Stuck Sensor: Pressure flatlined at {pressure} hPa for 1 hour"
        
    if humidity_roll_std is not None and humidity_roll_std == 0.0:
        return f"Stuck Sensor: Humidity flatlined at {humidity}% for 1 hour"
        
    return None

def predict_anomaly_with_history(current_reading, history_readings=None):
    """
    Advanced prediction function. Combines the current reading with history (the last 5 observations)
    to calculate rolling volatility and rate of change features before running the Hybrid Engine.
    
    Parameters:
    -----------
    current_reading : dict
        A dictionary containing keys: "temp", "pressure", "humidity", "timestamp", and optional "station_id".
    history_readings : list of dicts, optional
        A list of dicts representing chronological historical readings (last 5 intervals).
        If None or empty, rolling volatility features are defaulted to 0.0.
        
    Returns:
    --------
    dict
        Anomaly classification status and details.
    """
    # Initialize list of readings
    readings = []
    if history_readings is not None:
        readings.extend(history_readings)
    readings.append(current_reading)
    
    # 1. Create temporary DataFrame to engineer features
    df = pd.DataFrame(readings)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(by='timestamp').reset_index(drop=True)
    
    # 2. Extract consecutive differences (defaults first value to 0.0)
    df['temp_diff'] = df['temp'].diff().fillna(0.0)
    df['pressure_diff'] = df['pressure'].diff().fillna(0.0)
    df['humidity_diff'] = df['humidity'].diff().fillna(0.0)
    
    # 3. Extract rolling standard deviations (window = 6 observations = 1 hour)
    df['temp_roll_std_6'] = df['temp'].rolling(window=6, min_periods=1).std().fillna(0.0)
    df['pressure_roll_std_6'] = df['pressure'].rolling(window=6, min_periods=1).std().fillna(0.0)
    df['humidity_roll_std_6'] = df['humidity'].rolling(window=6, min_periods=1).std().fillna(0.0)
    
    # Extract the current reading row (the latest chronologically)
    latest_idx = df['timestamp'].idxmax()
    curr_row = df.loc[latest_idx]
    
    # Check if a full 1-hour window (6 readings) exists to run flatline checks safely
    has_full_window = len(df) >= 6
    
    # 4. Perform Rule-Based Hybrid checks first (incorporating flatline checks)
    rule_violation = check_physical_rules(
        temp=float(curr_row['temp']),
        pressure=float(curr_row['pressure']),
        humidity=float(curr_row['humidity']),
        temp_diff=float(curr_row['temp_diff']),
        pressure_diff=float(curr_row['pressure_diff']),
        humidity_diff=float(curr_row['humidity_diff']),
        temp_roll_std=float(curr_row['temp_roll_std_6']) if has_full_window else None,
        pressure_roll_std=float(curr_row['pressure_roll_std_6']) if has_full_window else None,
        humidity_roll_std=float(curr_row['humidity_roll_std_6']) if has_full_window else None
    )
    
    if rule_violation is not None:
        return {
            "status": "anomaly",
            "prediction": -1,
            "anomaly_score": -99.0, # Flagged absolute fallback score for rule triggers
            "rule_violation": rule_violation,
            "engine": "rule_based"
        }
        
    # 5. Extract temporal features
    hour = curr_row['timestamp'].hour
    month = curr_row['timestamp'].month
    day_of_year = curr_row['timestamp'].dayofyear
    
    # Assemble feature vector matching training columns
    feature_cols = [
        'temp', 'pressure', 'humidity', 
        'hour', 'month', 'day_of_year',
        'temp_roll_std_6', 'pressure_roll_std_6', 'humidity_roll_std_6',
        'temp_diff', 'pressure_diff', 'humidity_diff'
    ]
    
    feature_vector = pd.DataFrame([[
        curr_row['temp'], curr_row['pressure'], curr_row['humidity'],
        hour, month, day_of_year,
        curr_row['temp_roll_std_6'], curr_row['pressure_roll_std_6'], curr_row['humidity_roll_std_6'],
        curr_row['temp_diff'], curr_row['pressure_diff'], curr_row['humidity_diff']
    ]], columns=feature_cols)
    
    # 6. Run Isolation Forest ML Prediction
    _load_resources()
    feature_scaled = _SCALER.transform(feature_vector)
    feature_scaled_df = pd.DataFrame(feature_scaled, columns=feature_cols)
    
    pred = int(_MODEL.predict(feature_scaled_df)[0])
    score = float(_MODEL.decision_function(feature_scaled_df)[0])
    status = "anomaly" if pred == -1 else "normal"
    
    result = {
        "status": status,
        "prediction": pred,
        "anomaly_score": round(score, 4),
        "rule_violation": None,
        "engine": "isolation_forest"
    }
    
    # If ML model flags an anomaly, generate SHAP explanation and return raw feature contributions
    if pred == -1:
        try:
            try:
                from ml.src.explain import explain_local_anomaly
            except ImportError:
                try:
                    from src.explain import explain_local_anomaly
                except ImportError:
                    from explain import explain_local_anomaly
            shap_contributions = explain_local_anomaly(feature_vector, output_path="ml/outputs/latest_anomaly_explanation.png")
            result["shap_contributions"] = shap_contributions
        except Exception as e:
            print(f"Warning: Failed to generate SHAP explanation: {e}")
            result["shap_contributions"] = []
            
    return result

# Retain old signature for backward compatibility with simple 3-feature queries
def predict_anomaly(temp, pressure, humidity, timestamp=None):
    """
    Simplified predictor. Runs with default values for diff and rolling std.
    """
    curr = {
        "temp": temp,
        "pressure": pressure,
        "humidity": humidity,
        "timestamp": timestamp if timestamp is not None else pd.Timestamp.now()
    }
    return predict_anomaly_with_history(curr, history_readings=None)

if __name__ == "__main__":
    print("Testing hybrid predictor script (requires model training file)...")
    try:
        # Mock History: Normal readings over 50 minutes (5 records)
        history = [
            {"temp": 2.1, "pressure": 1008.2, "humidity": 89.0, "timestamp": "2020-01-01 00:10:00"},
            {"temp": 2.2, "pressure": 1008.1, "humidity": 89.2, "timestamp": "2020-01-01 00:20:00"},
            {"temp": 2.2, "pressure": 1008.0, "humidity": 89.1, "timestamp": "2020-01-01 00:30:00"},
            {"temp": 2.3, "pressure": 1007.9, "humidity": 88.9, "timestamp": "2020-01-01 00:40:00"},
            {"temp": 2.3, "pressure": 1007.9, "humidity": 88.8, "timestamp": "2020-01-01 00:50:00"},
        ]
        
        # Test 1: Normal reading
        curr_normal = {"temp": 2.4, "pressure": 1007.8, "humidity": 88.7, "timestamp": "2020-01-01 01:00:00"}
        res1 = predict_anomaly_with_history(curr_normal, history)
        print("\nTest 1 (Normal Scenario):")
        print(res1)
        
        # Test 2: Physical Limit Violation (Humidity > 100)
        curr_rule_invalid = {"temp": 2.4, "pressure": 1007.8, "humidity": 120.0, "timestamp": "2020-01-01 01:00:00"}
        res2 = predict_anomaly_with_history(curr_rule_invalid, history)
        print("\nTest 2 (Physical Range Failure):")
        print(res2)
        
        # Test 3: Extreme temporal leap (Temperature leaps by 8 degrees in 10 minutes)
        curr_jump = {"temp": 10.4, "pressure": 1007.8, "humidity": 88.7, "timestamp": "2020-01-01 01:00:00"}
        res3 = predict_anomaly_with_history(curr_jump, history)
        print("\nTest 3 (Rate of Change Failure):")
        print(res3)
        
    except Exception as e:
        print(f"Error testing: {e}")
