import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const STATUS_DOT = {
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  bad: "bg-rose-500",
  info: "bg-sky-500",
};

export default function KPICard({ label, value, suffix, trend, trendDirection = "up", status = "good", sparkline = [], mono = true }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const sparkData = sparkline.map((v, i) => ({ i, v }));
  const trendUp = trendDirection === "up";

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-slate-500">{label}</span>
        <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className={`flex items-baseline gap-1 ${mono ? "font-mono-num" : ""}`}>
            <span className="text-[26px] font-bold leading-none text-slate-900 tabular">{displayValue}</span>
            {suffix && <span className="text-[13px] font-medium text-slate-400">{suffix}</span>}
          </div>
          {trend && (
            <div
              className={`mt-2 flex items-center gap-1 text-[11px] font-semibold ${
                trendUp ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {trendUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {trend}
            </div>
          )}
        </div>

        {sparkline.length > 0 && (
          <div className="h-9 w-20 opacity-85 transition-opacity group-hover:opacity-100">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
