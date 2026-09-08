"""
SkyGuard AI — Real-Time Alert Dispatch Service
SIH 2026 Problem Statement 26073

Provides automated, asynchronous email alert dispatching for detected Automatic Weather Station (AWS) anomalies.
Supports rich responsive HTML email templates, in-memory per-station anti-spam cooldown timers,
and graceful simulation fallback when SMTP credentials are not yet configured.
"""

import os
import smtplib
import threading
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional

# In-memory cooldown tracking: { station_id: timestamp_of_last_sent_alert }
_STATION_COOLDOWNS: Dict[str, datetime] = {}
_COOLDOWN_LOCK = threading.Lock()

# Default Cooldown: 180 seconds (3 minutes) per station to avoid inbox flooding
DEFAULT_COOLDOWN_SECONDS = int(os.getenv("ALERT_COOLDOWN_SECONDS", "180"))


def generate_alert_html(incident: Dict[str, Any]) -> str:
    """
    Generates a dark-themed responsive HTML email report for the incident.
    """
    station_id = incident.get("station", "AWS-UNKNOWN")
    station_name = incident.get("stationName", "Weather Station")
    severity = str(incident.get("severity", "critical")).upper()
    confidence = incident.get("confidence", 95.0)
    parameter = incident.get("parameter", "Temperature")
    observed = incident.get("observed", "N/A")
    expected = incident.get("expected", "N/A")
    correction = incident.get("correction", "N/A")
    root_cause = incident.get("probableRootCause", "Sensor Discrepancy")
    ai_assessment = incident.get("aiAssessment", "Anomalous reading detected outside expected baseline.")
    recommended_action = incident.get("recommendedAction", "Inspect sensor transducer and calibration.")
    timestamp = datetime.now().strftime("%d %b %Y, %H:%M:%S IST")

    unit = "°C" if parameter == "Temperature" else " hPa" if parameter == "Pressure" else "%"
    
    badge_bg = "#dc2626" if severity == "CRITICAL" else "#d97706"
    badge_text = "#ffffff"

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SkyGuard AI — Telemetry Alert</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #090d16;
      color: #e2e8f0;
      margin: 0;
      padding: 24px;
    }}
    .container {{
      max-width: 600px;
      margin: 0 auto;
      background-color: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }}
    .header {{
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      padding: 24px;
      border-bottom: 1px solid #1e293b;
    }}
    .logo {{
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #38bdf8;
      font-weight: 700;
      margin-bottom: 8px;
    }}
    .title {{
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 12px 0;
    }}
    .badge {{
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      background-color: {badge_bg};
      color: {badge_text};
    }}
    .content {{
      padding: 24px;
    }}
    .card {{
      background-color: #1e293b;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      border: 1px solid #334155;
    }}
    .card-title {{
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      margin-bottom: 12px;
      font-weight: 600;
    }}
    .grid {{
      display: table;
      width: 100%;
    }}
    .col {{
      display: table-cell;
      width: 33.33%;
      text-align: center;
      padding: 8px;
    }}
    .metric-label {{
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 4px;
    }}
    .metric-value {{
      font-size: 18px;
      font-weight: 700;
      font-family: monospace;
    }}
    .val-observed {{ color: #f87171; }}
    .val-expected {{ color: #ffffff; }}
    .val-corrected {{ color: #4ade80; }}
    .section-title {{
      font-size: 14px;
      font-weight: 600;
      color: #38bdf8;
      margin: 16px 0 8px 0;
    }}
    .text-body {{
      font-size: 13px;
      line-height: 1.6;
      color: #cbd5e1;
      margin: 0 0 12px 0;
    }}
    .action-box {{
      background-color: rgba(56, 189, 248, 0.1);
      border-left: 4px solid #38bdf8;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      margin-top: 16px;
    }}
    .footer {{
      background-color: #0b1120;
      padding: 16px 24px;
      border-top: 1px solid #1e293b;
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SkyGuard AI &bull; Meteorological Early Warning</div>
      <h1 class="title">{station_name} ({station_id})</h1>
      <span class="badge">{severity} ANOMALY &bull; {confidence}% CONFIDENCE</span>
    </div>

    <div class="content">
      <div class="card">
        <div class="card-title">Telemetry Discrepancy &bull; {parameter}</div>
        <div class="grid">
          <div class="col">
            <div class="metric-label">Observed</div>
            <div class="metric-value val-observed">{observed}{unit}</div>
          </div>
          <div class="col">
            <div class="metric-label">Expected Baseline</div>
            <div class="metric-value val-expected">{expected}{unit}</div>
          </div>
          <div class="col">
            <div class="metric-label">Suggested Correction</div>
            <div class="metric-value val-corrected">{correction}{unit}</div>
          </div>
        </div>
      </div>

      <div class="section-title">AI Root Cause Diagnostics</div>
      <p class="text-body"><strong>Probable Cause:</strong> {root_cause}</p>
      <p class="text-body">{ai_assessment}</p>

      <div class="action-box">
        <div style="font-weight: 600; font-size: 12px; color: #38bdf8; margin-bottom: 4px;">RECOMMENDED FIELD ACTION</div>
        <div style="font-size: 13px; color: #e2e8f0;">{recommended_action}</div>
      </div>
    </div>

    <div class="footer">
      Generated automatically by SkyGuard AI Agentic Pipeline at {timestamp}<br>
      SIH 2026 Problem Statement 26073 &bull; Ministry of Earth Sciences (IMD)
    </div>
  </div>
</body>
</html>"""


def send_email_alert(incident: Dict[str, Any], force: bool = False) -> Dict[str, Any]:
    """
    Sends an automated email alert for the given incident.
    
    If SMTP credentials are not configured, runs in Safe Simulation Mode
    and prints the formatted incident alert to console.
    """
    station_id = incident.get("station", "AWS-UNKNOWN")
    station_name = incident.get("stationName", "Weather Station")
    severity = str(incident.get("severity", "critical")).upper()
    parameter = incident.get("parameter", "Temperature")
    observed = incident.get("observed", "")
    expected = incident.get("expected", "")

    # Anti-Spam Cooldown Check
    if not force:
        with _COOLDOWN_LOCK:
            now = datetime.now()
            last_sent = _STATION_COOLDOWNS.get(station_id)
            if last_sent and (now - last_sent).total_seconds() < DEFAULT_COOLDOWN_SECONDS:
                remaining = int(DEFAULT_COOLDOWN_SECONDS - (now - last_sent).total_seconds())
                print(f"[SkyGuard Alert] Cooldown active for {station_id} ({remaining}s remaining). Alert suppressed.")
                return {
                    "status": "suppressed_cooldown",
                    "station_id": station_id,
                    "remaining_cooldown_seconds": remaining
                }
            _STATION_COOLDOWNS[station_id] = now

    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    recipient_email = os.getenv("ALERT_RECIPIENT_EMAIL", "").strip()

    subject = f"[{severity} ALERT] {station_id} ({station_name}) {parameter} Anomaly Detected"
    html_body = generate_alert_html(incident)

    # If credentials are not provided, log simulated email dispatch
    if not smtp_user or not smtp_password or not recipient_email:
        print("\n" + "=" * 70)
        print(f"[SIMULATED EMAIL DISPATCH] {subject}")
        print(f"To: {recipient_email or '(Set ALERT_RECIPIENT_EMAIL in .env to receive live emails)'}")
        print(f"Station: {station_id} ({station_name}) | Parameter: {parameter}")
        print(f"Observed: {observed} | Expected: {expected} | Severity: {severity}")
        print(f"AI Root Cause: {incident.get('probableRootCause', 'Sensor Spike')}")
        print("=" * 70 + "\n")
        return {
            "status": "simulated_success",
            "station_id": station_id,
            "subject": subject,
            "mode": "simulation",
            "message": "Alert simulated successfully. Set SMTP credentials in .env to deliver live emails."
        }

    # Live SMTP Dispatch
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"SkyGuard AI Alerts <{smtp_user}>"
        msg["To"] = recipient_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(smtp_server, smtp_port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, [recipient_email], msg.as_string())

        print(f"[SkyGuard Alert] Live email alert successfully delivered to {recipient_email} for {station_id}")
        return {
            "status": "delivered",
            "station_id": station_id,
            "recipient": recipient_email,
            "subject": subject
        }
    except Exception as e:
        print(f"[SkyGuard Alert] SMTP delivery failed for {station_id}: {e}")
        return {
            "status": "error",
            "station_id": station_id,
            "error": str(e)
        }
