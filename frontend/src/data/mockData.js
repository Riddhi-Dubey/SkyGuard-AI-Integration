// Central mock data source for SkyGuard AI.
// Structured so a real backend/API can replace each export independently.

export const STATIONS = [
  { id: "AWS-DEL-01", name: "Delhi", state: "Delhi", x: 46, y: 33, status: "healthy", temp: 24.6, pressure: 1012.4, humidity: 68, health: 98 },
  { id: "AWS-MUM-04", name: "Mumbai", state: "Maharashtra", x: 27, y: 60, status: "warning", temp: 29.8, pressure: 1008.9, humidity: 78, health: 82 },
  { id: "AWS-CHE-02", name: "Chennai", state: "Tamil Nadu", x: 47, y: 82, status: "healthy", temp: 31.2, pressure: 1006.7, humidity: 74, health: 95 },
  { id: "AWS-KOL-03", name: "Kolkata", state: "West Bengal", x: 68, y: 52, status: "healthy", temp: 30.1, pressure: 1005.2, humidity: 81, health: 93 },
  { id: "AWS-BLR-05", name: "Bengaluru", state: "Karnataka", x: 39, y: 76, status: "healthy", temp: 23.9, pressure: 1013.6, humidity: 61, health: 97 },
  { id: "AWS-HYD-06", name: "Hyderabad", state: "Telangana", x: 42, y: 66, status: "healthy", temp: 27.4, pressure: 1010.8, humidity: 55, health: 96 },
  { id: "AWS-JAI-02", name: "Jaipur", state: "Rajasthan", x: 36, y: 35, status: "anomaly", temp: 24.9, pressure: 1008.2, humidity: 41, health: 58 },
  { id: "AWS-LKO-07", name: "Lucknow", state: "Uttar Pradesh", x: 54, y: 37, status: "healthy", temp: 26.3, pressure: 1011.1, humidity: 64, health: 94 },
  { id: "AWS-GHY-08", name: "Guwahati", state: "Assam", x: 79, y: 42, status: "warning", temp: 28.7, pressure: 1004.9, humidity: 86, health: 79 },
  { id: "AWS-BPL-09", name: "Bhopal", state: "Madhya Pradesh", x: 44, y: 50, status: "healthy", temp: 25.8, pressure: 1011.9, humidity: 52, health: 99 },
  { id: "AWS-AMD-10", name: "Ahmedabad", state: "Gujarat", x: 28, y: 47, status: "healthy", temp: 30.6, pressure: 1009.5, humidity: 46, health: 92 },
  { id: "AWS-SXR-11", name: "Srinagar", state: "Jammu & Kashmir", x: 38, y: 12, status: "healthy", temp: 14.2, pressure: 1018.3, humidity: 58, health: 97 },
];

export const ANOMALY_STATION_ID = "AWS-DEL-01";

// 60 minutes of synthetic per-minute readings for the currently selected station.
// Index 52 (10:41:52-ish) carries the injected temperature spike used across the dashboard.
function buildSeries() {
  const points = [];
  const now = new Date("2026-08-30T10:42:18");
  for (let i = 59; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60000);
    const label = t.toTimeString().slice(0, 5);
    const wobble = Math.sin(i / 6) * 0.6 + (Math.random() - 0.5) * 0.4;
    let temp = 24.7 + wobble;
    let pressure = 1012.6 - i * 0.003 + (Math.random() - 0.5) * 0.15;
    let humidity = 67 + Math.cos(i / 9) * 2.5 + (Math.random() - 0.5) * 1.2;
    const isAnomaly = i === 7; // near the end of the window, i.e. ~10:41:52
    if (isAnomaly) temp = 55.0;
    points.push({
      time: label,
      minutesAgo: i,
      temp: Number(temp.toFixed(1)),
      pressure: Number(pressure.toFixed(1)),
      humidity: Number(humidity.toFixed(1)),
      anomaly: isAnomaly,
    });
  }
  return points;
}

export const SENSOR_SERIES = buildSeries();

export const NETWORK_STATS = {
  stationsOnline: 47,
  stationsTotal: 50,
  observations: 1284920,
  dataQuality: 99.2,
  activeAnomalies: 7,
  networkHealth: 96.4,
};

export const KPI_SPARKLINES = {
  stationsOnline: [44, 45, 45, 46, 46, 47, 47, 46, 47, 47],
  observations: [11, 14, 13, 17, 16, 19, 18, 21, 20, 23],
  activeAnomalies: [3, 4, 4, 5, 5, 6, 6, 7, 6, 7],
  networkHealth: [97.8, 97.5, 97.1, 96.9, 96.6, 96.8, 96.5, 96.2, 96.6, 96.4],
};

