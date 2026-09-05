// Central mock data source for SkyGuard AI.
// Structured so a real backend/API can replace each export independently.

export const STATIONS = [
  { id: "AWS-DEL-01", name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, x: 46, y: 33, status: "healthy", temp: 24.6, pressure: 1012.4, humidity: 68, health: 98 },
  { id: "AWS-MUM-04", name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777, x: 27, y: 60, status: "warning", temp: 29.8, pressure: 1008.9, humidity: 78, health: 82 },
  { id: "AWS-CHE-02", name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, x: 47, y: 82, status: "healthy", temp: 31.2, pressure: 1006.7, humidity: 74, health: 95 },
  { id: "AWS-KOL-03", name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, x: 68, y: 52, status: "healthy", temp: 30.1, pressure: 1005.2, humidity: 81, health: 93 },
  { id: "AWS-BLR-05", name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, x: 39, y: 76, status: "healthy", temp: 23.9, pressure: 1013.6, humidity: 61, health: 97 },
  { id: "AWS-HYD-06", name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, x: 42, y: 66, status: "healthy", temp: 27.4, pressure: 1010.8, humidity: 55, health: 96 },
  { id: "AWS-JAI-02", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, x: 36, y: 35, status: "anomaly", temp: 24.9, pressure: 1008.2, humidity: 41, health: 58 },
  { id: "AWS-LKO-07", name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, x: 54, y: 37, status: "healthy", temp: 26.3, pressure: 1011.1, humidity: 64, health: 94 },
  { id: "AWS-GHY-08", name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, x: 79, y: 42, status: "warning", temp: 28.7, pressure: 1004.9, humidity: 86, health: 79 },
  { id: "AWS-BPL-09", name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, x: 44, y: 50, status: "healthy", temp: 25.8, pressure: 1011.9, humidity: 52, health: 99 },
  { id: "AWS-AMD-10", name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, x: 28, y: 47, status: "healthy", temp: 30.6, pressure: 1009.5, humidity: 46, health: 92 },
  { id: "AWS-SXR-11", name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973, x: 38, y: 12, status: "healthy", temp: 14.2, pressure: 1018.3, humidity: 58, health: 97 },
];

export const ANOMALY_STATION_ID = "AWS-DEL-01";

