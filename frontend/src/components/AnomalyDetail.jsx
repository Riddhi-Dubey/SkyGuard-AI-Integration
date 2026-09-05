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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-line bg-base-950 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Anomaly detail"
      >
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-ink-faint">
              {isNominal ? "Station Diagnostics & Telemetry" : "Anomaly Detected"}
            </div>
            <div className="mt-1 flex items-center gap-2.5">
              <h3 className="font-mono-num text-lg font-semibold text-white">{detail.station}</h3>
              <StatusBadge status={detail.severity} pulse={!isNominal} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-dim transition-colors hover:bg-base-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-atmos-400"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex items-center gap-4 rounded-lg border border-line bg-base-900/60 p-4">
            <div className="text-[12px] text-ink-dim">
              {isNominal ? "Confidence (Nominal)" : "Anomaly Confidence"}
            </div>
            <div className={`font-mono-num text-2xl font-semibold ${isNominal ? "text-signal-good" : "text-signal-bad"}`}>
              {detail.confidence}%
            </div>
          </div>

          {/* Observed vs Expected */}
          <div>
            <h4 className="text-[13px] font-semibold text-white">Observed vs Expected</h4>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className={`rounded-lg border p-4 ${isNominal ? "border-line bg-base-900/60" : "border-signal-bad/30 bg-signal-bad/5"}`}>
                <div className="text-[11px] text-ink-faint">Observed {detail.parameter}</div>
                <div className={`mt-1 font-mono-num text-xl font-semibold ${isNominal ? "text-white" : "text-signal-bad"}`}>
                  {detail.observed}{unit}
                </div>
              </div>
              <div className="rounded-lg border border-line bg-base-900/60 p-4">
                <div className="text-[11px] text-ink-faint">Expected</div>
                <div className="mt-1 font-mono-num text-xl font-semibold text-white">
                  {detail.expected}{unit}
                </div>
              </div>
              <div className={`rounded-lg border p-4 ${isNominal ? "border-line bg-base-900/60" : "border-signal-good/30 bg-signal-good/5"}`}>
                <div className="text-[11px] text-ink-faint">Suggested Correction</div>
                <div className={`mt-1 font-mono-num font-semibold ${isNominal ? "text-[14px] text-ink-dim" : "text-xl text-signal-good"}`}>
                  {displayCorrection}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-md border border-line bg-base-900/40 px-3 py-2 text-[12px] text-ink-dim">
              <ShieldCheck size={14} className="shrink-0 text-atmos-300" />
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
          <div className="rounded-lg border border-line bg-base-900/60 p-5">
            <h4 className="text-[13px] font-semibold text-white">{isNominal ? "Telemetry Status" : "Suggested Correction"}</h4>
            <div className="mt-4 grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <div className="text-[11px] text-ink-faint">Observed</div>
                <div className="mt-1 font-mono-num font-semibold text-white">{detail.observed}{unit}</div>
              </div>
              <div>
                <div className="text-[11px] text-ink-faint">{isNominal ? "Suggested Correction" : "Estimated"}</div>
                <div className={`mt-1 font-mono-num font-semibold ${isNominal ? "text-ink-dim" : "text-signal-good"}`}>{displayCorrection}</div>
              </div>
              <div className="col-span-2">
                <div className="text-[11px] text-ink-faint">Method</div>
                <div className="mt-1 text-ink-dim">{isNominal ? "Nominal telemetry — within baseline" : detail.correctionMethod}</div>
              </div>
              <div>
                <div className="text-[11px] text-ink-faint">Confidence</div>
                <div className="mt-1 font-mono-num font-semibold text-white">{detail.correctionConfidence || detail.confidence}%</div>
              </div>
            </div>

            {!isNominal && (
              <button
                onClick={() => setAccepted(true)}
                disabled={accepted}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-[13px] font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-atmos-400 ${
                  accepted
                    ? "cursor-default bg-signal-good/10 text-signal-good"
                    : "bg-atmos-400 text-base-950 hover:bg-atmos-300"
                }`}
              >
                {accepted ? (
                  <>
                    <CheckCircle2 size={15} /> Correction Noted
                  </>
                ) : (
                  "Accept Correction"
                )}
              </button>
            )}
            <p className="mt-2 text-center text-[11px] text-ink-faint">
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
