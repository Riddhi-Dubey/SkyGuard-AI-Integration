# SkyGuard AI — ML Anomaly Detection Component

This repository contains the Machine Learning anomaly detection component for **SkyGuard AI** (a Smart India Hackathon project). 

The goal of this component is to detect potential sensor failures, transmission errors, or extreme weather events from Automatic Weather Stations (AWS) using a **Rule-Based Hybrid Engine** combined with an **unsupervised Isolation Forest model**.

---

## 📂 Project Structure

```
ml/
├── data/
│   └── weather_data.csv          # Raw sensor readings dataset
├── src/
│   ├── data_preprocessing.py     # Data cleaning, imputing, feature engineering (12 features)
│   ├── train.py                  # Model training and contamination comparison
│   ├── evaluation.py             # Performance evaluation, visualizations, and CP1252-safe reports
│   ├── predict.py                # Backend-friendly real-time Hybrid prediction API
│   └── test_hybrid.py            # Validation script for rules and stuck-sensor scenarios
├── models/
│   ├── anomaly_model.pkl         # Trained Isolation Forest model (12 dimensions)
│   └── scaler.pkl                # Preprocessing StandardScaler object
├── outputs/
│   ├── predictions.csv           # Processed dataset with anomaly flags & scores
│   ├── anomaly_score_distribution.png       # Score distribution plot
│   ├── anomaly_timeseries_visualization.png  # Sensor graphs showing anomaly points
│   └── anomaly_3d_scatter.png               # 3D scatter of anomalous observations
├── requirements.txt              # Project dependencies
└── README.md                     # Documentation (this file)
```

---

## 🛠️ Setup & Environment

1. **Python Version**: Python 3.8+ is recommended.
2. **Install Dependencies**:
   Navigate to the workspace directory and install the required packages:
   ```bash
   pip install -r ml/requirements.txt
   ```

---

## 🚀 How to Run the ML Pipeline

### Step 1: Train the Model
Run the training script to clean the data, engineer all 12 rolling and differential features, scale them, and train the Isolation Forest. By default, it uses `contamination=0.02` (2%).
```bash
# Set PYTHONPATH so Python can locate modules relative to the workspace root
$env:PYTHONPATH="."
python ml/src/train.py
```

### Step 2: Run Evaluation & Generate Visualizations
Run the evaluation script to calculate summary statistics, check temporal transitions, and save performance plots inside `ml/outputs/`.
```bash
python ml/src/evaluation.py
```

### Step 3: Run Validation Tests
Run the unit test script to verify that the Rule Engine successfully intercepts out-of-bound variables and stuck-sensor flatline scenarios:
```bash
python ml/src/test_hybrid.py
```

---

## 🧑‍💻 Integration Guide for the Backend Developer

The ML component is modularized to be imported directly by your backend application (e.g., Flask, FastAPI, Django, or generic scripts).

### 1. Import the History-Aware Prediction Function
Because rolling standard deviations and rates of change require historical context, you should pass the current reading along with a list containing the last 5 readings (representing the last hour at 10-minute intervals).

```python
import sys
# Ensure the backend knows where the ml scripts are
sys.path.append("/path/to/somil personal")

from ml.src.predict import predict_anomaly_with_history

# 1. Historical buffer: last 5 readings (10-minute intervals) sorted chronologically
history_readings = [
    {"temp": 2.5, "pressure": 1005.0, "humidity": 80.0, "timestamp": "2020-01-01 00:00:00"},
    {"temp": 2.6, "pressure": 1005.1, "humidity": 79.8, "timestamp": "2020-01-01 00:10:00"},
    {"temp": 2.4, "pressure": 1004.9, "humidity": 80.2, "timestamp": "2020-01-01 00:20:00"},
    {"temp": 2.5, "pressure": 1005.0, "humidity": 80.1, "timestamp": "2020-01-01 00:30:00"},
    {"temp": 2.7, "pressure": 1005.2, "humidity": 79.5, "timestamp": "2020-01-01 00:40:00"},
]

# 2. The live reading to be classified
current_reading = {"temp": 2.6, "pressure": 1005.1, "humidity": 79.9, "timestamp": "2020-01-01 00:50:00"}

# Execute inference
result = predict_anomaly_with_history(current_reading, history_readings)
print(result)

# Expected Output (Normal weather Scenario):
# {
#   "status": "normal",
#   "prediction": 1,
#   "anomaly_score": 0.1174,
#   "rule_violation": None,
#   "engine": "isolation_forest"
# }
```

