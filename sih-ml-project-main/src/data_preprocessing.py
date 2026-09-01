import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib

class WeatherDataPreprocessor:
    def __init__(self, target_dir="ml/models"):
        self.target_dir = target_dir
        self.scaler = StandardScaler()
        # Features: 3 baseline + 3 temporal context + 3 rolling volatility + 3 rate of change
        self.feature_cols = [
            'temp', 'pressure', 'humidity', 
            'hour', 'month', 'day_of_year',
            'temp_roll_std_6', 'pressure_roll_std_6', 'humidity_roll_std_6',
            'temp_diff', 'pressure_diff', 'humidity_diff'
        ]

    def inspect_data(self, df):
        """
        Inspects the dataset and prints key metadata as required by the workflow.
        """
        print("=== Dataset Inspection ===")
        print(f"Shape: {df.shape}")
        print("\nColumn Names & Data Types:")
        print(df.dtypes)
        print("\nMissing Values per Column:")
        print(df.isnull().sum())
        print(f"\nDuplicate Rows: {df.duplicated().sum()}")
        print("\nDescriptive Statistics:")
        print(df.describe(include='all'))
        print("=========================\n")

    def clean_data(self, df):
        """
        Performs data cleaning:
        - Drops exact duplicates.
        - Fills missing weather observations using forward-fill followed by backward-fill.
        """
        df_clean = df.copy()
        
        # Parse timestamp
        df_clean['timestamp'] = pd.to_datetime(df_clean['timestamp'])
        
        # Remove duplicate rows
        df_clean = df_clean.drop_duplicates()
        
        # Sort by station and timestamp to ensure correct sequence for fill and temporal checking
        df_clean = df_clean.sort_values(by=['station_id', 'timestamp']).reset_index(drop=True)
        
        # Handle missing values using ffill then bfill per station
        for col in ['temp', 'pressure', 'humidity']:
            if df_clean[col].isnull().any():
                df_clean[col] = df_clean.groupby('station_id')[col].ffill()
                df_clean[col] = df_clean.groupby('station_id')[col].bfill()
                
        return df_clean

    def engineer_features(self, df):
        """
        Creates temporal features, rolling standard deviations (1-hour window = 6 readings),
        and consecutive reading differences.
        """
        df_feat = df.copy()
        
        # 1. Temporal context
        df_feat['hour'] = df_feat['timestamp'].dt.hour
        df_feat['month'] = df_feat['timestamp'].dt.month
        df_feat['day_of_year'] = df_feat['timestamp'].dt.dayofyear
        
        # 2. Rate of change (consecutive difference)
        # Fill first reading diff per station with 0.0
        df_feat['temp_diff'] = df_feat.groupby('station_id')['temp'].diff().fillna(0.0)
        df_feat['pressure_diff'] = df_feat.groupby('station_id')['pressure'].diff().fillna(0.0)
        df_feat['humidity_diff'] = df_feat.groupby('station_id')['humidity'].diff().fillna(0.0)
        
        # 3. Rolling standard deviation (window = 6 observations = 1 hour)
        # reset_index(level=0, drop=True) removes the grouping index so it aligns with the dataframe index
        temp_std = df_feat.groupby('station_id')['temp'].rolling(window=6, min_periods=1).std()
        press_std = df_feat.groupby('station_id')['pressure'].rolling(window=6, min_periods=1).std()
        hum_std = df_feat.groupby('station_id')['humidity'].rolling(window=6, min_periods=1).std()
        
        # If there are multiple stations, grouping creates a MultiIndex. 
        # We align by stripping index level 0 ('station_id').
        if isinstance(temp_std.index, pd.MultiIndex):
            df_feat['temp_roll_std_6'] = temp_std.reset_index(level=0, drop=True)
            df_feat['pressure_roll_std_6'] = press_std.reset_index(level=0, drop=True)
            df_feat['humidity_roll_std_6'] = hum_std.reset_index(level=0, drop=True)
        else:
            df_feat['temp_roll_std_6'] = temp_std
            df_feat['pressure_roll_std_6'] = press_std
            df_feat['humidity_roll_std_6'] = hum_std
            
        # Fill single-record rolling standard deviation (which yields NaN) with 0.0
        df_feat['temp_roll_std_6'] = df_feat['temp_roll_std_6'].fillna(0.0)
        df_feat['pressure_roll_std_6'] = df_feat['pressure_roll_std_6'].fillna(0.0)
        df_feat['humidity_roll_std_6'] = df_feat['humidity_roll_std_6'].fillna(0.0)
        
        return df_feat

    def fit_transform(self, df):
        """
        Cleans, engineers features, fits the scaler, and returns scaled feature matrix.
        """
        df_clean = self.clean_data(df)
        df_feat = self.engineer_features(df_clean)
        
        X = df_feat[self.feature_cols]
        X_scaled = self.scaler.fit_transform(X)
        
        # Convert scaled values back to DataFrame for cleaner usage during training/eval
        df_scaled = pd.DataFrame(X_scaled, columns=self.feature_cols, index=df_clean.index)
        
        # Keep identifier columns in clean df
        df_clean_final = df_clean[['station_id', 'timestamp']].join(df_scaled)
        return df_clean_final, df_feat

    def transform(self, df):
        """
        Transforms new input data using the fitted scaler.
        """
        df_clean = self.clean_data(df)
        df_feat = self.engineer_features(df_clean)
        
        X = df_feat[self.feature_cols]
        X_scaled = self.scaler.transform(X)
        
        df_scaled = pd.DataFrame(X_scaled, columns=self.feature_cols, index=df_clean.index)
        df_clean_final = df_clean[['station_id', 'timestamp']].join(df_scaled)
        return df_clean_final

    def save_scaler(self):
        """
        Saves the fitted scaler to the models directory.
        """
        os.makedirs(self.target_dir, exist_ok=True)
        scaler_path = os.path.join(self.target_dir, "scaler.pkl")
        joblib.dump(self.scaler, scaler_path)
        print(f"Saved scaler to {scaler_path}")

    def load_scaler(self):
        """
        Loads the saved scaler.
        """
        scaler_path = os.path.join(self.target_dir, "scaler.pkl")
        self.scaler = joblib.load(scaler_path)
        print(f"Loaded scaler from {scaler_path}")
