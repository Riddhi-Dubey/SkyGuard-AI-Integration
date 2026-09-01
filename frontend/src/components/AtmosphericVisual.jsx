import { useEffect, useState } from "react";

// Nodes on a 0-100 x/0-100 y virtual grid.
const NODES = [
  { id: "AWS-DEL-01", x: 62, y: 22, temp: 24.6, pressure: 1012.4, humidity: 68 },
  { id: "AWS-DEL-02", x: 78, y: 34, temp: 25.1, pressure: 1011.8, humidity: 65 },
  { id: "AWS-JAI-02", x: 40, y: 40, temp: 24.9, pressure: 1008.2, humidity: 41 },
  { id: "AWS-LKO-07", x: 58, y: 55, temp: 26.3, pressure: 1011.1, humidity: 64 },
  { id: "AWS-BPL-09", x: 30, y: 66, temp: 25.8, pressure: 1011.9, humidity: 52 },
  { id: "AWS-HYD-06", x: 70, y: 74, temp: 27.4, pressure: 1010.8, humidity: 55 },
];

const CENTER = { x: 50, y: 48 };

export default function AtmosphericVisual() {
  const [anomalyIndex, setAnomalyIndex] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnomalyIndex(0);
      const clear = setTimeout(() => setAnomalyIndex(null), 4200);
      return () => clearTimeout(clear);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[420px] w-full select-none overflow-hidden rounded-2xl border border-line bg-base-900/60 md:h-[520px]">
      <div className="absolute inset-0 bg-grid bg-[size:34px_34px] opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base-950 via-transparent to-transparent" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(95,211,240,0.06), transparent)" }}
      />

      {/* scanning line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden opacity-70">
        <div className="h-24 w-full bg-gradient-to-b from-atmos-400/10 via-atmos-400/[0.04] to-transparent animate-scan" />
      </div>

      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5fd3f0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#5fd3f0" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* connections */}
        {NODES.map((n, i) => (
          <line
            key={`line-${n.id}`}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={n.x}
            y2={n.y}
            stroke={anomalyIndex === i ? "#f0555a" : "#2e3849"}
            strokeWidth="0.25"
            strokeDasharray="1.2 1.4"
            opacity={anomalyIndex === i ? 0.9 : 0.55}
          />
        ))}

        {/* traveling particles along connections */}
        {NODES.map((n, i) => (
          <circle key={`p-${n.id}`} r="0.5" fill="#7ad4ec" opacity="0.85">
            <animateMotion
              dur={`${3.5 + i * 0.6}s`}
              repeatCount="indefinite"
              path={`M${CENTER.x},${CENTER.y} L${n.x},${n.y}`}
            />
          </circle>
        ))}

        {/* center intelligence node */}
        <circle cx={CENTER.x} cy={CENTER.y} r="14" fill="url(#centerGlow)" />
        <circle cx={CENTER.x} cy={CENTER.y} r="2.6" fill="#0b0f18" stroke="#5fd3f0" strokeWidth="0.4" />
        <circle cx={CENTER.x} cy={CENTER.y} r="1.1" fill="#5fd3f0" />

        {/* station nodes */}
        {NODES.map((n, i) => {
          const isAnomaly = anomalyIndex === i;
          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={isAnomaly ? 3.4 : 1.6}
                fill="none"
                stroke={isAnomaly ? "#f0555a" : "#4bbcdc"}
                strokeWidth="0.35"
                opacity={isAnomaly ? 0.9 : 0.5}
              >
                {isAnomaly && (
                  <animate attributeName="r" values="2;5;2" dur="1.4s" repeatCount="indefinite" />
                )}
              </circle>
              <circle cx={n.x} cy={n.y} r="0.9" fill={isAnomaly ? "#f0555a" : "#5fd3f0"} />
            </g>
          );
        })}
      </svg>

      {/* HTML labels layered above SVG for crisp text */}
      {NODES.map((n, i) => {
        const isAnomaly = anomalyIndex === i;
        return (
          <div
            key={`label-${n.id}`}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full font-mono text-[10px] leading-tight"
            style={{ left: `${n.x}%`, top: `${n.y}%`, marginTop: "-8px" }}
          >
            <div
              className={`rounded border px-2 py-1 shadow-panel backdrop-blur-sm transition-colors duration-300 ${
                isAnomaly
                  ? "border-signal-bad/50 bg-signal-bad/10 text-signal-bad"
                  : "border-line-strong bg-base-900/80 text-ink-dim"
              }`}
            >
              {isAnomaly ? (
                <>
                  <div className="font-semibold tracking-wide">ANOMALY DETECTED</div>
                  <div className="text-[9px] opacity-90">Confidence 96.8%</div>
                </>
              ) : (
                <>
                  <div className="font-semibold text-ink">{n.id}</div>
                  <div className="opacity-80">
                    {n.temp}°C · {n.pressure} hPa · {n.humidity}% RH
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-4 left-4 rounded-md border border-line bg-base-900/70 px-3 py-1.5 font-mono text-[10px] tracking-wide text-ink-dim">
        AWS NETWORK · LIVE FEED
      </div>
    </div>
  );
}
