import { Thermometer, Gauge, Droplets, HeartPulse, Clock } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function StationInspector({ station, onViewDetails }) {
  if (!station) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-line bg-base-900/60 p-8 text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-ink-faint">
          <Gauge size={16} />
        </div>
        <p className="text-[13px] text-ink-dim">Select a station on the map to inspect its readings.</p>
      </div>
    );
  }

  const statusKey = station.status === "warning" ? "warn" : station.status === "anomaly" ? "critical" : "healthy";

  return (
    <div className="flex h-full flex-col rounded-lg border border-line bg-base-900/60 p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-mono-num text-[15px] font-semibold text-white">{station.id}</h3>
          <p className="mt-0.5 text-[12px] text-ink-dim">
            {station.name}, {station.state === station.name ? "India" : "India"}
          </p>
        </div>
        <StatusBadge status={statusKey} pulse={station.status !== "healthy"} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Metric icon={Thermometer} label="Temperature" value={`${station.temp} °C`} />
        <Metric icon={Gauge} label="Pressure" value={`${station.pressure} hPa`} />
        <Metric icon={Droplets} label="Humidity" value={`${station.humidity}%`} />
        <Metric icon={HeartPulse} label="Sensor Health" value={`${station.health}%`} />
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-[11px] text-ink-faint">
        <Clock size={12} />
        Last update 10:42:18
      </div>

      <button
        onClick={onViewDetails}
        className="mt-6 w-full rounded-md border border-line-strong py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-atmos-400/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-atmos-400"
      >
        View Details
      </button>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-md border border-line bg-base-950/40 p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-ink-faint">
        <Icon size={12} />
        {label}
      </div>
      <div className="mt-1.5 font-mono-num text-[16px] font-semibold text-white">{value}</div>
    </div>
  );
}
