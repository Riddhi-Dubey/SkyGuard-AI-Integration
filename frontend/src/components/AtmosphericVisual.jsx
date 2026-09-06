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
    <div className="relative flex h-full min-h-[480px] w-full flex-col overflow-hidden rounded-2xl border border-line bg-base-900/90 shadow-2xl backdrop-blur-md">
      {/* Top AWS Header bar */}
      <div className="flex items-center justify-between border-b border-line bg-base-850/80 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-atmos-500/30 bg-atmos-500/10 text-atmos-400">
            <Radio size={14} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-white tracking-wide">
                AUTOMATIC WEATHER STATION (AWS)
              </span>
              <span className="rounded bg-atmos-500/15 border border-atmos-500/30 px-1.5 py-0.2 text-[10px] font-mono-num text-atmos-300">
                10m MAST RIG
              </span>
            </div>
            <div className="text-[11px] text-ink-dim">
              IMD Surface Synoptic Observing System · WMO-No. 8 Standards
            </div>
          </div>
        </div>

        {/* Station switcher tabs */}
        <div className="flex items-center gap-1.5 rounded-lg border border-line bg-base-950/60 p-1">
          {AWS_PRESETS.map((stn, idx) => (
            <button
              key={stn.id}
              onClick={() => setSelectedIdx(idx)}
              className={`rounded px-2.5 py-1 text-[11px] font-mono-num font-medium transition-colors ${
                selectedIdx === idx
                  ? stn.status === "anomaly"
                    ? "bg-signal-bad/20 border border-signal-bad/40 text-signal-bad font-semibold"
                    : "bg-atmos-500/20 border border-atmos-400/40 text-atmos-300 font-semibold"
                  : "text-ink-dim hover:bg-base-800 hover:text-white"
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
          <div className="relative flex items-center justify-center rounded-xl border border-line bg-base-950/70 p-4 overflow-hidden">
            <div className="absolute inset-0 bg-grid bg-[size:24px_24px] opacity-25 pointer-events-none" />

            {/* Simulated atmospheric altitude bands */}
            <div className="absolute left-2.5 top-3 text-[10px] font-mono-num text-ink-faint">
              10.0m AGL (Wind)
            </div>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono-num text-ink-faint">
              1.5m AGL (Screen)
            </div>
            <div className="absolute left-2.5 bottom-3 text-[10px] font-mono-num text-ink-faint">
              0.0m Surface (Rain)
            </div>

            {/* AWS Mast Diagram */}
            <svg viewBox="0 0 260 280" className="h-full max-h-[290px] w-auto select-none">
              <defs>
                <linearGradient id="mastMetal" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#385888" />
                  <stop offset="50%" stopColor="#627794" />
                  <stop offset="100%" stopColor="#1c304f" />
                </linearGradient>
                <linearGradient id="solarGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Ground level reference */}
              <line x1="10" y1="260" x2="250" y2="260" stroke="#253f66" strokeWidth="2" />
              <line x1="20" y1="264" x2="240" y2="264" stroke="#1c304f" strokeWidth="1" strokeDasharray="3 3" />

              {/* Guy Wires */}
              <line x1="30" y1="260" x2="130" y2="70" stroke="#385888" strokeWidth="0.8" opacity="0.6" />
              <line x1="230" y1="260" x2="130" y2="70" stroke="#385888" strokeWidth="0.8" opacity="0.6" />

              {/* Central Lattice Mast */}
              <rect x="127" y="30" width="6" height="230" fill="url(#mastMetal)" rx="1" />
              {/* Lattice cross-bracing */}
              {[45, 75, 105, 135, 165, 195, 225].map((y) => (
                <g key={y}>
                  <line x1="120" y1={y} x2="140" y2={y + 20} stroke="#385888" strokeWidth="0.8" opacity="0.7" />
                  <line x1="140" y1={y} x2="120" y2={y + 20} stroke="#385888" strokeWidth="0.8" opacity="0.7" />
                  <line x1="120" y1={y} x2="140" y2={y} stroke="#627794" strokeWidth="1" opacity="0.8" />
                </g>
              ))}

              {/* TOP CROSSARM (10m) */}
              <rect x="75" y="38" width="110" height="3.5" fill="#627794" rx="1" />

              {/* 1. Anemometer & Wind Vane (Left Top Arm) */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setActiveSensor("wind")}
              >
                <circle cx="85" cy="24" r="6" fill="#0b1320" stroke="#10b981" strokeWidth="1.5" />
                <path d="M85 18 L85 30 M79 24 L91 24" stroke="#10b981" strokeWidth="1.2" />
                <line x1="85" y1="30" x2="85" y2="38" stroke="#627794" strokeWidth="1.5" />
                <text x="56" y="16" fill="#10b981" fontSize="8" fontFamily="monospace" fontWeight="600">
                  WIND 3-CUP
                </text>
              </g>

              {/* 2. INSAT-3DR UHF Yagi Antenna (Right Top Arm) */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setActiveSensor("telemetry")}
              >
                <line x1="175" y1="38" x2="175" y2="18" stroke="#627794" strokeWidth="1.5" />
                <line x1="165" y1="20" x2="185" y2="20" stroke="#38bdf8" strokeWidth="1.2" />
                <line x1="168" y1="24" x2="182" y2="24" stroke="#38bdf8" strokeWidth="1.2" />
                <line x1="171" y1="28" x2="179" y2="28" stroke="#38bdf8" strokeWidth="1.2" />
                {/* Telemetry pulse waves */}
                {pulse && (
                  <circle cx="175" cy="16" r="10" fill="none" stroke="#38bdf8" strokeWidth="1">
                    <animate attributeName="r" values="4;16;24" dur="1.2s" repeatCount="1" />
                    <animate attributeName="opacity" values="0.9;0.3;0" dur="1.2s" repeatCount="1" />
                  </circle>
                )}
                <text x="160" y="12" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="600">
                  INSAT-3DR
                </text>
              </g>

              {/* 3. Solar Radiation Pyranometer (Center Top) */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setActiveSensor("solar")}
              >
                <path d="M125 38 L125 22 L135 22 L135 38 Z" fill="#1c304f" stroke="#eab308" strokeWidth="1" />
                <circle cx="130" cy="20" r="3.5" fill="#eab308" opacity="0.9" />
                <text x="110" y="12" fill="#eab308" fontSize="8" fontFamily="monospace" fontWeight="600">
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
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                />
                <line x1="152" y1="102" x2="147" y2="122" stroke="#38bdf8" strokeWidth="0.7" opacity="0.6" />
                <line x1="168" y1="108" x2="163" y2="128" stroke="#38bdf8" strokeWidth="0.7" opacity="0.6" />
                <line x1="140" y1="115" x2="185" y2="115" stroke="#38bdf8" strokeWidth="0.7" opacity="0.6" />
                <text x="190" y="122" fill="#38bdf8" fontSize="8" fontFamily="monospace">
                  40W PV
                </text>
              </g>

              {/* 5. Louvered Radiation Shield for Temp/Humidity (1.5m at 170px) */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setActiveSensor("temp")}
              >
                <rect x="90" y="155" width="28" height="2" fill="#627794" />
                <g fill="#edf3fb">
                  {[152, 156, 160, 164, 168, 172, 176].map((ly) => (
                    <ellipse
                      key={ly}
                      cx="82"
                      cy={ly}
                      rx="9"
                      ry="2"
                      fill={activeStation.status === "anomaly" ? "#ef4444" : "#f97316"}
                      stroke="#070c14"
                      strokeWidth="0.5"
                    />
                  ))}
                </g>
                <line x1="82" y1="150" x2="82" y2="180" stroke="#f97316" strokeWidth="1" />
                <text
                  x="20"
                  y="166"
                  fill={activeStation.status === "anomaly" ? "#ef4444" : "#f97316"}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  TEMP/RH SHIELD
                </text>
              </g>

              {/* 6. NEMA Enclosure (CR1000X Logger & Barometer) at 215px */}
              <g
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => setActiveSensor("logger")}
              >
                <rect x="135" y="195" width="36" height="42" fill="#0f1a2c" stroke="#385888" strokeWidth="1.5" rx="2" />
                <circle cx="140" cy="202" r="1.5" fill="#10b981" />
                <circle cx="140" cy="208" r="1.5" fill="#38bdf8" />
                <rect x="145" y="200" width="22" height="12" fill="#070c14" stroke="#253f66" strokeWidth="0.8" rx="1" />
                <text x="148" y="209" fill="#38bdf8" fontSize="6" fontFamily="monospace">
                  CR1000X
                </text>
                <text x="175" y="218" fill="#9bb0cb" fontSize="7" fontFamily="monospace">
                  BARO / LOGGER
                </text>
              </g>

              {/* 7. Tipping Bucket Rain Gauge (Ground level Left) */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setActiveSensor("rain")}
              >
                <path d="M60 238 L84 238 L78 260 L66 260 Z" fill="#142238" stroke="#6366f1" strokeWidth="1.2" />
                <ellipse cx="72" cy="238" rx="12" ry="2.5" fill="#253f66" stroke="#6366f1" strokeWidth="1" />
                <text x="35" y="252" fill="#6366f1" fontSize="8" fontFamily="monospace" fontWeight="600">
                  TBRG RAIN
                </text>
              </g>
            </svg>

            {/* Click to inspect tip */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-base-900/90 px-2 py-0.5 text-[10px] text-ink-faint border border-line">
              <span>Interactive Tower · Click any sensor</span>
            </div>
          </div>

          {/* Right: Live Telemetry Tele-gauge Cards & Quality Control Status */}
          <div className="flex flex-col justify-between gap-3">
            {/* Station Synoptic Banner */}
            <div className="rounded-lg border border-line bg-base-950/60 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-ink-faint">
                    WMO SYNOP STATION {activeStation.wmo}
                  </div>
                  <div className="text-[13px] font-semibold text-white">
                    {activeStation.name}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      activeStation.status === "anomaly"
                        ? "bg-signal-bad/20 text-signal-bad border border-signal-bad/40"
                        : activeStation.status === "warning"
                        ? "bg-signal-warn/20 text-signal-warn border border-signal-warn/40"
                        : "bg-signal-good/20 text-signal-good border border-signal-good/40"
                    }`}
                  >
                    {activeStation.status === "anomaly" ? (
                      <AlertTriangle size={11} />
                    ) : (
                      <ShieldCheck size={11} />
                    )}
                    {activeStation.status === "anomaly" ? "WMO QC FLAGGED" : "WMO QC PASSED"}
                  </span>
                  <div className="text-[10px] font-mono-num text-ink-faint mt-0.5">
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
                className={`cursor-pointer rounded-lg border p-2.5 transition-all ${
                  activeSensor === "temp"
                    ? "border-meteo-temp/60 bg-meteo-temp/10 ring-1 ring-meteo-temp/40"
                    : "border-line bg-base-950/40 hover:bg-base-900"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-ink-dim">
                  <span className="flex items-center gap-1">
                    <Thermometer size={12} className="text-meteo-temp" /> Temp (RTD)
                  </span>
                  <span className="font-mono-num text-[10px] text-ink-faint">1.5m</span>
                </div>
                <div
                  className={`mt-1 font-mono-num text-lg font-semibold ${
                    activeStation.status === "anomaly" ? "text-signal-bad animate-pulse" : "text-white"
                  }`}
                >
                  {activeStation.temp} °C
                </div>
                <div className="text-[10px] text-ink-faint">
                  {activeStation.status === "anomaly" ? "Spike (+30.3°C)" : "Within IMD bounds"}
                </div>
              </div>

              {/* Barometer Gauge */}
              <div
                onClick={() => setActiveSensor("logger")}
                className={`cursor-pointer rounded-lg border p-2.5 transition-all ${
                  activeSensor === "logger"
                    ? "border-meteo-pressure/60 bg-meteo-pressure/10 ring-1 ring-meteo-pressure/40"
                    : "border-line bg-base-950/40 hover:bg-base-900"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-ink-dim">
                  <span className="flex items-center gap-1">
                    <Gauge size={12} className="text-meteo-pressure" /> Pressure
                  </span>
                  <span className="font-mono-num text-[10px] text-ink-faint">PTB330</span>
                </div>
                <div className="mt-1 font-mono-num text-lg font-semibold text-white">
                  {activeStation.pressure} hPa
                </div>
                <div className="text-[10px] text-ink-faint">MSL Barometric</div>
              </div>

              {/* Relative Humidity & Dewpoint */}
              <div
                onClick={() => setActiveSensor("temp")}
                className={`cursor-pointer rounded-lg border p-2.5 transition-all ${
                  activeSensor === "temp"
                    ? "border-meteo-humidity/60 bg-meteo-humidity/10 ring-1 ring-meteo-humidity/40"
                    : "border-line bg-base-950/40 hover:bg-base-900"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-ink-dim">
                  <span className="flex items-center gap-1">
                    <Droplets size={12} className="text-meteo-humidity" /> Humidity
                  </span>
                  <span className="font-mono-num text-[10px] text-ink-faint">Td {activeStation.dewPoint}°C</span>
                </div>
                <div className="mt-1 font-mono-num text-lg font-semibold text-white">
                  {activeStation.humidity}%
                </div>
                <div className="text-[10px] text-ink-faint">Capacitive probe</div>
              </div>

              {/* Wind Speed & Direction */}
              <div
                onClick={() => setActiveSensor("wind")}
                className={`cursor-pointer rounded-lg border p-2.5 transition-all ${
                  activeSensor === "wind"
                    ? "border-meteo-wind/60 bg-meteo-wind/10 ring-1 ring-meteo-wind/40"
                    : "border-line bg-base-950/40 hover:bg-base-900"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-ink-dim">
                  <span className="flex items-center gap-1">
                    <Wind size={12} className="text-meteo-wind" /> Wind (10m)
                  </span>
                  <span className="font-mono-num text-[10px] text-ink-faint">{activeStation.windDir.split(" ")[0]}</span>
                </div>
                <div className="mt-1 font-mono-num text-lg font-semibold text-white">
                  {activeStation.windSpeed} m/s
                </div>
                <div className="text-[10px] text-ink-faint">{activeStation.windDir}</div>
              </div>
            </div>

            {/* Bottom Hardware Diagnostics (Power & Satellite Telemetry) */}
            <div className="flex items-center justify-between rounded-lg border border-line bg-base-950/40 px-3 py-2 text-[11px]">
              <div className="flex items-center gap-2 text-ink-dim">
                <BatteryCharging size={13} className="text-meteo-battery" />
                <span>Battery: <strong className="text-white font-mono-num">{activeStation.battery}V DC</strong></span>
                <span className="text-ink-faint">·</span>
                <Sun size={13} className="text-meteo-solar" />
                <span>Solar: <strong className="text-white font-mono-num">{activeStation.solar} W/m²</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-mono-num text-[10px] text-atmos-300">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-good animate-ping" />
                {activeStation.uplink}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="flex items-center justify-between border-t border-line bg-base-950/90 px-4 py-2 text-[11px] text-ink-dim">
        <div className="flex items-center gap-2">
          <Cpu size={12} className="text-atmos-400" />
          <span>Automatic Weather Station Telemetry Rig · Sensor Sampling Rate: <strong>1 Hz</strong> · Average Window: <strong>60s</strong></span>
        </div>
        <div className="font-mono-num text-atmos-400">
          Uplink: INSAT-3DR 402.75 MHz
        </div>
      </div>
    </div>
  );
}
