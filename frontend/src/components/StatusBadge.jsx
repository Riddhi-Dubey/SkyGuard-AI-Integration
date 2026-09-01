const MAP = {
  healthy: { label: "HEALTHY", dot: "bg-signal-good", text: "text-signal-good", bg: "bg-signal-good/10", ring: "ring-signal-good/25" },
  normal: { label: "NORMAL", dot: "bg-signal-good", text: "text-signal-good", bg: "bg-signal-good/10", ring: "ring-signal-good/25" },
  warning: { label: "WARNING", dot: "bg-signal-warn", text: "text-signal-warn", bg: "bg-signal-warn/10", ring: "ring-signal-warn/25" },
  warn: { label: "WARNING", dot: "bg-signal-warn", text: "text-signal-warn", bg: "bg-signal-warn/10", ring: "ring-signal-warn/25" },
  anomaly: { label: "ANOMALY", dot: "bg-signal-bad", text: "text-signal-bad", bg: "bg-signal-bad/10", ring: "ring-signal-bad/25" },
  critical: { label: "CRITICAL", dot: "bg-signal-bad", text: "text-signal-bad", bg: "bg-signal-bad/10", ring: "ring-signal-bad/25" },
};

export default function StatusBadge({ status, pulse = false, className = "" }) {
  const s = MAP[status] || MAP.normal;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ${s.bg} ${s.ring} ${s.text} ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.dot} opacity-60`} />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.dot}`} />
      </span>
      {s.label}
    </span>
  );
}
