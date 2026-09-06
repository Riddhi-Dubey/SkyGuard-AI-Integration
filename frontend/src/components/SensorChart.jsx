import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";

const COLORS = {
  temp: "#ea580c",
  pressure: "#0284c7",
  humidity: "#0891b2",
};

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] shadow-lg">
      <div className="text-slate-400 font-medium">{label}</div>
      <div className="mt-1 font-mono-num font-bold text-slate-900">
        {point.value}
        {unit}
      </div>
      {point.payload.anomaly && (
        <div className="mt-1 font-bold text-rose-600">⚠️ Anomaly Flagged</div>
      )}
    </div>
  );
}

export default function SensorChart({ title, data, dataKey, unit, color, min, max, current }) {
  const anomalyPoint = data.find((d) => d.anomaly);
  const stroke = color || COLORS[dataKey] || "#0284c7";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h4 className="text-[14px] font-bold text-slate-900">{title}</h4>
        <span className="font-mono-num text-[16px] font-bold text-slate-900">
          {current}
          <span className="ml-0.5 text-[11px] font-normal text-slate-400">{unit}</span>
        </span>
      </div>
      <div className="mb-3 flex items-center gap-4 text-[11px] text-slate-400 font-medium">
        <span>MIN {min}{unit}</span>
        <span>MAX {max}{unit}</span>
        <span className="ml-auto">Last 60 min</span>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              interval={14}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
              width={36}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            {anomalyPoint && (
              <ReferenceDot
                x={anomalyPoint.time}
                y={anomalyPoint[dataKey]}
                r={5}
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
