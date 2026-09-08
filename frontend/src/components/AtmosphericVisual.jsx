import { useEffect, useState } from "react";
import {
  Radio,
  Sun,
  Wind,
  Gauge,
  Thermometer,
  Droplets,
  BatteryCharging,
  Cpu,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

const AWS_PRESETS = [
  {
    id: "AWS-DEL-01",
    name: "New Delhi (Safdarjung)",
    wmo: "42182",
    temp: 24.6,
    pressure: 1012.4,
    humidity: 68,
    dewPoint: 18.2,
    windSpeed: 3.8,
    windDir: "WSW (245°)",
    solar: 820,
    battery: 12.8,
    uplink: "INSAT-3DR DCP Burst",
    status: "healthy",
    logger: "Campbell CR1000X",
  },
  {
    id: "AWS-JAI-02",
    name: "Jaipur (Sanganer Met)",
    wmo: "42348",
    temp: 55.0, // Active Injected Anomaly
    pressure: 1008.2,
    humidity: 41,
    dewPoint: 10.4,
    windSpeed: 4.6,
    windDir: "WNW (290°)",
    solar: 920,
    battery: 11.8,
    uplink: "INSAT-3DR DCP Burst",
    status: "anomaly",
    logger: "Campbell CR800",
  },
  {
    id: "AWS-MUM-04",
    name: "Mumbai (Colaba Coastal)",
    wmo: "43003",
    temp: 29.8,
    pressure: 1008.9,
    humidity: 78,
    dewPoint: 25.4,
    windSpeed: 5.2,
    windDir: "SW (220°)",
    solar: 640,
    battery: 12.3,
    uplink: "Dual 4G + INSAT-3DR",
    status: "warning",
    logger: "Vaisala AWS310",
  },
];

export default function AtmosphericVisual() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeSensor, setActiveSensor] = useState("temp");
  const [pulse, setPulse] = useState(false);

  const activeStation = AWS_PRESETS[selectedIdx];

  // Periodic telemetry pulse simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1200);
      return () => clearTimeout(timer);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-full min-h-[480px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Top AWS Header bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-sky-200 bg-sky-50 text-sky-600">
            <Radio size={14} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-slate-900 tracking-wide">
                AUTOMATIC WEATHER STATION (AWS)
              </span>
              <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-mono-num font-bold text-sky-700">
                10m MAST RIG
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              IMD Surface Synoptic Observing System · WMO-No. 8 Standards
            </div>
          </div>
        </div>

        {/* Station switcher tabs */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
          {AWS_PRESETS.map((stn, idx) => (
            <button
              key={stn.id}
              onClick={() => setSelectedIdx(idx)}
              className={`rounded px-2.5 py-1 text-[11px] font-mono-num font-medium transition-all ${
                selectedIdx === idx
                  ? stn.status === "anomaly"
                    ? "bg-rose-50 border border-rose-300 text-rose-700 font-bold"
                    : "bg-sky-50 border border-sky-300 text-sky-700 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {stn.id.split("-")[1]}
              {stn.status === "anomaly" && " ⚠️"}
            </button>
          ))}
        </div>
      </div>

      {/* Main AWS Instrument Rig Schematic & Sensor Telemetry Layout */}
      <div className="relative flex-1 p-5">
        <div className="grid h-full gap-5 lg:grid-cols-[1.3fr_1fr]">
          {/* Left: AWS 10m Tower Structural Schematic Diagram (Vector SVG) */}
          <div className="relative flex items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-b from-sky-50/60 via-slate-50/40 to-white p-4 overflow-hidden">
            {/* Simulated atmospheric altitude bands */}
            <div className="absolute left-2.5 top-3 text-[10px] font-mono-num text-slate-400 font-medium">
              10.0m AGL (Wind)
            </div>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono-num text-slate-400 font-medium">
              1.5m AGL (Screen)
            </div>
            <div className="absolute left-2.5 bottom-3 text-[10px] font-mono-num text-slate-400 font-medium">
              0.0m Surface (Rain)
            </div>

            {/* AWS Mast Diagram */}
            <svg viewBox="0 0 260 280" className="h-full max-h-[290px] w-auto select-none">
              <defs>
                <linearGradient id="mastMetal" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                <linearGradient id="solarGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Ground level reference */}
              <line x1="10" y1="260" x2="250" y2="260" stroke="#cbd5e1" strokeWidth="2" />
              <line x1="20" y1="264" x2="240" y2="264" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />

              {/* Guy Wires */}
              <line x1="30" y1="260" x2="130" y2="70" stroke="#94a3b8" strokeWidth="0.9" opacity="0.6" />
              <line x1="230" y1="260" x2="130" y2="70" stroke="#94a3b8" strokeWidth="0.9" opacity="0.6" />

              {/* Central Lattice Mast */}
              <rect x="127" y="30" width="6" height="230" fill="url(#mastMetal)" rx="1" />
              {/* Lattice cross-bracing */}
              {[45, 75, 105, 135, 165, 195, 225].map((y) => (
                <g key={y}>
                  <line x1="120" y1={y} x2="140" y2={y + 20} stroke="#94a3b8" strokeWidth="0.8" opacity="0.7" />
                  <line x1="140" y1={y} x2="120" y2={y + 20} stroke="#94a3b8" strokeWidth="0.8" opacity="0.7" />
                  <line x1="120" y1={y} x2="140" y2={y} stroke="#64748b" strokeWidth="1" opacity="0.8" />
                </g>
              ))}

              {/* TOP CROSSARM (10m) */}
              <rect x="75" y="38" width="110" height="3.5" fill="#64748b" rx="1" />

              {/* 1. Anemometer & Wind Vane (Left Top Arm) */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setActiveSensor("wind")}
              >
                <circle cx="85" cy="24" r="6" fill="#f8fafc" stroke="#16a34a" strokeWidth="1.6" />
                <path d="M85 18 L85 30 M79 24 L91 24" stroke="#16a34a" strokeWidth="1.4" />
                <line x1="85" y1="30" x2="85" y2="38" stroke="#64748b" strokeWidth="1.5" />
                <text x="56" y="16" fill="#16a34a" fontSize="8" fontFamily="sans-serif" fontWeight="700">
                  WIND 3-CUP
                </text>
              </g>

              {/* 2. INSAT-3DR UHF Yagi Antenna (Right Top Arm) */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setActiveSensor("telemetry")}
              >
                <line x1="175" y1="38" x2="175" y2="18" stroke="#64748b" strokeWidth="1.5" />
                <line x1="165" y1="20" x2="185" y2="20" stroke="#0284c7" strokeWidth="1.5" />
                <line x1="168" y1="24" x2="182" y2="24" stroke="#0284c7" strokeWidth="1.5" />
                <line x1="171" y1="28" x2="179" y2="28" stroke="#0284c7" strokeWidth="1.5" />
                {/* Telemetry pulse waves */}
                {pulse && (
                  <circle cx="175" cy="16" r="10" fill="none" stroke="#0284c7" strokeWidth="1.2">
                    <animate attributeName="r" values="4;16;24" dur="1.2s" repeatCount="1" />
                    <animate attributeName="opacity" values="0.9;0.3;0" dur="1.2s" repeatCount="1" />
                  </circle>
                )}
                <text x="160" y="12" fill="#0284c7" fontSize="8" fontFamily="sans-serif" fontWeight="700">
                  INSAT-3DR
                </text>
              </g>

              {/* 3. Solar Radiation Pyranometer (Center Top) */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setActiveSensor("solar")}
              >
                <path d="M125 38 L125 22 L135 22 L135 38 Z" fill="#f1f5f9" stroke="#d97706" strokeWidth="1.2" />
                <circle cx="130" cy="20" r="3.5" fill="#d97706" opacity="0.9" />
                <text x="110" y="12" fill="#d97706" fontSize="8" fontFamily="sans-serif" fontWeight="700">
                  PYRANO
                </text>
              </g>

              {/* 4. 40W Solar PV Module (Mid-Mast at 110px) */}
              <g
                className="cursor-pointer"
                onClick={() => setActiveSensor("battery")}
              >
                <polygon
                  points="140,95 185,115 180,135 135,115"
                  fill="url(#solarGlow)"
                  stroke="#0284c7"
                  strokeWidth="1.2"
                />
                <line x1="152" y1="102" x2="147" y2="122" stroke="#0284c7" strokeWidth="0.8" opacity="0.7" />
                <line x1="168" y1="108" x2="163" y2="128" stroke="#0284c7" strokeWidth="0.8" opacity="0.7" />
                <line x1="140" y1="115" x2="185" y2="115" stroke="#0284c7" strokeWidth="0.8" opacity="0.7" />
                <text x="190" y="122" fill="#0284c7" fontSize="8" fontFamily="sans-serif" fontWeight="600">
                  40W PV
                </text>
              </g>

              {/* 5. Louvered Radiation Shield for Temp/Humidity (1.5m at 170px) */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setActiveSensor("temp")}
              >
                <rect x="90" y="155" width="28" height="2" fill="#64748b" />
                <g fill="#edf3fb">
                  {[152, 156, 160, 164, 168, 172, 176].map((ly) => (
                    <ellipse
                      key={ly}
                      cx="82"
                      cy={ly}
                      rx="9"
                      ry="2"
                      fill={activeStation.status === "anomaly" ? "#ef4444" : "#f97316"}
                      stroke="#475569"
                      strokeWidth="0.5"
                    />
                  ))}
                </g>
                <line x1="82" y1="150" x2="82" y2="180" stroke="#f97316" strokeWidth="1" />
                <text
                  x="18"
                  y="166"
                  fill={activeStation.status === "anomaly" ? "#dc2626" : "#ea580c"}
                  fontSize="8"
                  fontFamily="sans-serif"
                  fontWeight="700"
                >
                  TEMP/RH SHIELD
                </text>
              </g>

              {/* 6. NEMA Enclosure (CR1000X Logger & Barometer) at 215px */}
              <g
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => setActiveSensor("logger")}
              >
                <rect x="135" y="195" width="36" height="42" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" rx="3" />
                <circle cx="140" cy="202" r="1.5" fill="#16a34a" />
                <circle cx="140" cy="208" r="1.5" fill="#0284c7" />
                <rect x="145" y="200" width="22" height="12" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" rx="1" />
                <text x="147" y="209" fill="#0284c7" fontSize="6" fontFamily="sans-serif" fontWeight="700">
                  CR1000X
                </text>
                <text x="175" y="218" fill="#475569" fontSize="7" fontFamily="sans-serif" fontWeight="600">
                  BARO / LOGGER
                </text>
              </g>

              {/* 7. Tipping Bucket Rain Gauge (Ground level Left) */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setActiveSensor("rain")}
              >
                <path d="M60 238 L84 238 L78 260 L66 260 Z" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="1.2" />
                <ellipse cx="72" cy="238" rx="12" ry="2.5" fill="#c7d2fe" stroke="#4f46e5" strokeWidth="1" />
                <text x="35" y="252" fill="#4f46e5" fontSize="8" fontFamily="sans-serif" fontWeight="700">
                  TBRG RAIN
                </text>
              </g>
            </svg>

            {/* Click to inspect tip */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded border border-slate-200 bg-white/90 px-2 py-0.5 text-[10px] text-slate-500 shadow-xs">
              <span>Interactive Tower · Click any sensor</span>
            </div>
          </div>

          {/* Right: Live Telemetry Tele-gauge Cards & Quality Control Status */}
          <div className="flex flex-col justify-between gap-3">
            {/* Station Synoptic Banner */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    WMO SYNOP STATION {activeStation.wmo}
                  </div>
                  <div className="text-[14px] font-bold text-slate-900">
                    {activeStation.name}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      activeStation.status === "anomaly"
                        ? "bg-rose-50 text-rose-700 border border-rose-300"
                        : activeStation.status === "warning"
                        ? "bg-amber-50 text-amber-700 border border-amber-300"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-300"
                    }`}
                  >
                    {activeStation.status === "anomaly" ? (
                      <AlertTriangle size={11} />
                    ) : (
                      <ShieldCheck size={11} />
                    )}
                    {activeStation.status === "anomaly" ? "WMO QC FLAGGED" : "WMO QC PASSED"}
                  </span>
                  <div className="text-[10px] font-mono-num text-slate-500 font-medium mt-0.5">
                    {activeStation.logger}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Sensor Telemetry Live Gauges */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Temp Gauge */}
              <div
                onClick={() => setActiveSensor("temp")}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${
                  activeSensor === "temp"
                    ? "border-amber-400 bg-amber-50/50 shadow-xs ring-1 ring-amber-400/40"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Thermometer size={13} className="text-amber-600" /> Temp (RTD)
                  </span>
                  <span className="font-mono-num text-[10px] text-slate-400">1.5m</span>
                </div>
                <div
                  className={`mt-1 font-mono-num text-xl font-bold ${
                    activeStation.status === "anomaly" ? "text-rose-600 animate-pulse" : "text-slate-900"
                  }`}
                >
                  {activeStation.temp} °C
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {activeStation.status === "anomaly" ? "Spike (+30.3°C)" : "Within IMD bounds"}
                </div>
              </div>

              {/* Barometer Gauge */}
              <div
                onClick={() => setActiveSensor("logger")}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${
                  activeSensor === "logger"
                    ? "border-sky-400 bg-sky-50/50 shadow-xs ring-1 ring-sky-400/40"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Gauge size={13} className="text-sky-600" /> Pressure
                  </span>
                  <span className="font-mono-num text-[10px] text-slate-400">PTB330</span>
                </div>
                <div className="mt-1 font-mono-num text-xl font-bold text-slate-900">
                  {activeStation.pressure} hPa
                </div>
                <div className="text-[10px] text-slate-500 font-medium">MSL Barometric</div>
              </div>

              {/* Relative Humidity & Dewpoint */}
              <div
                onClick={() => setActiveSensor("temp")}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${
                  activeSensor === "temp"
                    ? "border-cyan-400 bg-cyan-50/50 shadow-xs ring-1 ring-cyan-400/40"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Droplets size={13} className="text-cyan-600" /> Humidity
                  </span>
                  <span className="font-mono-num text-[10px] text-slate-400">Td {activeStation.dewPoint}°C</span>
                </div>
                <div className="mt-1 font-mono-num text-xl font-bold text-slate-900">
                  {activeStation.humidity}%
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Capacitive probe</div>
              </div>

              {/* Wind Speed & Direction */}
              <div
                onClick={() => setActiveSensor("wind")}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${
                  activeSensor === "wind"
                    ? "border-emerald-400 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-400/40"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Wind size={13} className="text-emerald-600" /> Wind (10m)
                  </span>
                  <span className="font-mono-num text-[10px] text-slate-400">{activeStation.windDir.split(" ")[0]}</span>
                </div>
                <div className="mt-1 font-mono-num text-xl font-bold text-slate-900">
                  {activeStation.windSpeed} m/s
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{activeStation.windDir}</div>
              </div>
            </div>

            {/* Bottom Hardware Diagnostics (Power & Satellite Telemetry) */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-[11px]">
              <div className="flex items-center gap-2 text-slate-600">
                <BatteryCharging size={14} className="text-emerald-600" />
                <span>Battery: <strong className="text-slate-900 font-mono-num">{activeStation.battery}V DC</strong></span>
                <span className="text-slate-300">·</span>
                <Sun size={14} className="text-amber-600" />
                <span>Solar: <strong className="text-slate-900 font-mono-num">{activeStation.solar} W/m²</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-mono-num text-[10px] text-sky-700 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                {activeStation.uplink}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <Cpu size={13} className="text-sky-600" />
          <span>Automatic Weather Station Telemetry Rig · Sampling: <strong>1 Hz</strong> · Average Window: <strong>60s</strong></span>
        </div>
        <div className="font-mono-num font-semibold text-sky-700">
          Uplink: INSAT-3DR 402.75 MHz
        </div>
      </div>
    </div>
  );
}
