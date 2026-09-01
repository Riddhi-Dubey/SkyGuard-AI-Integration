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
  temp: "#4bbcdc",
  pressure: "#7ad4ec",
  humidity: "#5fd3f0",
};

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="rounded-md border border-line-strong bg-base-900/95 px-3 py-2 text-[11px] shadow-panel">
      <div className="text-ink-faint">{label}</div>
      <div className="mt-1 font-mono-num font-semibold text-white">
        {point.value}
        {unit}
      </div>
      {point.payload.anomaly && (
        <div className="mt-1 font-semibold text-signal-bad">Anomaly point</div>
      )}
    </div>
  );
}

export default function SensorChart({ title, data, dataKey, unit, color, min, max, current }) {
  const anomalyPoint = data.find((d) => d.anomaly);
  const stroke = color || COLORS[dataKey] || "#4bbcdc";

  return (
    <div className="rounded-lg border border-line bg-base-900/60 p-5">
      <div className="mb-1 flex items-center justify-between">
        <h4 className="text-[13px] font-semibold text-white">{title}</h4>
        <span className="font-mono-num text-[15px] font-semibold text-white">
          {current}
          <span className="ml-0.5 text-[11px] font-normal text-ink-faint">{unit}</span>
        </span>
      </div>
      <div className="mb-3 flex items-center gap-4 text-[10px] text-ink-faint">
        <span>MIN {min}{unit}</span>
        <span>MAX {max}{unit}</span>
        <span className="ml-auto">Last 60 min</span>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#161c2a" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: "#5e6b80", fontSize: 10 }}
              axisLine={{ stroke: "#161c2a" }}
              tickLine={false}
              interval={14}
            />
            <YAxis
              tick={{ fill: "#5e6b80", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
              width={36}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ stroke: "#2e3849" }} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              strokeWidth={1.8}
              dot={false}
              activeDot={{ r: 3.5, fill: stroke }}
              isAnimationActive={false}
            />
            {anomalyPoint && (
              <ReferenceDot
                x={anomalyPoint.time}
                y={anomalyPoint[dataKey]}
                r={5}
                fill="#f0555a"
                stroke="#f0555a"
                fillOpacity={0.25}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
