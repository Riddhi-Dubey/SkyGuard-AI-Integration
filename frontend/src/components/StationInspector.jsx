import {
  Thermometer,
  Gauge,
  Droplets,
  HeartPulse,
  Clock,
  Radio,
  BatteryCharging,
  Wind,
  ShieldCheck,
  AlertOctagon,
  Cpu,
} from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function StationInspector({ station, onViewDetails }) {
  if (!station) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-line bg-base-900/60 p-8 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink-faint">
          <Gauge size={16} />
        </div>
        <p className="text-[13px] text-ink-dim">Select an Automatic Weather Station on the map to inspect telemetry.</p>
      </div>
    );
  }

  const statusKey = station.status === "warning" ? "warn" : station.status === "anomaly" ? "critical" : "healthy";

  return (
    <div className="flex h-full flex-col overflow-y-auto rounded-lg border border-line bg-base-900/80 p-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-line pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono-num text-[15px] font-semibold text-white">{station.id}</h3>
            {station.wmoId && (
              <span className="rounded bg-base-800 border border-line px-1.5 py-0.5 text-[10px] font-mono-num text-atmos-300">
                WMO {station.wmoId}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[12px] text-ink-dim font-medium">
            {station.stationName || `${station.name} Observatory`}
          </p>
          <div className="text-[11px] text-ink-faint">
            {station.state} · Lat {station.lat?.toFixed(2) ?? "28.61"}°N, Lon {station.lng?.toFixed(2) ?? "77.21"}°E
          </div>
        </div>
        <StatusBadge status={statusKey} pulse={station.status !== "healthy"} />
      </div>

      {/* Hardware & Telemetry Link strip */}
      <div className="mt-3 rounded-md border border-line bg-base-950/60 p-2.5 text-[11px]">
        <div className="flex items-center justify-between text-ink-dim">
          <span className="flex items-center gap-1">
            <Cpu size={12} className="text-atmos-400" />
            <span className="text-white font-mono-num">{station.loggerModel || "CR1000X Logger"}</span>
          </span>
          <span className="flex items-center gap-1 text-ink-faint">
            <Radio size={12} className="text-signal-good" />
            <span>INSAT-3DR DCP</span>
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink-faint font-mono-num">
          <span className="flex items-center gap-1">
            <BatteryCharging size={11} className="text-meteo-battery" />
            {station.batteryVolt ?? 12.8}V DC ({station.solarWatts ?? 38}W PV)
          </span>
          <span>Tower: {station.mastHeight || "10m Mast"}</span>
        </div>
      </div>

      {/* Atmospheric Telemetry Grid */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <Metric icon={Thermometer} label="Air Temp (1.5m)" value={`${station.temp} °C`} color="text-meteo-temp" />
        <Metric icon={Gauge} label="MSL Pressure" value={`${station.pressure} hPa`} color="text-meteo-pressure" />
        <Metric icon={Droplets} label="Humidity (RH)" value={`${station.humidity}%`} color="text-meteo-humidity" subtext={`Td: ${station.dewPoint ?? 18.2}°C`} />
        <Metric icon={Wind} label="Wind (10m AGL)" value={`${station.windSpeed ?? 3.8} m/s`} color="text-meteo-wind" subtext={station.windDir?.split(" ")[0] || "WSW"} />
      </div>

      {/* WMO Quality Control (QC) status flags */}
      <div className="mt-3 rounded-md border border-line bg-base-950/40 p-2.5 text-[11px]">
        <div className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold mb-1.5">
          WMO-No. 8 Real-Time Quality Control (QC)
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-ink-dim">QC-1 Physical Range Check</span>
            <span className="flex items-center gap-1 font-mono-num text-[10px] text-signal-good font-semibold">
              <ShieldCheck size={11} /> PASSED
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-dim">QC-2 Step / Rate Check</span>
            <span className={`flex items-center gap-1 font-mono-num text-[10px] font-semibold ${
              station.status === "anomaly" ? "text-signal-bad" : "text-signal-good"
            }`}>
              {station.status === "anomaly" ? (
                <>
                  <AlertOctagon size={11} /> FAILED
                </>
              ) : (
                <>
                  <ShieldCheck size={11} /> PASSED
                </>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-dim">QC-3 Spatial Consistency</span>
            <span className={`flex items-center gap-1 font-mono-num text-[10px] font-semibold ${
              station.status === "anomaly" ? "text-signal-warn" : "text-signal-good"
            }`}>
              {station.status === "anomaly" ? "SUSPECT" : "NOMINAL"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-ink-faint font-mono-num">
        <span className="flex items-center gap-1">
          <Clock size={11} /> Synoptic Packet 10:42:18 IST
        </span>
        <span className="flex items-center gap-1 text-signal-good">
          <HeartPulse size={11} /> Sensor Health {station.health}%
        </span>
      </div>

      <button
        onClick={onViewDetails}
        className="mt-3 w-full rounded-md border border-atmos-500/40 bg-atmos-500/10 py-2 text-[12px] font-medium text-atmos-300 transition-colors hover:bg-atmos-500/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-atmos-400"
      >
        View Full WMO Diagnostic & SHAP Analysis
      </button>
    </div>
  );
}

function Metric({ icon: Icon, label, value, color = "text-white", subtext }) {
  return (
    <div className="rounded-md border border-line bg-base-950/50 p-2.5">
      <div className="flex items-center justify-between text-[10px] text-ink-faint">
        <span className="flex items-center gap-1">
          <Icon size={11} className={color} />
          {label}
        </span>
        {subtext && <span className="font-mono-num text-ink-dim">{subtext}</span>}
      </div>
      <div className="mt-1 font-mono-num text-[15px] font-semibold text-white">{value}</div>
    </div>
  );
}
