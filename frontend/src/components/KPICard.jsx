import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const STATUS_DOT = {
  good: "bg-signal-good",
  warn: "bg-signal-warn",
  bad: "bg-signal-bad",
  info: "bg-atmos-400",
};

export default function KPICard({ label, value, suffix, trend, trendDirection = "up", status = "good", sparkline = [], mono = true }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const sparkData = sparkline.map((v, i) => ({ i, v }));
  const trendUp = trendDirection === "up";

  return (
    <div className="group rounded-lg border border-line bg-base-900/60 p-5 transition-colors hover:border-line-strong">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-ink-dim">{label}</span>
        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <div className={`flex items-baseline gap-1 ${mono ? "font-mono-num" : ""}`}>
            <span className="text-[26px] font-semibold leading-none text-white tabular">{displayValue}</span>
            {suffix && <span className="text-[13px] text-ink-faint">{suffix}</span>}
          </div>
          {trend && (
            <div
              className={`mt-2 flex items-center gap-1 text-[11px] font-medium ${
                trendUp ? "text-signal-good" : "text-signal-bad"
              }`}
            >
              {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trend}
            </div>
          )}
        </div>

        {sparkline.length > 0 && (
          <div className="h-9 w-20 opacity-80 transition-opacity group-hover:opacity-100">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#4bbcdc"
                  strokeWidth={1.6}
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
