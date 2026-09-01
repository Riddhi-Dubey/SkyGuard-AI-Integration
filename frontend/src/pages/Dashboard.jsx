import { useEffect, useMemo, useRef, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import KPICard from "../components/KPICard";
import NetworkMap from "../components/NetworkMap";
import StationInspector from "../components/StationInspector";
import SensorChart from "../components/SensorChart";
import AnomalyTable from "../components/AnomalyTable";
import AnomalyDetail from "../components/AnomalyDetail";
import Toast from "../components/Toast";
import {
  STATIONS,
  SENSOR_SERIES,
  NETWORK_STATS,
  KPI_SPARKLINES,
  ANOMALIES,
  ANOMALY_DETAIL,
  ANOMALY_STATION_ID,
} from "../data/mockData";

function formatClock(d) {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Dashboard() {
  const [navActive, setNavActive] = useState("overview");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState(ANOMALY_STATION_ID);
  const [anomalyList, setAnomalyList] = useState(ANOMALIES);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [clock, setClock] = useState(new Date("2026-08-30T10:42:18"));
  const [observations, setObservations] = useState(NETWORK_STATS.observations);
  const [activeAnomalies, setActiveAnomalies] = useState(NETWORK_STATS.activeAnomalies);
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState(STATIONS);
  const toastIdRef = useRef(0);

  const selectedStation = stations.find((s) => s.id === selectedStationId) || null;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

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

  // Occasional simulated anomaly event
  useEffect(() => {
    const interval = setInterval(() => {
      const pool = [
        { station: "AWS-DEL-01", stationName: "Delhi", parameter: "Temperature", observed: "54.1°C", expected: "24.9°C", rootCause: "Sensor Spike" },
        { station: "AWS-MUM-04", stationName: "Mumbai", parameter: "Humidity", observed: "98.7%", expected: "73.1%", rootCause: "Possible Sensor Drift" },
        { station: "AWS-GHY-08", stationName: "Guwahati", parameter: "Pressure", observed: "—", expected: "1004.6 hPa", rootCause: "Communication Failure" },
      ];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const confidence = Number((85 + Math.random() * 13).toFixed(1));
      const now = formatClock(new Date());

      const entry = {
        id: `AN-${Math.floor(Math.random() * 90000) + 10000}`,
        time: now,
        severity: confidence > 90 ? "critical" : "warning",
        confidence,
        ...pick,
      };

      setAnomalyList((prev) => [entry, ...prev].slice(0, 12));
      setActiveAnomalies((n) => n + 1);
      setStations((prev) =>
        prev.map((s) => (s.id === entry.station ? { ...s, status: "anomaly", health: Math.max(30, s.health - 6) } : s))
      );

      const id = ++toastIdRef.current;
      setToasts((prev) => [...prev, { id, station: entry.station, parameter: entry.parameter, confidence: entry.confidence }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    }, 22000);
    return () => clearInterval(interval);
  }, []);

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const openAnomalyDetail = (anomaly) => {
    setSelectedAnomaly({ ...ANOMALY_DETAIL, station: anomaly.station, severity: anomaly.severity, confidence: anomaly.confidence });
    setPanelOpen(true);
  };

  const kpis = useMemo(
    () => [
      {
        label: "Stations Online",
        value: `${NETWORK_STATS.stationsOnline}`,
        suffix: `/ ${NETWORK_STATS.stationsTotal}`,
        trend: "+2 this week",
        trendDirection: "up",
        status: "good",
        sparkline: KPI_SPARKLINES.stationsOnline,
      },
      {
        label: "Observations",
        value: observations.toLocaleString("en-IN"),
        trend: "live",
        trendDirection: "up",
        status: "info",
        sparkline: KPI_SPARKLINES.observations,
      },
      {
        label: "Active Anomalies",
        value: `${activeAnomalies}`,
        trend: "+3 vs yesterday",
        trendDirection: "down",
        status: "warn",
        sparkline: KPI_SPARKLINES.activeAnomalies,
      },
      {
        label: "Network Health",
        value: `${NETWORK_STATS.networkHealth}%`,
        trend: "-0.4% vs 1h",
        trendDirection: "down",
        status: "good",
        sparkline: KPI_SPARKLINES.networkHealth,
      },
    ],
    [observations, activeAnomalies]
  );

  const tempCurrent = SENSOR_SERIES[SENSOR_SERIES.length - 1].temp;
  const tempMin = Math.min(...SENSOR_SERIES.map((d) => d.temp));
  const tempMax = Math.max(...SENSOR_SERIES.map((d) => d.temp));
  const pressureCurrent = SENSOR_SERIES[SENSOR_SERIES.length - 1].pressure;
  const pressureMin = Math.min(...SENSOR_SERIES.map((d) => d.pressure));
  const pressureMax = Math.max(...SENSOR_SERIES.map((d) => d.pressure));
  const humidityCurrent = SENSOR_SERIES[SENSOR_SERIES.length - 1].humidity;
  const humidityMin = Math.min(...SENSOR_SERIES.map((d) => d.humidity));
  const humidityMax = Math.max(...SENSOR_SERIES.map((d) => d.humidity));

  return (
    <div className="flex min-h-screen bg-base-950">
      <Sidebar
        active={navActive}
        onSelect={setNavActive}
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
          {/* KPI cards */}
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

          {/* Map + Inspector */}
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

          {/* Sensor charts */}
          <div>
            <h2 className="mb-3 text-[14px] font-semibold text-white">Live Sensor Charts — {selectedStation?.id ?? "AWS-DEL-01"}</h2>
            <div className="grid gap-4 lg:grid-cols-3">
              <SensorChart
                title="Temperature"
                data={SENSOR_SERIES}
                dataKey="temp"
                unit="°C"
                color="#4bbcdc"
                min={tempMin}
                max={tempMax}
                current={tempCurrent}
              />
              <SensorChart
                title="Atmospheric Pressure"
                data={SENSOR_SERIES}
                dataKey="pressure"
                unit=" hPa"
                color="#7ad4ec"
                min={pressureMin}
                max={pressureMax}
                current={pressureCurrent}
              />
              <SensorChart
                title="Relative Humidity"
                data={SENSOR_SERIES}
                dataKey="humidity"
                unit="%"
                color="#5fd3f0"
                min={humidityMin}
                max={humidityMax}
                current={humidityCurrent}
              />
            </div>
          </div>

          {/* Anomaly table */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-white">Recent Anomalies</h2>
              <span className="text-[12px] text-ink-faint">Click a row for full explainability</span>
            </div>
            <AnomalyTable anomalies={anomalyList} onSelect={openAnomalyDetail} />
          </div>
        </main>
      </div>

      <AnomalyDetail detail={selectedAnomaly} open={panelOpen} onClose={() => setPanelOpen(false)} />
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
