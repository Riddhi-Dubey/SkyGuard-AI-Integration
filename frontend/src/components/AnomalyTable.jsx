import StatusBadge from "./StatusBadge";

export default function AnomalyTable({ anomalies, onSelect }) {
  if (!anomalies.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-line bg-base-900/60 py-16 text-center">
        <p className="text-[13px] text-ink-dim">No anomalies recorded in this window.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-base-900/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Station</th>
              <th className="px-4 py-3 font-medium">Parameter</th>
              <th className="px-4 py-3 font-medium">Observed</th>
              <th className="px-4 py-3 font-medium">Expected</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Root Cause</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a) => (
              <tr
                key={a.id}
                onClick={() => onSelect(a)}
                className="cursor-pointer border-b border-line/70 transition-colors last:border-0 hover:bg-base-800/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-atmos-400"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelect(a)}
              >
                <td className="whitespace-nowrap px-4 py-3 font-mono-num text-ink-dim">{a.time}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono-num text-white">{a.station}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-dim">{a.parameter}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono-num text-white">{a.observed}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono-num text-ink-dim">{a.expected}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={a.severity} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono-num text-ink-dim">{a.confidence}%</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-dim">{a.rootCause}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
