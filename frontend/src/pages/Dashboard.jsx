import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, Zap } from "lucide-react";
import Sidebar from "../components/Sidebar";
import KPICard from "../components/KPICard";
import NetworkMap from "../components/NetworkMap";
import StationInspector from "../components/StationInspector";
import SensorChart from "../components/SensorChart";
import AnomalyTable from "../components/AnomalyTable";
import AnomalyDetail from "../components/AnomalyDetail";
import AIInsight from "../components/AIInsight";
import ShapChart from "../components/ShapChart";
import MaintenanceRisk from "../components/MaintenanceRisk";
import Toast from "../components/Toast";
import {
  STATIONS,
  SENSOR_SERIES,
  NETWORK_STATS,
  KPI_SPARKLINES,
  ANOMALIES,
  ANOMALY_DETAIL,
  ANOMALY_STATION_ID,
  SHAP_CONTRIBUTIONS,
} from "../data/mockData";
import {
  getStations,
  getStationSeries,
  getNetworkStats,
  getAnomalies,
  getAnomalyDetail,
  triggerSimulateAnomaly,
} from "../services/api";

function formatClock(d) {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Dashboard() {
  const [navActive, setNavActive] = useState("overview");
  const [focusedSection, setFocusedSection] = useState(null);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const handleNavSelect = (id) => {
    setNavActive(id);
    if (focusedSection === id) {
      setFocusedSection(null);
    } else {
      setFocusedSection(id);
      const el = document.getElementById(`section-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleClearFocus = () => {
    setFocusedSection(null);
  };

  const getSectionClass = (sectionId) => {
    const base = "scroll-mt-24 transition-all duration-500 ease-in-out relative rounded-2xl";
    if (!focusedSection) {
      return `${base} opacity-100 filter-none`;
    }
    if (focusedSection === sectionId) {
      return `${base} opacity-100 filter-none ring-2 ring-atmos-400 shadow-[0_0_35px_rgba(75,188,220,0.22)] bg-base-900/40 p-4 sm:p-5 -m-2 sm:-m-3 z-10`;
    }
    return `${base} filter blur-[4px] opacity-25 scale-[0.985] cursor-pointer hover:opacity-45 select-none transition-all duration-500`;
  };
  const [selectedStationId, setSelectedStationId] = useState(ANOMALY_STATION_ID);
  const [stationSeries, setStationSeries] = useState(SENSOR_SERIES);
  const [anomalyList, setAnomalyList] = useState(ANOMALIES);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [clock, setClock] = useState(new Date("2026-08-30T10:42:18"));
  const [observations, setObservations] = useState(NETWORK_STATS.observations);
  const [activeAnomalies, setActiveAnomalies] = useState(NETWORK_STATS.activeAnomalies);
  const [networkHealth, setNetworkHealth] = useState(NETWORK_STATS.networkHealth);
  const [stationsOnline, setStationsOnline] = useState(NETWORK_STATS.stationsOnline);
  const [sparklines, setSparklines] = useState(KPI_SPARKLINES);
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState(STATIONS);
  const [isSimulating, setIsSimulating] = useState(false);
  const toastIdRef = useRef(0);

  const selectedStation = stations.find((s) => s.id === selectedStationId) || null;

  // Initial Data Fetch from FastAPI Backend (with fallback)
  useEffect(() => {
    let mounted = true;
    async function loadInitialData() {
      try {
        const [stns, stats, anoms] = await Promise.all([
          getStations(),
          getNetworkStats(),
          getAnomalies(),
        ]);
        if (mounted) {
          if (stns && stns.length > 0) setStations(stns);
          if (stats) {
            if (stats.observations) setObservations(stats.observations);
            if (stats.activeAnomalies !== undefined) setActiveAnomalies(stats.activeAnomalies);
            if (stats.networkHealth !== undefined) setNetworkHealth(stats.networkHealth);
            if (stats.stationsOnline !== undefined) setStationsOnline(stats.stationsOnline);
            if (stats.sparklines) setSparklines(stats.sparklines);
          }
          if (anoms && anoms.length > 0) setAnomalyList(anoms);
          setLoading(false);
        }
      } catch (err) {
        console.debug("Backend initial fetch error, maintaining fallback:", err);
        if (mounted) setLoading(false);
      }
    }
    loadInitialData();
    return () => { mounted = false; };
  }, []);

  // Fetch 60-Minute Sliding Series when selected station changes
  useEffect(() => {
    let mounted = true;
    async function loadSeries() {
      try {
        const series = await getStationSeries(selectedStationId);
        if (mounted && series && series.length > 0) {
          setStationSeries(series);
        }
      } catch (err) {
        console.debug("Station series fetch error:", err);
      }
    }
    loadSeries();
    return () => { mounted = false; };
  }, [selectedStationId]);

  // Clock + observation counter tick
  useEffect(() => {
    const interval = setInterval(() => {
      setClock((c) => new Date(c.getTime() + 1000));
      setObservations((o) => o + Math.floor(Math.random() * 4) + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Tiny live wobble on station readings
  useEffect(() => {
    const interval = setInterval(() => {
      setStations((prev) =>
        prev.map((s) => ({
          ...s,
          temp: Number((s.temp + (Math.random() - 0.5) * 0.2).toFixed(1)),
          humidity: Math.max(20, Math.min(95, Number((s.humidity + (Math.random() - 0.5) * 0.6).toFixed(0)))),
        }))
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Open Full LangGraph Diagnostic Drawer
  const openAnomalyDetail = async (anomaly) => {
    if (!anomaly) return;
    try {
      const detail = await getAnomalyDetail(anomaly.id);
      setSelectedAnomaly({
        ...detail,
        station: anomaly.station || detail.station,
        severity: anomaly.severity || detail.severity,
        confidence: anomaly.confidence || detail.confidence,
      });
    } catch {
      setSelectedAnomaly({
        ...ANOMALY_DETAIL,
        station: anomaly.station,
        severity: anomaly.severity,
        confidence: anomaly.confidence,
      });
    }
    setPanelOpen(true);
  };

  // Interactive Anomaly Simulation
  const handleSimulateAnomaly = async () => {
    setIsSimulating(true);
    try {
      const res = await triggerSimulateAnomaly(selectedStationId || "AWS-DEL-01", "spike");
      if (res?.detail) {
        const detail = res.detail;
        const newEntry = {
          id: detail.id || `AN-${Math.floor(Math.random() * 90000) + 10000}`,
          time: formatClock(new Date()),
          station: detail.station,
          stationName: detail.stationName || "Delhi",
          parameter: detail.parameter || "Temperature",
          observed: `${detail.observed}°C`,
          expected: `${detail.expected}°C`,
          severity: detail.severity || "critical",
          confidence: detail.confidence || 98.5,
          rootCause: detail.probableRootCause || "Sensor Spike",
        };
        setAnomalyList((prev) => [newEntry, ...prev].slice(0, 15));
        setActiveAnomalies((n) => n + 1);
        setStations((prev) =>
          prev.map((s) => (s.id === detail.station ? { ...s, status: "anomaly", health: Math.max(25, s.health - 8) } : s))
        );

        // Refresh series to display newly injected spike
        const updatedSeries = await getStationSeries(selectedStationId);
        if (updatedSeries && updatedSeries.length > 0) {
          setStationSeries(updatedSeries);
        }

        const id = ++toastIdRef.current;
        setToasts((prev) => [...prev, { id, station: detail.station, parameter: detail.parameter, confidence: detail.confidence }]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const kpis = useMemo(
    () => [
      {
        label: "Stations Online",
        value: `${stationsOnline}`,
        suffix: `/ ${NETWORK_STATS.stationsTotal}`,
        trend: "+2 this week",
        trendDirection: "up",
        status: "good",
        sparkline: sparklines.stationsOnline,
      },
      {
        label: "Observations",
        value: observations.toLocaleString("en-IN"),
        trend: "live",
        trendDirection: "up",
        status: "info",
        sparkline: sparklines.observations,
      },
      {
        label: "Active Anomalies",
        value: `${activeAnomalies}`,
        trend: "+3 vs yesterday",
        trendDirection: "down",
        status: "warn",
        sparkline: sparklines.activeAnomalies,
      },
      {
        label: "Network Health",
        value: `${networkHealth}%`,
        trend: "-0.4% vs 1h",
        trendDirection: "down",
        status: "good",
        sparkline: sparklines.networkHealth,
      },
    ],
    [observations, activeAnomalies, stationsOnline, networkHealth, sparklines]
  );

  const seriesToUse = stationSeries && stationSeries.length > 0 ? stationSeries : SENSOR_SERIES;
  const tempCurrent = seriesToUse[seriesToUse.length - 1]?.temp ?? 24.6;
  const tempMin = Math.min(...seriesToUse.map((d) => d.temp));
  const tempMax = Math.max(...seriesToUse.map((d) => d.temp));
  const pressureCurrent = seriesToUse[seriesToUse.length - 1]?.pressure ?? 1012.4;
  const pressureMin = Math.min(...seriesToUse.map((d) => d.pressure));
  const pressureMax = Math.max(...seriesToUse.map((d) => d.pressure));
  const humidityCurrent = seriesToUse[seriesToUse.length - 1]?.humidity ?? 68.0;
  const humidityMin = Math.min(...seriesToUse.map((d) => d.humidity));
  const humidityMax = Math.max(...seriesToUse.map((d) => d.humidity));

  return (
    <div className="flex min-h-screen bg-base-950">
      <Sidebar
        active={navActive}
        onSelect={handleNavSelect}
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-line bg-base-950/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md border border-line p-2 text-ink-dim lg:hidden"
              onClick={() => setMobileSidebar(true)}
              aria-label="Open menu"
            >
              <Menu size={16} />
            </button>
            <div>
              <h1 className="text-[17px] font-semibold tracking-tight text-white">Weather Intelligence Command Center</h1>
              <p className="text-[12px] text-ink-dim">Real-time monitoring across the AWS observation network.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[12px] text-ink-dim">
            {/* Live Interactive Trigger Button */}
            <button
              onClick={handleSimulateAnomaly}
              disabled={isSimulating}
              className="flex items-center gap-1.5 rounded-full border border-signal-warn/30 bg-signal-warn/10 px-3 py-1 text-signal-warn transition-all hover:bg-signal-warn/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal-warn disabled:opacity-50"
              title="Inject test anomaly via ML & LangGraph engine"
            >
              <Zap size={13} className={isSimulating ? "animate-spin text-signal-bad" : ""} />
              {isSimulating ? "Analyzing ML..." : "Inject Test Anomaly"}
            </button>

            <div className="flex items-center gap-1.5 rounded-full border border-signal-good/25 bg-signal-good/10 px-2.5 py-1 text-signal-good">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-good opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-good" />
              </span>
              LIVE
            </div>
            <span className="font-mono-num">Last updated: {formatClock(clock)}</span>
          </div>
        </header>

        <main className="flex-1 space-y-6 px-6 py-6">
          {/* Active Focus Pill when an option is chosen */}
          {focusedSection && (
            <div className="sticky top-20 z-20 mx-auto -mt-2 mb-2 flex w-fit items-center gap-3 rounded-full border border-atmos-400/40 bg-base-900/95 px-4 py-1.5 shadow-2xl backdrop-blur-md animate-toast-in text-[12px] text-ink">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-atmos-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-atmos-400" />
              </span>
              <span>
                Focusing on:{" "}
                <strong className="text-white capitalize">
                  {focusedSection === "overview"
                    ? "Overview (KPIs)"
                    : focusedSection === "stations"
                    ? "AWS Stations & Network"
                    : focusedSection === "monitoring"
                    ? "Live Sensor Monitoring"
                    : focusedSection === "anomalies"
                    ? "Recent Anomalies"
                    : "AI Analytics & Diagnostics"}
                </strong>
              </span>
              <button
                onClick={handleClearFocus}
                className="ml-2 rounded-full bg-atmos-400/15 border border-atmos-400/30 px-2.5 py-0.5 text-[11px] font-medium text-atmos-300 hover:bg-atmos-400/25 hover:text-white transition-all"
              >
                Show All Sections ✕
              </button>
            </div>
          )}

          {/* Section 1: Overview */}
          <section
            id="section-overview"
            className={getSectionClass("overview")}
            onClick={() => {
              if (focusedSection && focusedSection !== "overview") handleNavSelect("overview");
            }}
          >
            {focusedSection === "overview" && (
              <div className="mb-3 flex items-center justify-between border-b border-atmos-400/20 pb-2.5">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-atmos-300">
                  Overview & Network KPI Metrics
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFocus();
                  }}
                  className="rounded px-2 py-0.5 text-[11px] font-medium text-ink-dim hover:bg-base-800 hover:text-white"
                >
                  Show All ✕
                </button>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-[104px] rounded-lg border border-line bg-base-900/60 p-5">
                      <div className="skeleton h-3 w-24 rounded" />
                      <div className="skeleton mt-4 h-6 w-16 rounded" />
                    </div>
                  ))
                : kpis.map((k) => <KPICard key={k.label} {...k} />)}
            </div>
          </section>

          {/* Section 2: Stations */}
          <section
            id="section-stations"
            className={getSectionClass("stations")}
            onClick={() => {
              if (focusedSection && focusedSection !== "stations") handleNavSelect("stations");
            }}
          >
            {focusedSection === "stations" && (
              <div className="mb-3 flex items-center justify-between border-b border-atmos-400/20 pb-2.5">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-atmos-300">
                  AWS Network Observation & Station Inspector
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFocus();
                  }}
                  className="rounded px-2 py-0.5 text-[11px] font-medium text-ink-dim hover:bg-base-800 hover:text-white"
                >
                  Show All ✕
                </button>
              </div>
            )}
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[14px] font-semibold text-white">AWS Network</h2>
                  <span className="text-[12px] text-ink-faint">{stations.length} stations shown</span>
                </div>
                <NetworkMap stations={stations} selectedId={selectedStationId} onSelect={setSelectedStationId} />
              </div>
              <div>
                <h2 className="mb-3 text-[14px] font-semibold text-white">Station Inspector</h2>
                <div className="h-[460px] lg:h-[520px]">
                  <StationInspector station={selectedStation} onViewDetails={() => openAnomalyDetail(anomalyList[0])} />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Live Monitoring */}
          <section
            id="section-monitoring"
            className={getSectionClass("monitoring")}
            onClick={() => {
              if (focusedSection && focusedSection !== "monitoring") handleNavSelect("monitoring");
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-white">Live Sensor Charts — {selectedStation?.id ?? "AWS-DEL-01"}</h2>
              {focusedSection === "monitoring" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFocus();
                  }}
                  className="rounded px-2 py-0.5 text-[11px] font-medium text-ink-dim hover:bg-base-800 hover:text-white"
                >
                  Show All ✕
                </button>
              )}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <SensorChart
                title="Temperature"
                data={seriesToUse}
                dataKey="temp"
                unit="°C"
                color="#4bbcdc"
                min={tempMin}
                max={tempMax}
                current={tempCurrent}
              />
              <SensorChart
                title="Atmospheric Pressure"
                data={seriesToUse}
                dataKey="pressure"
                unit=" hPa"
                color="#7ad4ec"
                min={pressureMin}
                max={pressureMax}
                current={pressureCurrent}
              />
              <SensorChart
                title="Relative Humidity"
                data={seriesToUse}
                dataKey="humidity"
                unit="%"
                color="#5fd3f0"
                min={humidityMin}
                max={humidityMax}
                current={humidityCurrent}
              />
            </div>
          </section>

          {/* Section 4: Recent Anomalies */}
          <section
            id="section-anomalies"
            className={getSectionClass("anomalies")}
            onClick={() => {
              if (focusedSection && focusedSection !== "anomalies") handleNavSelect("anomalies");
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-white">Recent Anomalies</h2>
                <span className="text-[12px] text-ink-faint">Click a row for full explainability</span>
              </div>
              {focusedSection === "anomalies" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFocus();
                  }}
                  className="rounded px-2 py-0.5 text-[11px] font-medium text-ink-dim hover:bg-base-800 hover:text-white"
                >
                  Show All ✕
                </button>
              )}
            </div>
            <AnomalyTable anomalies={anomalyList} onSelect={openAnomalyDetail} />
          </section>

          {/* Section 5: AI Analytics & Diagnostics */}
          <section
            id="section-analytics"
            className={getSectionClass("analytics")}
            onClick={() => {
              if (focusedSection && focusedSection !== "analytics") handleNavSelect("analytics");
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-white">AI Analytics & Root Cause Explainability</h2>
                <span className="text-[12px] text-ink-faint">SHAP feature attributions, model diagnostics & maintenance risk</span>
              </div>
              {focusedSection === "analytics" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFocus();
                  }}
                  className="rounded px-2 py-0.5 text-[11px] font-medium text-ink-dim hover:bg-base-800 hover:text-white"
                >
                  Show All ✕
                </button>
              )}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <AIInsight
                assessment={
                  selectedAnomaly?.aiAssessment ||
                  ANOMALY_DETAIL.aiAssessment ||
                  "Automated sensor telemetry evaluation detected potential deviation in environmental readings."
                }
                rootCause={selectedAnomaly?.probableRootCause || ANOMALY_DETAIL.probableRootCause || "Sensor Drift"}
                action={selectedAnomaly?.recommendedAction || ANOMALY_DETAIL.recommendedAction || "Verify station calibration."}
              />
              <ShapChart
                contributions={selectedAnomaly?.shapContributions || SHAP_CONTRIBUTIONS}
              />
              <MaintenanceRisk
                level={selectedAnomaly?.maintenanceRisk?.level || ANOMALY_DETAIL.maintenanceRisk?.level || "MEDIUM-HIGH"}
                score={selectedAnomaly?.maintenanceRisk?.score || ANOMALY_DETAIL.maintenanceRisk?.score || 78}
                reason={selectedAnomaly?.maintenanceRisk?.reason || ANOMALY_DETAIL.maintenanceRisk?.reason || "Repeated anomalies flagged in recent observation cycles."}
              />
            </div>
          </section>
        </main>
      </div>

      <AnomalyDetail detail={selectedAnomaly} open={panelOpen} onClose={() => setPanelOpen(false)} />
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