// 60 minutes of synthetic per-minute readings for the currently selected station.
export function buildSeries(baseDate = new Date("2026-08-30T10:42:18"), station = null) {
  const points = [];
  const baseTemp = station?.temp ?? 24.6;
  const basePressure = station?.pressure ?? 1012.4;
  const baseHumidity = station?.humidity ?? 68.0;
  const isDelhi = station?.id === "AWS-DEL-01" || !station;

  for (let i = 59; i >= 0; i--) {
    const t = new Date(baseDate.getTime() - i * 60000);
    const label = t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    const wobble = Math.sin(i / 6) * 0.4 + (Math.random() - 0.5) * 0.2;
    let temp = baseTemp + wobble;
    let pressure = basePressure - i * 0.002 + (Math.random() - 0.5) * 0.1;
    let humidity = baseHumidity + Math.cos(i / 9) * 1.5 + (Math.random() - 0.5) * 0.8;
    
    // Anomaly spike on Delhi at minute 7
    const isAnomaly = isDelhi && i === 7;
    if (isAnomaly) temp = 55.0;

    points.push({
      time: label,
      minutesAgo: i,
      temp: Number(temp.toFixed(1)),
      pressure: Number(pressure.toFixed(1)),
      humidity: Number(Math.max(10, Math.min(100, humidity)).toFixed(1)),
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
    expected: "24.6°C",
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
    observed: "78.0%",
    expected: "72.4%",
    severity: "warning",
    confidence: 87.2,
    rootCause: "Calibration Drift",
  },
  {
    id: "AN-10227",
    time: "10:37:02",
    station: "AWS-JAI-02",
    stationName: "Jaipur",
    parameter: "Pressure",
    observed: "1008.2 hPa",
    expected: "1012.0 hPa",
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
    observed: "86.0%",
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
    observed: "24.8°C",
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
  expected: 24.6,
  correction: 24.6,
  correctionMethod: "Temporal interpolation + local station context",
  correctionConfidence: 95.4,
  aiAssessment:
    "Temperature shifted abruptly from expected 24.6°C to observed 55.0°C within one observation interval while adjacent atmospheric parameters remained consistent. The magnitude and rate of change are inconsistent with the station's recent temporal pattern.",
  probableRootCause: "Sensor Spike / Possible Sensor Malfunction",
  recommendedAction: "Inspect temperature sensor and verify calibration.",
  maintenanceRisk: {
    level: "MEDIUM-HIGH",
    score: 74,
    reason: "Repeated temperature anomalies detected in the last 24 hours.",
  },
  shapContributions: [
    { feature: "Temperature Delta", value: 0.82 },
    { feature: "Rolling Temperature Std", value: 0.61 },
    { feature: "Temperature", value: 0.31 },
    { feature: "Humidity", value: 0.08 },
    { feature: "Pressure", value: 0.03 },
  ],
};

export function getStationDetailData(stationId, stationOverride = null) {
  const station = stationOverride || STATIONS.find((s) => s.id === stationId) || STATIONS[0];
  
  if (station.id === "AWS-DEL-01") {
    return {
      ...ANOMALY_DETAIL,
      id: "AN-10231",
      station: "AWS-DEL-01",
      stationName: "Delhi, India",
      parameter: "Temperature",
      observed: 55.0,
      expected: 24.6,
      correction: 24.6,
      severity: "critical",
      confidence: 96.8,
      probableRootCause: "Sensor Spike / Hardware Spike",
      aiAssessment: "Temperature shifted abruptly from expected 24.6°C to observed 55.0°C within one observation interval. Temporal gradient exceeds physical threshold of 5°C/10min.",
      recommendedAction: "Inspect temperature transducer wiring and recalibrate against station baseline.",
      maintenanceRisk: { level: "MEDIUM-HIGH", score: 74, reason: "5 anomaly events logged in the last 24 hours." },
      shapContributions: [
        { feature: "Temperature Delta", value: 0.85 },
        { feature: "Rolling Temperature Std", value: 0.62 },
        { feature: "Temperature", value: 0.30 },
        { feature: "Humidity", value: 0.07 },
        { feature: "Pressure", value: 0.02 },
      ]
    };
  }

  if (station.id === "AWS-MUM-04") {
    return {
      id: "AN-10229",
      station: "AWS-MUM-04",
      stationName: "Mumbai, India",
      parameter: "Humidity",
      observed: station.humidity ?? 78.0,
      expected: 72.4,
      correction: 72.4,
      severity: "warning",
      confidence: 87.2,
      correctionMethod: "Temporal interpolation + coastal humidity baseline",
      correctionConfidence: 91.2,
      probableRootCause: "Calibration Drift / Moisture Saturation",
      aiAssessment: `Relative humidity at AWS-MUM-04 (Mumbai) has drifted to ${station.humidity ?? 78.0}% (expected baseline 72.4%). Gradual calibration drift detected in capacitive humidity transducer.`,
      recommendedAction: "Perform in-situ hygrometer calibration and check sensor filter cap for particulate contamination.",
      maintenanceRisk: { level: "MEDIUM", score: 52, reason: "3 humidity drift warnings recorded in last 24 hours." },
      shapContributions: [
        { feature: "Rolling Humidity Std", value: 0.76 },
        { feature: "Humidity Delta", value: 0.54 },
        { feature: "Humidity", value: 0.42 },
        { feature: "Temperature", value: 0.12 },
        { feature: "Pressure", value: 0.05 },
      ]
    };
  }

  if (station.id === "AWS-GHY-08") {
    return {
      id: "AN-10224",
      station: "AWS-GHY-08",
      stationName: "Guwahati, India",
      parameter: "Humidity",
      observed: station.humidity ?? 86.0,
      expected: 79.1,
      correction: 79.1,
      severity: "warning",
      confidence: 74.6,
      correctionMethod: "Regional baseline interpolation",
      correctionConfidence: 89.4,
      probableRootCause: "Sensor Calibration Drift",
      aiAssessment: `Guwahati AWS sensor reported ${station.humidity ?? 86.0}% relative humidity against regional expected baseline of 79.1%. Slow progressive drift identified across 6 observation cycles.`,
      recommendedAction: "Schedule field technician inspection for sensor recalibration during next maintenance cycle.",
      maintenanceRisk: { level: "MEDIUM", score: 48, reason: "2 telemetry deviations noted in last 24 hours." },
      shapContributions: [
        { feature: "Rolling Humidity Std", value: 0.68 },
        { feature: "Humidity", value: 0.51 },
        { feature: "Humidity Delta", value: 0.38 },
        { feature: "Pressure", value: 0.10 },
        { feature: "Temperature", value: 0.04 },
      ]
    };
  }

  if (station.id === "AWS-JAI-02") {
    return {
      id: "AN-10227",
      station: "AWS-JAI-02",
      stationName: "Jaipur, India",
      parameter: "Pressure",
      observed: station.pressure ?? 1008.2,
      expected: 1012.0,
      correction: 1012.0,
      severity: "critical",
      confidence: 99.1,
      correctionMethod: "Atmospheric barometric gradient compensation",
      correctionConfidence: 96.0,
      probableRootCause: "Barometer Range Deviation / Possible Port Blockage",
      aiAssessment: `Atmospheric pressure sensor at Jaipur station dropped to ${station.pressure ?? 1008.2} hPa compared to local network average of 1012.0 hPa without meteorological storm indicators.`,
      recommendedAction: "Inspect barometric pressure port for physical blockage or venting tube obstruction.",
      maintenanceRisk: { level: "HIGH", score: 85, reason: "Frequent pressure drops and missing packets in last 24 hours." },
      shapContributions: [
        { feature: "Pressure Delta", value: 0.88 },
        { feature: "Pressure", value: 0.72 },
        { feature: "Rolling Pressure Std", value: 0.49 },
        { feature: "Temperature", value: 0.08 },
        { feature: "Humidity", value: 0.03 },
      ]
    };
  }

  // Nominal / Healthy Stations (Kolkata, Chennai, Bengaluru, Hyderabad, Lucknow, Bhopal, Ahmedabad, Srinagar)
  const isHealthy = station.status === "healthy" || !station.status;
  const temp = station.temp ?? 25.0;
  const pressure = station.pressure ?? 1012.0;
  const humidity = station.humidity ?? 60.0;

  return {
    id: `STN-${station.id.replace("AWS-", "")}`,
    station: station.id,
    stationName: `${station.name}, India`,
    parameter: "Temperature",
    observed: temp,
    expected: temp,
    correction: temp,
    severity: isHealthy ? "normal" : "warning",
    confidence: isHealthy ? 99.2 : 82.4,
    correctionMethod: "Nominal telemetry — No correction required",
    correctionConfidence: 99.0,
    probableRootCause: "Nominal Sensor Operation / No Fault Detected",
    aiAssessment: `Telemetry for station ${station.id} (${station.name}) is operating within nominal meteorological baselines. Ambient temperature is ${temp}°C, atmospheric pressure is ${pressure} hPa, and relative humidity is ${humidity}%. All sensors pass physical consistency checks.`,
    recommendedAction: "No action required. Station health is verified nominal.",
    maintenanceRisk: {
      level: "LOW",
      score: 12,
      reason: "0 critical anomalies recorded in the last 24 hours. Normal operating telemetry.",
    },
    shapContributions: [
      { feature: "Temperature", value: 0.12 },
      { feature: "Pressure", value: 0.09 },
      { feature: "Humidity", value: 0.08 },
      { feature: "Temperature Delta", value: 0.03 },
      { feature: "Rolling Temperature Std", value: 0.02 },
    ]
  };
}

export const SHAP_CONTRIBUTIONS = [
  { feature: "Temperature Delta", value: 0.82 },
  { feature: "Rolling Temperature Std", value: 0.61 },
  { feature: "Temperature", value: 0.31 },
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
