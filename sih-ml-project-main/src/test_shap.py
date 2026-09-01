import os
import sys
import pandas as pd

# Ensure parent and src directory are in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from ml.src.predict import predict_anomaly_with_history
except ImportError:
    try:
        from src.predict import predict_anomaly_with_history
    except ImportError:
        from predict import predict_anomaly_with_history

def run_shap_test():
    print("==================================================")
    print("        Running SkyGuard AI SHAP Explainer Test   ")
    print("==================================================")
    
    # Load predictions
    predictions_path = "ml/outputs/predictions.csv" if os.path.exists("ml/outputs/predictions.csv") else "outputs/predictions.csv"
    if not os.path.exists(predictions_path):
        raise FileNotFoundError(f"Predictions not found at {predictions_path}. Run train.py first.")
        
    df = pd.read_csv(predictions_path)
    
    # Filter for ML anomalies
    ml_anomalies = df[df['anomaly'] == -1]
    print(f"Total ML anomalies detected in dataset: {len(ml_anomalies)}")
    
    if len(ml_anomalies) > 0:
        # Select the most anomalous record
        target_row = ml_anomalies.sort_values(by='anomaly_score').iloc[0]
        target_time = pd.to_datetime(target_row['timestamp'])
        
        # Reconstruct history for this station right before the target observation
        station_data = df[df['station_id'] == target_row['station_id']]
        station_data['timestamp'] = pd.to_datetime(station_data['timestamp'])
        station_data = station_data.sort_values(by='timestamp')
        
        history_df = station_data[station_data['timestamp'] < target_time].tail(5)
        
        history_readings = history_df[['temp', 'pressure', 'humidity', 'timestamp']].to_dict(orient='records')
        current_reading = {
            "temp": float(target_row['temp']),
            "pressure": float(target_row['pressure']),
            "humidity": float(target_row['humidity']),
            "timestamp": str(target_row['timestamp'])
        }
        
        print(f"\nAnalyzing anomaly on {current_reading['timestamp']}:")
        print(f"  - Temperature: {current_reading['temp']} °C")
        print(f"  - Pressure:    {current_reading['pressure']} hPa")
        print(f"  - Humidity:    {current_reading['humidity']}%")
        
        # Run prediction (this automatically triggers explain_local_anomaly)
        result = predict_anomaly_with_history(current_reading, history_readings)
        print("\nPrediction Result:")
        print(result)
        
        explanation_path = "ml/outputs/latest_anomaly_explanation.png"
        if os.path.exists(explanation_path):
            print(f"\nSuccess! SHAP waterfall explanation chart generated at:")
            print(f"  {os.path.abspath(explanation_path)}")
        else:
            print("\nError: Waterfall chart was not found.")
    else:
        print("No anomalies available for analysis.")
        
    print("\n==================================================")

if __name__ == "__main__":
    run_shap_test()
