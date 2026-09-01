import { useState } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";

const STATUS_COLOR = {
  healthy: "#3ddc8b",
  warning: "#f2b84b",
  anomaly: "#f0555a",
};

// A simplified, stylized vector silhouette suggesting India's outline —
// not a geographically accurate map, purely a backdrop for station markers.
const OUTLINE =
  "M 48 4 C 55 3 61 6 63 12 C 67 14 71 13 74 17 C 78 19 79 24 77 28 C 82 31 85 36 83 42 " +
  "C 87 46 88 53 84 58 C 86 63 84 69 79 71 C 80 76 76 80 71 80 C 70 85 65 89 60 87 " +
  "C 58 92 52 94 48 91 C 45 95 39 95 36 91 C 31 92 27 88 28 83 C 23 82 20 77 22 72 " +
  "C 17 69 16 62 20 58 C 16 53 17 46 22 43 C 19 38 21 32 26 30 C 24 25 27 20 32 19 " +
  "C 31 14 35 9 40 9 C 41 5 45 3 48 4 Z";

export default function NetworkMap({ stations, selectedId, onSelect }) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative h-[460px] overflow-hidden rounded-lg border border-line bg-base-900/50 lg:h-[520px]">
      <div className="absolute inset-0 bg-grid bg-[size:28px_28px] opacity-30" />

      <div
        className="relative h-full w-full transition-transform duration-300"
        style={{ transform: `scale(${zoom})` }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="indiaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#161c2a" />
              <stop offset="100%" stopColor="#0f141f" />
            </linearGradient>
          </defs>
          <path d={OUTLINE} fill="url(#indiaFill)" stroke="#2e3849" strokeWidth="0.4" />
          <path d={OUTLINE} fill="none" stroke="#4bbcdc" strokeOpacity="0.12" strokeWidth="1.4" />

          {/* connection lines between geographically-adjacent-ish stations for network feel */}
          {stations.slice(1).map((s, i) => (
            <line
              key={`net-${s.id}`}
              x1={stations[0].x}
              y1={stations[0].y}
              x2={s.x}
              y2={s.y}
              stroke="#2e3849"
              strokeWidth="0.2"
              opacity="0.5"
            />
          ))}

          {stations.map((s) => {
            const isSelected = s.id === selectedId;
            const color = STATUS_COLOR[s.status];
            return (
              <g
                key={s.id}
                onClick={() => onSelect(s.id)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`Select station ${s.name}`}
                onKeyDown={(e) => e.key === "Enter" && onSelect(s.id)}
              >
                {s.status !== "healthy" && (
                  <circle cx={s.x} cy={s.y} r={isSelected ? 4 : 3} fill={color} opacity="0.18">
                    <animate attributeName="r" values="2.5;5;2.5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={isSelected ? 2.1 : 1.5}
                  fill={color}
                  stroke={isSelected ? "#ffffff" : "transparent"}
                  strokeWidth="0.4"
                />
              </g>
            );
          })}
        </svg>

        {stations.map((s) => (
          <button
            key={`hit-${s.id}`}
            onClick={() => onSelect(s.id)}
            aria-label={`Station ${s.name}, status ${s.status}`}
            className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-atmos-400"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          />
        ))}

        {stations.map((s) => {
          const isSelected = s.id === selectedId;
          if (!isSelected) return null;
          return (
            <div
              key={`tag-${s.id}`}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-[130%] whitespace-nowrap rounded border border-line-strong bg-base-900/90 px-2 py-1 font-mono text-[10px] text-white shadow-panel"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              {s.id}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-3 right-3 flex flex-col gap-1 rounded-md border border-line bg-base-900/80 p-1">
        <button
          onClick={() => setZoom((z) => Math.min(1.8, z + 0.2))}
          className="rounded p-1.5 text-ink-dim transition-colors hover:bg-base-800 hover:text-ink"
          aria-label="Zoom in"
        >
          <Plus size={14} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
          className="rounded p-1.5 text-ink-dim transition-colors hover:bg-base-800 hover:text-ink"
          aria-label="Zoom out"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="rounded p-1.5 text-ink-dim transition-colors hover:bg-base-800 hover:text-ink"
          aria-label="Reset zoom"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      <div className="absolute left-3 top-3 flex items-center gap-3 rounded-md border border-line bg-base-900/80 px-2.5 py-1.5 text-[10px] text-ink-dim">
        <LegendDot color={STATUS_COLOR.healthy} label="Healthy" />
        <LegendDot color={STATUS_COLOR.warning} label="Warning" />
        <LegendDot color={STATUS_COLOR.anomaly} label="Anomaly" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