### 2. Rule Engine Interception Output
If a reading violates the physical bounds or flatlines, the Rule Engine intercepts the execution immediately without loading the Isolation Forest model:

```python
# Scenario A: Temperature leaps abnormally by 6.8°C in 10 minutes (previous temp was 2.7°C)
current_jump = {"temp": 9.5, "pressure": 1005.1, "humidity": 79.9, "timestamp": "2020-01-01 00:50:00"}
result_jump = predict_anomaly_with_history(current_jump, history_readings)
print(result_jump)
# Output:
# {
#   "status": "anomaly",
#   "prediction": -1,
#   "anomaly_score": -99.0,
#   "rule_violation": "Extreme Temp Leap (6.8°C in 10 mins): Exceeds maximum physical gradient of 5°C/10mins",
#   "engine": "rule_based"
# }

# Scenario B: Temperature sensor freezes/flatlines (reports exactly 2.5°C over 1 hour)
flatline_history = [
    {"temp": 2.5, "pressure": 1005.0, "humidity": 80.0, "timestamp": "2020-01-01 00:00:00"},
    {"temp": 2.5, "pressure": 1005.0, "humidity": 80.0, "timestamp": "2020-01-01 00:10:00"},
    {"temp": 2.5, "pressure": 1005.0, "humidity": 80.0, "timestamp": "2020-01-01 00:20:00"},
    {"temp": 2.5, "pressure": 1005.0, "humidity": 80.0, "timestamp": "2020-01-01 00:30:00"},
    {"temp": 2.5, "pressure": 1005.0, "humidity": 80.0, "timestamp": "2020-01-01 00:40:00"},
]
current_flat = {"temp": 2.5, "pressure": 1005.0, "humidity": 80.0, "timestamp": "2020-01-01 00:50:00"}
result_flat = predict_anomaly_with_history(current_flat, flatline_history)
print(result_flat)
# Output:
# {
#   "status": "anomaly",
#   "prediction": -1,
#   "anomaly_score": -99.0,
#   "rule_violation": "Stuck Sensor: Temperature flatlined at 2.5°C for 1 hour",
#   "engine": "rule_based"
# }
```

### 3. Backward Compatibility
If the backend does not possess historical readings, a simple signature fallback is supported:
```python
from ml.src.predict import predict_anomaly
# Runs predictions using default values for differences and rolling volatility
result = predict_anomaly(temp=3.5, pressure=998.0, humidity=82.0)
```

---

## 🧠 ML Concepts & Design Choices

### 1. Hybrid Architecture
We combine rule-based check filters with an unsupervised Isolation Forest model. 
*   **Rule Engine**: Captures absolute errors (e.g. humidity $>100\%$, impossible temperature gradients) and hardware freezes (WMO-standard stuck-sensor flatline tests).
*   **Isolation Forest**: Captures multi-dimensional anomalies where no individual feature is out-of-bounds but the *combination* is highly anomalous (e.g. very warm temperature and very high pressure occurring at midnight in winter).

### 2. Feature Selection (12 Dimensions)
1. **Primary Weather**: `temp`, `pressure`, `humidity`
2. **Temporal Cycles**: `hour`, `month`, `day_of_year` (to capture diurnal/seasonal weather cycles)
3. **Volatility Volatility (1-hour window)**: `temp_roll_std_6`, `pressure_roll_std_6`, `humidity_roll_std_6`
4. **Consecutive Rates of Change**: `temp_diff`, `pressure_diff`, `humidity_diff`
*Note: Day of the week is excluded since weather is independent of human calendar weeks.*