export const ANOMALIES = [
  {
    id: "AN-10231",
    time: "10:41:52",
    station: "AWS-DEL-01",
    stationName: "Delhi",
    parameter: "Temperature",
    observed: "55.0°C",
    expected: "24.7°C",
    severity: "critical",
    confidence: 96.8,
    rootCause: "Sensor Spike",
  },
  {
    id: "AN-10229",
    time: "10:39:14",
    station: "AWS-MUM-04",
    stationName: "Mumbai",
    parameter: "Humidity",
    observed: "99.9%",
    expected: "72.4%",
    severity: "warning",
    confidence: 87.2,
    rootCause: "Possible Sensor Drift",
  },
  {
    id: "AN-10227",
    time: "10:37:02",
    station: "AWS-JAI-02",
    stationName: "Jaipur",
    parameter: "Pressure",
    observed: "—",
    expected: "1008.2 hPa",
    severity: "critical",
    confidence: 99.1,
    rootCause: "Communication Failure",
  },
  {
    id: "AN-10224",
    time: "10:31:47",
    station: "AWS-GHY-08",
    stationName: "Guwahati",
    parameter: "Humidity",
    observed: "86.4%",
    expected: "79.1%",
    severity: "warning",
    confidence: 74.6,
    rootCause: "Calibration Drift",
  },
  {
    id: "AN-10219",
    time: "10:22:05",
    station: "AWS-DEL-01",
    stationName: "Delhi",
    parameter: "Temperature",
    observed: "24.9°C",
    expected: "24.6°C",
    severity: "normal",
    confidence: 34.2,
    rootCause: "Within Tolerance",
  },
  {
    id: "AN-10212",
    time: "10:08:33",
    station: "AWS-JAI-02",
    stationName: "Jaipur",
    parameter: "Temperature",
    observed: "24.9°C",
    expected: "24.9°C",
    severity: "normal",
    confidence: 12.4,
    rootCause: "No Anomaly",
  },
  {
    id: "AN-10201",
    time: "09:54:11",
    station: "AWS-MUM-04",
    stationName: "Mumbai",
    parameter: "Pressure",
    observed: "1006.1 hPa",
    expected: "1008.9 hPa",
    severity: "warning",
    confidence: 68.9,
    rootCause: "Possible Sensor Drift",
  },
];

export const ANOMALY_DETAIL = {
  id: "AN-10231",
  station: "AWS-DEL-01",
  stationName: "Delhi, India",
  parameter: "Temperature",
  severity: "critical",
  confidence: 96.8,
  observed: 55.0,
  expected: 24.7,
  correction: 24.8,
  correctionMethod: "Temporal interpolation + local station context",
  correctionConfidence: 91.4,
  aiAssessment:
    "Temperature increased from 24.7°C to 55.0°C within one observation interval while pressure and humidity remained within expected ranges. The magnitude and rate of change are inconsistent with the station's recent temporal pattern.",
  probableRootCause: "Sensor Spike / Possible Sensor Malfunction",
  recommendedAction: "Inspect temperature sensor and verify calibration.",
  maintenanceRisk: {
    level: "MEDIUM-HIGH",
    score: 78,
    reason: "Repeated temperature anomalies detected in the last 24 hours.",
  },
};

export const SHAP_CONTRIBUTIONS = [
  { feature: "Temperature", value: 0.82 },
  { feature: "Temperature Delta", value: 0.61 },
  { feature: "Rolling Temperature Mean", value: 0.31 },
  { feature: "Humidity", value: 0.08 },
  { feature: "Pressure", value: 0.03 },
];

export const PIPELINE_STEPS = [
  { id: "ingest", title: "AWS Data", detail: "Raw Temperature, Pressure and Humidity observations stream in from stations across the network." },
  { id: "quality", title: "Data Quality", detail: "Range checks, timestamp validation and duplicate/missing-value screening on every observation." },
  { id: "features", title: "Feature Engineering", detail: "Rolling means, deltas and station-context features are derived from the recent observation window." },
  { id: "model", title: "Isolation Forest", detail: "An unsupervised model scores each observation against learned normal behaviour for the station." },
  { id: "shap", title: "SHAP Explainability", detail: "Feature attributions quantify exactly which inputs drove the anomaly score." },
  { id: "rootcause", title: "AI Root-Cause Analysis", detail: "Patterns across parameters are matched to probable causes: spike, drift, freeze or comms loss." },
  { id: "alert", title: "Actionable Alert", detail: "Severity, confidence, corrected-value estimate and maintenance risk are delivered to operators." },
];

export const PROBLEM_CARDS = [
  { title: "Sensor Spikes", detail: "Sudden, unrealistic measurements that break station-level trust in the data stream." },
  { title: "Frozen Sensors", detail: "Repeated identical values indicate a sensor that has stopped responding to real conditions." },
  { title: "Communication Loss", detail: "Missing or corrupted observations disrupt continuity across the AWS network." },
  { title: "Calibration Drift", detail: "Slow, gradual deviations that remain invisible to simple threshold-based rules." },
];
