/**
 * SkyGuard AI — API Client Service
 * SIH 2026 Problem Statement 26073
 * 
 * Communicates with the FastAPI streaming backend (http://127.0.0.1:8000).
 * Implements seamless, graceful fallback to mock data when backend is offline.
 */

import {
  STATIONS,
  SENSOR_SERIES,
  NETWORK_STATS,
  KPI_SPARKLINES,
  ANOMALIES,
  ANOMALY_DETAIL,
  getStationDetailData,
} from "../data/mockData";

const API_BASE = import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000";

async function fetchWithTimeout(url, options = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function getStations() {
  try {
    const data = await fetchWithTimeout(`${API_BASE}/api/stations`);
    return data;
  } catch (err) {
    console.debug("Backend offline, utilizing stations fallback:", err.message);
    return STATIONS;
  }
}

export async function getStationSeries(stationId) {
  try {
    const data = await fetchWithTimeout(`${API_BASE}/api/stations/${encodeURIComponent(stationId)}/series`);
    return data;
  } catch (err) {
    console.debug(`Backend offline, utilizing series fallback for ${stationId}:`, err.message);
    return SENSOR_SERIES;
  }
}

export async function getNetworkStats() {
  try {
    const data = await fetchWithTimeout(`${API_BASE}/api/stats`);
    return data;
  } catch (err) {
    console.debug("Backend offline, utilizing stats fallback:", err.message);
    return {
      ...NETWORK_STATS,
      sparklines: KPI_SPARKLINES,
    };
  }
}

export async function getAnomalies() {
  try {
    const data = await fetchWithTimeout(`${API_BASE}/api/anomalies`);
    return data;
  } catch (err) {
    console.debug("Backend offline, utilizing anomalies fallback:", err.message);
    return ANOMALIES;
  }
}

export async function getAnomalyDetail(anomalyId) {
  try {
    const data = await fetchWithTimeout(`${API_BASE}/api/anomalies/${encodeURIComponent(anomalyId)}`);
    return data;
  } catch (err) {
    console.debug(`Backend offline, utilizing anomaly detail fallback for ${anomalyId}:`, err.message);
    const matched = ANOMALIES.find((a) => a.id === anomalyId);
    if (matched) {
      return getStationDetailData(matched.station);
    }
    return {
      ...ANOMALY_DETAIL,
      id: anomalyId,
    };
  }
}

export async function triggerSimulateAnomaly(stationId = "AWS-DEL-01", anomalyType = "spike") {
  try {
    const data = await fetchWithTimeout(`${API_BASE}/api/simulate-anomaly`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ station_id: stationId, anomaly_type: anomalyType }),
    });
    return data;
  } catch (err) {
    console.debug("Backend offline, simulating locally:", err.message);
    return {
      status: "processed",
      anomaly: true,
      detail: {
        ...ANOMALY_DETAIL,
        id: `AN-${Math.floor(Math.random() * 90000) + 10000}`,
        station: stationId,
      }
    };
  }
}

export async function ingestObservation(reading) {
  try {
    const data = await fetchWithTimeout(`${API_BASE}/api/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reading),
    });
    return data;
  } catch (err) {
    console.debug("Backend offline, unable to ingest observation:", err.message);
    return { status: "offline_fallback", anomaly: false };
  }
}
