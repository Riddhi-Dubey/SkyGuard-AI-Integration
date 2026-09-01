import { Sparkles } from "lucide-react";

export default function AIInsight({ assessment, rootCause, action }) {
  return (
    <div className="rounded-lg border border-line bg-base-900/60 p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-atmos-400/10 text-atmos-300">
          <Sparkles size={14} />
        </div>
        <h4 className="text-[13px] font-semibold text-white">AI Assessment</h4>
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-ink-dim">{assessment}</p>

      <div className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-ink-faint">Probable Root Cause</div>
          <div className="mt-1 text-[13px] font-medium text-white">{rootCause}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-ink-faint">Recommended Action</div>
          <div className="mt-1 text-[13px] font-medium text-white">{action}</div>
        </div>
      </div>
    </div>
  );
}
