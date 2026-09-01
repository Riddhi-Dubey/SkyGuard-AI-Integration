import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import joblib

def run_evaluation(predictions_path="ml/outputs/predictions.csv", output_dir="ml/outputs"):
    print("=== Model Evaluation Starting ===")
    
    if not os.path.exists(predictions_path):
        raise FileNotFoundError(f"Predictions dataset not found at {predictions_path}")
        
    df = pd.read_csv(predictions_path)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # 1. Calculate general stats
    total_obs = len(df)
    anomalies = df[df['anomaly'] == -1]
    normals = df[df['anomaly'] == 1]
    num_anomalies = len(anomalies)
    pct_anomalies = (num_anomalies / total_obs) * 100
    
    print("\n--- Summary Statistics ---")
    print(f"Total Observations: {total_obs}")
    print(f"Number of Potential Anomalies: {num_anomalies}")
    print(f"Percentage of Anomalies: {pct_anomalies:.2f}%")
    
    # 2. Display representative anomalies
    print("\n--- Representative Anomalous Observations ---")
    if num_anomalies > 0:
        top_anomalies = anomalies.sort_values(by='anomaly_score').head(10)
        print(top_anomalies[['timestamp', 'temp', 'pressure', 'humidity', 'anomaly_score']])
    else:
        print("No anomalies detected.")
        
    # 3. Analyze rolling volatility (flatline checking)
    print("\n--- Volatility Analysis (Flatline Checking) ---")
    print(f"Mean rolling standard deviations:")
    print(f"  - Normal temp rolling std:     {normals['temp_roll_std_6'].mean():.4f} °C")
    print(f"  - Anomaly temp rolling std:    {anomalies['temp_roll_std_6'].mean():.4f} °C")
    print(f"  - Normal humidity rolling std: {normals['humidity_roll_std_6'].mean():.4f}%")
    print(f"  - Anomaly humidity rolling std:{anomalies['humidity_roll_std_6'].mean():.4f}%")
    
    flatline_temp = df[df['temp_roll_std_6'] == 0.0]
    print(f"\nNumber of observations with absolute temp flatlines (1-hr zero variation): {len(flatline_temp)}")
    if len(flatline_temp) > 0:
        print(flatline_temp[['timestamp', 'temp', 'anomaly']])
        
    # 4. Analyze temporal changes / sudden transitions
    print("\n--- Time-Series Behavior Analysis ---")
    # Standard deviation of diffs from preprocessed columns
    temp_diff_std = df['temp_diff'].std()
    press_diff_std = df['pressure_diff'].std()
    hum_diff_std = df['humidity_diff'].std()
    
    print(f"Standard deviation of consecutive changes:")
    print(f"  - Temperature: {temp_diff_std:.4f} °C")
    print(f"  - Pressure: {press_diff_std:.4f} hPa")
    print(f"  - Humidity: {hum_diff_std:.4f}%")
    
    temp_jump_thresh = 3 * temp_diff_std
    press_jump_thresh = 3 * press_diff_std
    hum_jump_thresh = 3 * hum_diff_std
    
    df['is_sudden_jump'] = (
        (df['temp_diff'].abs() > temp_jump_thresh) |
        (df['pressure_diff'].abs() > press_jump_thresh) |
        (df['humidity_diff'].abs() > hum_jump_thresh)
    )
    
    anom_jumps = df[(df['anomaly'] == -1) & (df['is_sudden_jump'] == True)]
    print(f"\nOf the {num_anomalies} anomalies detected, {len(anom_jumps)} ({len(anom_jumps)/num_anomalies*100:.2f}%) "
          f"correspond to sudden statistical jumps (Rate of Change > 3-sigma) in consecutive readings.")
    
    # 5. Generate Visualizations
    os.makedirs(output_dir, exist_ok=True)
    
    # Plot 1: Anomaly score distribution
    plt.figure(figsize=(10, 5))
    plt.hist(df['anomaly_score'], bins=50, color='skyblue', edgecolor='black', alpha=0.7)
    plt.axvline(x=df[df['anomaly'] == -1]['anomaly_score'].max(), color='red', linestyle='--', 
                label='Anomaly Threshold')
    plt.title('Distribution of Isolation Forest Anomaly Scores')
    plt.xlabel('Anomaly Score (lower means more anomalous)')
    plt.ylabel('Frequency')
    plt.legend()
    plt.grid(True, linestyle=':', alpha=0.6)
    score_plot_path = os.path.join(output_dir, "anomaly_score_distribution.png")
    plt.savefig(score_plot_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"\nSaved anomaly score distribution plot to {score_plot_path}")
    
    # Plot 2: Time-series of temperature, pressure, humidity with highlighted anomalies
    df_sorted = df.sort_values(by=['station_id', 'timestamp']).reset_index(drop=True)
    fig, axes = plt.subplots(3, 1, figsize=(14, 12), sharex=True)
    
    features_to_plot = [
        ('temp', 'Temperature (°C)', 'orangered'),
        ('pressure', 'Pressure (hPa)', 'royalblue'),
        ('humidity', 'Humidity (%)', 'forestgreen')
    ]
    
    for i, (col, label, color) in enumerate(features_to_plot):
        axes[i].plot(df_sorted['timestamp'], df_sorted[col], color=color, alpha=0.5, label='Observed Data')
        anom_subset = df_sorted[df_sorted['anomaly'] == -1]
        axes[i].scatter(anom_subset['timestamp'], anom_subset[col], color='red', marker='x', s=30, zorder=5, label='Potential Anomaly')
        axes[i].set_ylabel(label, fontsize=12)
        axes[i].legend(loc='upper right')
        axes[i].grid(True, linestyle=':', alpha=0.6)
        axes[i].set_title(f"{label} over Time with Detected Anomalies", fontsize=14)
        
    plt.xlabel('Timestamp', fontsize=12)
    plt.xticks(rotation=45)
    plt.tight_layout()
    timeseries_plot_path = os.path.join(output_dir, "anomaly_timeseries_visualization.png")
    plt.savefig(timeseries_plot_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Saved time-series visualization to {timeseries_plot_path}")
    
    # Plot 3: 3D Feature Scatter
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection='3d')
    ax.scatter(normals['temp'], normals['pressure'], normals['humidity'], 
               c='skyblue', marker='o', alpha=0.4, label='Normal Observations', s=10)
    ax.scatter(anomalies['temp'], anomalies['pressure'], anomalies['humidity'], 
               c='red', marker='x', alpha=0.9, label='Potential Anomalies', s=40)
    ax.set_xlabel('Temperature (°C)')
    ax.set_ylabel('Atmospheric Pressure (hPa)')
    ax.set_zlabel('Humidity (%)')
    ax.set_title('3D Feature Space Anomaly Visualization')
    ax.legend()
    
    threed_plot_path = os.path.join(output_dir, "anomaly_3d_scatter.png")
    plt.savefig(threed_plot_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"Saved 3D feature scatter plot to {threed_plot_path}")
    
    # 6. Global SHAP explainability
    print("\nGenerating Global SHAP feature importances...")
    try:
        from ml.src.explain import generate_global_summary
        feature_cols = [
            'temp', 'pressure', 'humidity', 
            'hour', 'month', 'day_of_year',
            'temp_roll_std_6', 'pressure_roll_std_6', 'humidity_roll_std_6',
            'temp_diff', 'pressure_diff', 'humidity_diff'
        ]
        scaler = joblib.load("ml/models/scaler.pkl")
        X_raw = df_sorted[feature_cols]
        X_scaled = pd.DataFrame(scaler.transform(X_raw), columns=feature_cols)
        
        global_summary_path = os.path.join(output_dir, "global_shap_summary.png")
        generate_global_summary(X_scaled, output_path=global_summary_path)
    except Exception as e:
        print(f"Warning: Failed to generate global SHAP summary: {e}")
        
    print("=== Model Evaluation Completed Successfully ===\n")

if __name__ == "__main__":
    run_evaluation()
