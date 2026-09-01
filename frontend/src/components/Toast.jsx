import { AlertTriangle, X } from "lucide-react";

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex flex-col gap-2.5 sm:right-6 sm:top-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in pointer-events-auto flex w-[300px] items-start gap-3 rounded-lg border border-signal-bad/30 bg-base-900/95 p-4 shadow-panel backdrop-blur-sm"
        >
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-signal-bad/10 text-signal-bad">
            <AlertTriangle size={14} />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-white">New anomaly detected</div>
            <div className="mt-0.5 font-mono-num text-[12px] text-ink-dim">
              {t.station} · {t.parameter} · {t.confidence}% confidence
            </div>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-ink-faint transition-colors hover:text-ink"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
