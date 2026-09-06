import { useEffect, useState } from "react";
import { X, ShieldCheck, CheckCircle2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import ShapChart from "./ShapChart";
import AIInsight from "./AIInsight";
import MaintenanceRisk from "./MaintenanceRisk";
import { SHAP_CONTRIBUTIONS } from "../data/mockData";

export default function AnomalyDetail({ detail, open, onClose }) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (open) setAccepted(false);
  }, [open]);

  if (!detail) return null;

  const isNominal = detail.severity === "normal" || detail.observed === detail.expected || detail.correction === "No correction" || detail.correction === "No correction needed";
  const unit = detail.parameter === "Pressure" ? " hPa" : detail.parameter === "Humidity" ? "%" : "°C";
  const shapData = detail.shapContributions && detail.shapContributions.length > 0 ? detail.shapContributions : SHAP_CONTRIBUTIONS;
  const displayCorrection = isNominal ? "No correction" : `${detail.correction}${unit}`;

  return (
    <div
      className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Anomaly detail"
      >
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-5">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">
              {isNominal ? "Station Diagnostics & Telemetry" : "Anomaly Detected"}
            </div>
            <div className="mt-1 flex items-center gap-2.5">
              <h3 className="font-mono-num text-xl font-bold text-slate-900">{detail.station}</h3>
              <StatusBadge status={detail.severity} pulse={!isNominal} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="text-[13px] text-slate-600 font-medium">
              {isNominal ? "Confidence (Nominal)" : "Anomaly Confidence"}
            </div>
            <div className={`font-mono-num text-2xl font-bold ${isNominal ? "text-emerald-700" : "text-rose-700"}`}>
              {detail.confidence}%
            </div>
          </div>

          {/* Observed vs Expected */}
          <div>
            <h4 className="text-[14px] font-bold text-slate-900">Observed vs Expected</h4>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className={`rounded-xl border p-4 shadow-xs ${isNominal ? "border-slate-200 bg-slate-50" : "border-rose-200 bg-rose-50/60"}`}>
                <div className="text-[11px] text-slate-500 font-medium">Observed {detail.parameter}</div>
                <div className={`mt-1 font-mono-num text-xl font-bold ${isNominal ? "text-slate-900" : "text-rose-700"}`}>
                  {detail.observed}{unit}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-xs">
                <div className="text-[11px] text-slate-500 font-medium">Expected</div>
                <div className="mt-1 font-mono-num text-xl font-bold text-slate-900">
                  {detail.expected}{unit}
                </div>
              </div>
              <div className={`rounded-xl border p-4 shadow-xs ${isNominal ? "border-slate-200 bg-slate-50" : "border-emerald-200 bg-emerald-50/60"}`}>
                <div className="text-[11px] text-slate-500 font-medium">Suggested Correction</div>
                <div className={`mt-1 font-mono-num font-bold ${isNominal ? "text-[14px] text-slate-600" : "text-xl text-emerald-700"}`}>
                  {displayCorrection}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-600">
              <ShieldCheck size={15} className="shrink-0 text-sky-600" />
              {isNominal ? "Nominal telemetry — all sensors within learned operating baselines." : "Raw value preserved — the original observation is never overwritten."}
            </div>
          </div>

          <ShapChart contributions={shapData} />

          <AIInsight
            assessment={detail.aiAssessment}
            rootCause={detail.probableRootCause}
            action={detail.recommendedAction}
          />

          {/* Corrected value section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
            <h4 className="text-[14px] font-bold text-slate-900">{isNominal ? "Telemetry Status" : "Suggested Correction"}</h4>
            <div className="mt-4 grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <div className="text-[11px] text-slate-400 font-bold">Observed</div>
                <div className="mt-1 font-mono-num font-bold text-slate-900">{detail.observed}{unit}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold">{isNominal ? "Suggested Correction" : "Estimated"}</div>
                <div className={`mt-1 font-mono-num font-bold ${isNominal ? "text-slate-600" : "text-emerald-700"}`}>{displayCorrection}</div>
              </div>
              <div className="col-span-2">
                <div className="text-[11px] text-slate-400 font-bold">Method</div>
                <div className="mt-1 text-slate-700 font-medium">{isNominal ? "Nominal telemetry — within baseline" : detail.correctionMethod}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold">Confidence</div>
                <div className="mt-1 font-mono-num font-bold text-slate-900">{detail.correctionConfidence || detail.confidence}%</div>
              </div>
            </div>

            {!isNominal && (
              <button
                onClick={() => setAccepted(true)}
                disabled={accepted}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 shadow-sm ${
                  accepted
                    ? "cursor-default bg-emerald-50 text-emerald-700 border border-emerald-300"
                    : "bg-sky-600 text-white hover:bg-sky-700"
                }`}
              >
                {accepted ? (
                  <>
                    <CheckCircle2 size={16} /> Correction Noted
                  </>
                ) : (
                  "Accept Correction"
                )}
              </button>
            )}
            <p className="mt-2 text-center text-[11px] text-slate-400 font-medium">
              {isNominal ? "All telemetry parameters are operating within normal baseline limits." : "Correction is a recommendation. Original observation remains preserved."}
            </p>
          </div>

          <MaintenanceRisk
            level={detail.maintenanceRisk?.level || "MEDIUM"}
            score={detail.maintenanceRisk?.score || 50}
            reason={detail.maintenanceRisk?.reason || "Station health monitoring"}
          />
        </div>
      </div>
    </div>
  );
}
