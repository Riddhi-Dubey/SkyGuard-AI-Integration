"""
SkyGuard AI — Pipeline Tools & Database Adapters
SIH 2026 Problem Statement 26073
"""

import os
from typing import Optional, Dict

STATION_LOCATIONS: Dict[str, str] = {
    "AWS-DEL-01": "Delhi, India",
    "AWS-MUM-04": "Mumbai, Maharashtra",
    "AWS-CHE-02": "Chennai, Tamil Nadu",
    "AWS-KOL-03": "Kolkata, West Bengal",
    "AWS-BLR-05": "Bengaluru, Karnataka",
    "AWS-HYD-06": "Hyderabad, Telangana",
    "AWS-JAI-02": "Jaipur, Rajasthan",
    "AWS-LKO-07": "Lucknow, Uttar Pradesh",
    "AWS-GHY-08": "Guwahati, Assam",
    "AWS-BPL-09": "Bhopal, Madhya Pradesh",
    "AWS-AMD-10": "Ahmedabad, Gujarat",
    "AWS-SXR-11": "Srinagar, Jammu & Kashmir",
}

def get_station_name(station_id: str) -> str:
    """
    Returns the human-readable location name for a given AWS station identifier.
    """
    return STATION_LOCATIONS.get(station_id, f"{station_id} Station, India")

def query_station_24h_anomaly_count(station_id: str, db_connection_url: Optional[str] = None) -> int:
    """
    Queries PostgreSQL for the number of anomalies recorded for station_id in the last 24 hours.
    
    If DATABASE_URL is set in environment or passed directly, executes a live SQL query.
    Otherwise, uses a deterministic fallback provider for testing and offline environments.
    """
    db_url = db_connection_url or os.getenv("DATABASE_URL")
    if db_url:
        try:
            import psycopg2
            with psycopg2.connect(db_url) as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT COUNT(*) FROM anomalies 
                        WHERE station_id = %s 
                        AND timestamp >= NOW() - INTERVAL '24 HOURS'
                        """,
                        (station_id,)
                    )
                    row = cur.fetchone()
                    return int(row[0]) if row else 0
        except Exception as e:
            print(f"Notice: PostgreSQL connection unavailable ({e}). Utilizing fallback counter.")
            
    # Deterministic fallback mapping for standard AWS test stations
    STATION_MOCK_INCIDENTS = {
        "AWS-DEL-01": 5,  # MEDIUM-HIGH
        "AWS-MUM-04": 3,  # MEDIUM
        "AWS-JAI-02": 7,  # HIGH
        "AWS-GHY-08": 2,  # MEDIUM
        "AWS-CHE-02": 1,  # LOW
    }
    return STATION_MOCK_INCIDENTS.get(station_id, 4)
