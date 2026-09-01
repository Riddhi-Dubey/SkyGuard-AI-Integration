import os
import warnings
import matplotlib.pyplot as plt
import shap
import joblib
import pandas as pd

warnings.filterwarnings("ignore")

_MODEL = None
_SCALER = None
_EXPLAINER = None
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
    Loads model, scaler, and initializes the TreeExplainer.
    """
    global _MODEL, _SCALER, _EXPLAINER
    if _MODEL is None or _SCALER is None or _EXPLAINER is None:
        model_path = _get_resource_path("anomaly_model.pkl")
        scaler_path = _get_resource_path("scaler.pkl")
        
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Trained model or scaler files not found at '{model_path}' or '{scaler_path}'. Run train.py first.")
            
        _MODEL = joblib.load(model_path)
        _SCALER = joblib.load(scaler_path)
        # TreeExplainer natively supports scikit-learn IsolationForest
        _EXPLAINER = shap.TreeExplainer(_MODEL)

def explain_local_anomaly(feature_vector_df, output_path="ml/outputs/latest_anomaly_explanation.png"):
    """
    Calculates SHAP values for a single observation, saves a waterfall explanation plot,
    and returns a structured list of feature attributions sorted by absolute impact.
    
    Parameters:
    -----------
    feature_vector_df : pd.DataFrame
        Unscaled 1-row DataFrame containing all 12 feature columns.
    output_path : str
        File path where the generated chart will be saved.

    Returns:
    --------
    list of dict
        List of feature contributions sorted descending by absolute SHAP value:
        [
            {"feature": "temp", "value": -0.7606},
            {"feature": "temp_roll_std_6", "value": -2.0917},
            ...
        ]
    """
    _load_resources()
    
    # 1. Scale the input using the fitted scaler
    feature_cols = list(feature_vector_df.columns)
    scaled_array = _SCALER.transform(feature_vector_df)
    scaled_df = pd.DataFrame(scaled_array, columns=feature_cols)
    
    # 2. Compute SHAP values for the scaled input
    # explainer(scaled_df) returns a shap.Explanation object containing values, base_values, and data
    shap_values = _EXPLAINER(scaled_df)
    
    # 3. Plot waterfall chart (preserved)
    plt.figure(figsize=(10, 6))
    
    # We pass the first (and only) explanation in the batch
    # Isolation Forest SHAP: positive values push the score higher (normal),
    # negative values push the score lower (anomalous)
    shap.plots.waterfall(shap_values[0], show=False)
    
    plt.title("Local SHAP Explanation: Feature Contributions to Anomaly Score", fontsize=12, pad=15)
    plt.tight_layout()
    
    # Ensure directory exists and save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Saved local SHAP explanation plot to {output_path}")

    # 4. Extract per-feature attribution values
    raw_values = shap_values[0].values
    contributions = []
    for col, val in zip(feature_cols, raw_values):
        contributions.append({
            "feature": str(col),
            "value": round(float(val), 4)
        })

    # 5. Sort descending by absolute SHAP value (largest impact first)
    contributions.sort(key=lambda x: abs(x["value"]), reverse=True)

    return contributions

def generate_global_summary(X_scaled_df, output_path="ml/outputs/global_shap_summary.png"):
    """
    Generates a global SHAP summary plot representing overall feature importances.
    
    Parameters:
    -----------
    X_scaled_df : pd.DataFrame
        Preprocessed and scaled training features.
    output_path : str
        File path where the summary chart will be saved.
    """
    _load_resources()
    
    # Calculate SHAP values for all rows
    shap_values = _EXPLAINER(X_scaled_df)
    
    plt.figure(figsize=(12, 8))
    shap.summary_plot(shap_values, X_scaled_df, show=False)
    plt.title("Global SHAP Feature Importance Summary", fontsize=14, pad=20)
    plt.tight_layout()
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Saved global SHAP summary plot to {output_path}")
