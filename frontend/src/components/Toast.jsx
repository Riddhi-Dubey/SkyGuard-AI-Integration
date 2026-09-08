import { AlertTriangle, CheckCircle2, X } from "lucide-react";

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex flex-col gap-2.5 sm:right-6 sm:top-6">
      {toasts.map((t) => {
        const isSuccess = t.isSuccess || (typeof t.parameter === "string" && t.parameter.includes("✅"));
        return (
          <div
            key={t.id}
            className={`animate-toast-in pointer-events-auto flex w-[320px] items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${
              isSuccess ? "border-emerald-200" : "border-rose-200"
            }`}
          >
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                isSuccess
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-rose-50 border-rose-200 text-rose-600"
              }`}
            >
              {isSuccess ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-slate-900">
                {t.title || (isSuccess ? "Telemetry Correction Applied" : "Anomaly Alert")}
              </div>
              <div className="mt-0.5 font-mono-num text-[12px] text-slate-600 font-medium">
                {t.station ? `${t.station} · ` : ""}{t.parameter}
                {t.confidence ? ` · ${t.confidence}%` : ""}
              </div>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 transition-colors hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
