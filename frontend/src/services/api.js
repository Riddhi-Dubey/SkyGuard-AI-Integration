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

const IS_LOCAL = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const API_BASE = import.meta.env?.VITE_API_URL || (IS_LOCAL ? "http://127.0.0.1:8000" : "");

async function fetchWithTimeout(url, options = {}, timeoutMs = 3500) {
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
    const url = IS_LOCAL ? `${API_BASE}/api/stations` : STATIONS;
    if (!IS_LOCAL) return STATIONS;
    const data = await fetchWithTimeout(url);
    return data;
  } catch (err) {
    console.debug("Backend offline, utilizing stations fallback:", err.message);
    return STATIONS;
  }
}

export async function getStationSeries(stationId) {
  try {
    if (!IS_LOCAL) return SENSOR_SERIES;
    const data = await fetchWithTimeout(`${API_BASE}/api/stations/${encodeURIComponent(stationId)}/series`);
    return data;
  } catch (err) {
    console.debug(`Backend offline, utilizing series fallback for ${stationId}:`, err.message);
    return SENSOR_SERIES;
  }
}

export async function getNetworkStats() {
  try {
    if (!IS_LOCAL) return { ...NETWORK_STATS, sparklines: KPI_SPARKLINES };
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
    if (!IS_LOCAL) return ANOMALIES;
    const data = await fetchWithTimeout(`${API_BASE}/api/anomalies`);
    return data;
  } catch (err) {
    console.debug("Backend offline, utilizing anomalies fallback:", err.message);
    return ANOMALIES;
  }
}

export async function getAnomalyDetail(anomalyId) {
  try {
    if (!IS_LOCAL) {
      const matched = ANOMALIES.find((a) => a.id === anomalyId);
      return matched ? getStationDetailData(matched.station, null, matched) : null;
    }
    const data = await fetchWithTimeout(`${API_BASE}/api/anomalies/${encodeURIComponent(anomalyId)}`);
    return data;
  } catch (err) {
    console.debug(`Backend offline, utilizing anomaly detail fallback for ${anomalyId}:`, err.message);
    const matched = ANOMALIES.find((a) => a.id === anomalyId);
    if (matched) {
      return getStationDetailData(matched.station, null, matched);
    }
    return null;
  }
}

export async function triggerSimulateAnomaly(stationId = "AWS-DEL-01", anomalyType = "spike") {
  // 1. If deployed on Netlify, call Netlify serverless function
  const netlifyUrl = "/.netlify/functions/simulate-anomaly";
  const localUrl = `${API_BASE}/api/simulate-anomaly`;
  const primaryUrl = IS_LOCAL ? localUrl : netlifyUrl;

  try {
    const data = await fetchWithTimeout(primaryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ station_id: stationId, anomaly_type: anomalyType }),
    }, 6000);
    return data;
  } catch (err) {
    console.debug("Primary anomaly endpoint failed, attempting fallback:", err.message);
  }

  // 2. If on localhost and primary failed, try netlify function or mock fallback
  const station = STATIONS.find((s) => s.id === stationId) || STATIONS[0];
  const generatedDetail = getStationDetailData(stationId, { ...station, status: "anomaly", temp: 55.0 });
  return {
    status: "processed",
    anomaly: true,
    detail: generatedDetail,
  };
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
