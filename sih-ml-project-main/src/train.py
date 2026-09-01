import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from ml.src.data_preprocessing import WeatherDataPreprocessor

def train_pipeline(data_path, contamination_list=[0.01, 0.02, 0.05], default_contamination=0.02, random_state=42):
    print("=== Training Pipeline Starting ===")
    
    # 1. Load data
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")
    
    df = pd.read_csv(data_path)
    print(f"Loaded raw data: {df.shape[0]} rows.")
    
    # 2. Preprocess data
    preprocessor = WeatherDataPreprocessor()
    preprocessor.inspect_data(df)
    
    print("Fitting preprocessing scaler and engineering features...")
    df_clean_scaled, df_feat = preprocessor.fit_transform(df)
    
    # Features used for Isolation Forest
    feature_cols = preprocessor.feature_cols
    X = df_clean_scaled[feature_cols]
    
    print(f"Features selected for Isolation Forest ({len(feature_cols)} total): {feature_cols}")
    
    # 3. Experiment with contamination values
    results = {}
    print("\n--- Experimenting with Contamination Values ---")
    for cont in contamination_list:
        model = IsolationForest(contamination=cont, random_state=random_state, n_estimators=100)
        preds = model.fit_predict(X)
        
        anomaly_count = np.sum(preds == -1)
        anomaly_pct = (anomaly_count / len(preds)) * 100
        print(f"Contamination = {cont:.2f}: {anomaly_count} potential anomalies found ({anomaly_pct:.2f}%)")
        results[cont] = {
            "model": model,
            "anomaly_count": anomaly_count,
            "anomaly_pct": anomaly_pct,
            "predictions": preds
        }
    
    print(f"\nSelecting default contamination = {default_contamination} for final model.")
    final_model = results[default_contamination]["model"]
    
    # Train the final model and save outputs
    df_feat['anomaly'] = results[default_contamination]["predictions"]
    df_feat['anomaly_score'] = final_model.decision_function(X)
    
    # Save the processed dataset containing predictions
    output_dir = "ml/outputs"
    os.makedirs(output_dir, exist_ok=True)
    predictions_path = os.path.join(output_dir, "predictions.csv")
    df_feat.to_csv(predictions_path, index=False)
    print(f"Saved processed dataset with predictions and engineered features to {predictions_path}")
    
    # 4. Save trained models/preprocessors
    models_dir = "ml/models"
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "anomaly_model.pkl")
    
    joblib.dump(final_model, model_path)
    print(f"Saved final trained model to {model_path}")
    
    preprocessor.save_scaler()
    print("=== Training Pipeline Completed Successfully ===\n")

if __name__ == "__main__":
    csv_data_path = r"c:\Users\Lenovo\OneDrive\Documents\somil personal\ml\data\weather_data.csv"
    train_pipeline(csv_data_path)
