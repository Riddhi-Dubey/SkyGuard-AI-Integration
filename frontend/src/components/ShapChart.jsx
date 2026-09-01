export default function ShapChart({ contributions }) {
  const max = Math.max(...contributions.map((c) => c.value));

  return (
    <div className="rounded-lg border border-line bg-base-900/60 p-5">
      <h4 className="text-[13px] font-semibold text-white">Why was this flagged?</h4>
      <p className="mt-1 text-[12px] text-ink-dim">
        Feature contribution to the anomaly score, largest impact first.
      </p>

      <div className="mt-6 space-y-4">
        {contributions.map((c) => (
          <div key={c.feature}>
            <div className="mb-1.5 flex items-center justify-between text-[12px]">
              <span className="text-ink">{c.feature}</span>
              <span className="font-mono-num font-semibold text-atmos-300">
                +{c.value.toFixed(2)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-base-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-atmos-600 to-atmos-glow transition-all duration-700"
                style={{ width: `${(c.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 border-t border-line pt-4 text-[12px] leading-relaxed text-ink-dim">
        Temperature and its rate of change were the primary contributors to the anomaly score.
      </p>
    </div>
  );
}
