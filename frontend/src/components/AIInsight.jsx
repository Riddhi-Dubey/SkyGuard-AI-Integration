import { Sparkles } from "lucide-react";

export default function AIInsight({ assessment, rootCause, action }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 border border-sky-200 text-sky-600">
          <Sparkles size={14} />
        </div>
        <h4 className="text-[14px] font-bold text-slate-900">AI Assessment</h4>
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-slate-600 font-medium">{assessment}</p>

      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">Probable Root Cause</div>
          <div className="mt-1 text-[13px] font-semibold text-slate-900">{rootCause}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">Recommended Action</div>
          <div className="mt-1 text-[13px] font-semibold text-slate-900">{action}</div>
        </div>
      </div>
    </div>
  );
}
