import StatusBadge from "./StatusBadge";

export default function AnomalyTable({ anomalies, onSelect }) {
  if (!anomalies.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-center shadow-sm">
        <p className="text-[13px] font-medium text-slate-500">No anomalies recorded in this window.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500 font-bold">
              <th className="px-4 py-3 font-semibold">Time</th>
              <th className="px-4 py-3 font-semibold">Station</th>
              <th className="px-4 py-3 font-semibold">Parameter</th>
              <th className="px-4 py-3 font-semibold">Observed</th>
              <th className="px-4 py-3 font-semibold">Expected</th>
              <th className="px-4 py-3 font-semibold">Severity</th>
              <th className="px-4 py-3 font-semibold">Confidence</th>
              <th className="px-4 py-3 font-semibold">Root Cause</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a) => (
              <tr
                key={a.id}
                onClick={() => onSelect(a)}
                className="cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-sky-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelect(a)}
              >
                <td className="whitespace-nowrap px-4 py-3 font-mono-num text-slate-500 font-medium">{a.time}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono-num text-slate-900 font-bold">{a.station}</td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">{a.parameter}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono-num text-slate-900 font-bold">{a.observed}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono-num text-slate-500">{a.expected}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={a.severity} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono-num text-slate-600 font-medium">{a.confidence}%</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{a.rootCause}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
