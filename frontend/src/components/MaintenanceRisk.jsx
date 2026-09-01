export default function MaintenanceRisk({ level, score, reason }) {
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 70 ? "#f0555a" : score > 40 ? "#f2b84b" : "#3ddc8b";

  return (
    <div className="rounded-lg border border-line bg-base-900/60 p-5">
      <h4 className="text-[13px] font-semibold text-white">Sensor Maintenance Risk</h4>

      <div className="mt-4 flex items-center gap-5">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#161c2a" strokeWidth="7" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke={color}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute font-mono-num text-[15px] font-semibold text-white">{score}</div>
        </div>
        <div>
          <div
            className="inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide"
            style={{ color, backgroundColor: `${color}1a` }}
          >
            {level}
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-ink-dim">{reason}</p>
        </div>
      </div>
    </div>
  );
}
