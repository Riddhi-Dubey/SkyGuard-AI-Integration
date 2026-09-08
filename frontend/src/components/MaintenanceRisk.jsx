export default function MaintenanceRisk({ level, score, reason }) {
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 70 ? "#dc2626" : score > 40 ? "#d97706" : "#16a34a";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="text-[14px] font-bold text-slate-900">Sensor Maintenance Risk</h4>

      <div className="mt-4 flex items-center gap-5">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
          <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="7" />
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
          <div className="absolute font-mono-num text-[16px] font-bold text-slate-900">{score}</div>
        </div>
        <div>
          <div
            className="inline-block rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide"
            style={{ color, backgroundColor: `${color}15` }}
          >
            {level}
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-slate-600 font-medium">{reason}</p>
        </div>
      </div>
    </div>
  );
}
