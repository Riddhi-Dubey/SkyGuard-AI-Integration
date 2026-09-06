import { Link } from "react-router-dom";
import {
  Zap,
  Snowflake,
  WifiOff,
  TrendingDown,
  ArrowDown,
  Radio,
  BrainCircuit,
  ShieldCheck,
  Database,
  Sparkles,
  Search,
  MessageSquareText,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import AtmosphericVisual from "../components/AtmosphericVisual";
import { PROBLEM_CARDS, PIPELINE_STEPS, NETWORK_STATS } from "../data/mockData";

const PROBLEM_ICONS = [Zap, Snowflake, WifiOff, TrendingDown];
const PIPELINE_ICONS = [Database, ShieldCheck, Sparkles, BrainCircuit, Search, MessageSquareText, Radio];

function useCounterFormat(n) {
  return n.toLocaleString("en-IN");
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-950">
      <Navbar />

      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:items-center md:pt-24">
          <div className="animate-rise">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-dawn-500/30 bg-base-900/80 px-3 py-1.5 text-[11px] font-medium tracking-wide text-dawn-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-good opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-good" />
              </span>
              Watching over 50 stations, WMO quality standards, every hour of the day
            </div>

            <h1 className="font-display text-4xl font-medium leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]">
              Weather sensors fail quietly.{" "}
              <span className="text-dawn-300">SkyGuard notices first.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-dim">
              Built for India's surface meteorological observation network, SkyGuard keeps watch over
              Temperature, Pressure, Humidity, Wind, and Rain readings coming in from stations across the
              country—catching a stuck sensor or a drifting gauge before it quietly corrupts the forecasts
              millions of people rely on.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button as={Link} to="/dashboard" icon>
                Open AWS Command Center
              </Button>
              <Button as="a" href="#how-it-works" variant="secondary">
                WMO QC Pipeline
              </Button>
            </div>

            <div className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              <div>
                <div className="font-mono-num text-xl font-semibold text-white">50 Nodes</div>
                <div className="mt-1 text-[11px] text-ink-faint">National AWS Grid</div>
              </div>
              <div>
                <div className="font-mono-num text-xl font-semibold text-white">INSAT-3DR</div>
                <div className="mt-1 text-[11px] text-ink-faint">DCP 402.75 MHz</div>
              </div>
              <div>
                <div className="font-mono-num text-xl font-semibold text-white">IMD / MoES</div>
                <div className="mt-1 text-[11px] text-ink-faint">SIH PS 26073</div>
              </div>
            </div>
          </div>

          <div className="animate-rise" style={{ animationDelay: "120ms" }}>
            <AtmosphericVisual />
          </div>
        </div>
      </section>

      {/* ---------------- THE PROBLEM ---------------- */}
      <section id="platform" className="border-b border-line">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-atmos-400">
              Meteorological Hardware Challenges
            </span>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-white">
              Unattended AWS Sensors Fail Silently.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-dim">
              Automatic Weather Stations operate autonomously in extreme environments—from Rajasthan's 50°C heat
              to coastal monsoon salt spray. Hardware faults rarely declare themselves; they quietly corrupt
              synoptic records until detected by mathematical quality control.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROBLEM_CARDS.map((card, i) => {
              const Icon = PROBLEM_ICONS[i];
              return (
                <div
                  key={card.title}
                  className="group rounded-lg border border-line bg-base-900/50 p-6 transition-all duration-300 hover:border-line-strong hover:bg-base-900"
                >
                  <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-md border border-line-strong bg-base-800 text-atmos-300 transition-colors group-hover:border-atmos-400/40">
                    <Icon size={17} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-[15px] font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">{card.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- HOW SKYGUARD THINKS ---------------- */}
      <section id="how-it-works" className="border-b border-line bg-base-900/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-atmos-400">
              WMO Multi-Tier Quality Control Pipeline
            </span>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-white">
              From INSAT Sensor Packets to Explained Actions.
            </h2>
          </div>

          <div className="mt-14 flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-2">
            {PIPELINE_STEPS.map((step, i) => {
              const Icon = PIPELINE_ICONS[i];
              return (
                <div key={step.id} className="flex flex-1 items-center lg:flex-col">
                  <div className="group relative flex-1 rounded-lg border border-line bg-base-900/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-atmos-400/40 hover:shadow-glow">
                    <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-md bg-atmos-400/10 text-atmos-300">
                      <Icon size={15} strokeWidth={1.8} />
                    </div>
                    <div className="text-[13px] font-semibold text-white">{step.title}</div>
                    <p className="mt-2 max-h-0 overflow-hidden text-[12px] leading-relaxed text-ink-dim opacity-0 transition-all duration-300 group-hover:max-h-36 group-hover:opacity-100">
                      {step.detail}
                    </p>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className="flex shrink-0 items-center justify-center px-1 py-2 text-ink-faint lg:rotate-0 lg:py-1">
                      <ArrowDown size={14} className="hidden lg:block lg:-rotate-90" />
                      <ArrowDown size={14} className="lg:hidden" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- INTELLIGENCE ---------------- */}
      <section id="intelligence" className="border-b border-line">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-atmos-400">
              Meteorological AI & Quality Control
            </span>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-white">
              Detect. Explain. Maintain.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            <IntelligenceCard
              title="12D Hybrid Detection"
              desc="Cross-references WMO-No. 8 physical limits with an Isolation Forest model trained on multi-parameter atmospheric microclimates."
            >
              <MiniDetectViz />
            </IntelligenceCard>
            <IntelligenceCard
              title="SHAP Sensor Attribution"
              desc="Quantifies the mathematical impact of each meteorological sensor (Temp, Pressure, RH, Wind) on the anomaly flag."
            >
              <MiniExplainViz />
            </IntelligenceCard>
            <IntelligenceCard
              title="Hardware Root-Cause Diagnosis"
              desc="Pinpoints specific failure modes: RTD lead wire detachment, radiation shield heating, or TBRG funnel clogging."
            >
              <MiniRespondViz />
            </IntelligenceCard>
          </div>
        </div>
      </section>

      {/* ---------------- LIVE NETWORK PREVIEW ---------------- */}
      <section id="monitoring" className="border-b border-line bg-base-900/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-atmos-400">
                National Synoptic Overview
              </span>
              <h2 className="mt-3 max-w-lg font-display text-3xl font-medium tracking-tight text-white">
                Continuous surveillance of all 50 AWS observation nodes.
              </h2>
            </div>
            <Button as={Link} to="/dashboard" icon>
              Open AWS Command Center
            </Button>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PreviewStat label="AWS Stations Online" value={`${NETWORK_STATS.stationsOnline}`} suffix={`/ ${NETWORK_STATS.stationsTotal}`} status="good" />
            <PreviewStat label="Observations Analyzed" value={useCounterFormat(NETWORK_STATS.observations)} status="info" />
            <PreviewStat label="WMO Data Quality" value={`${NETWORK_STATS.dataQuality}%`} status="good" />
            <PreviewStat label="Flagged Anomalies" value={`${NETWORK_STATS.activeAnomalies}`} status="warn" />
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="bg-base-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-14 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="font-display text-[16px] font-medium tracking-wide text-white">
              SkyGuard <span className="text-dawn-400">AWS</span>
            </div>
            <p className="mt-2 max-w-sm text-[13px] text-ink-dim">
              National Automatic Weather Station Telemetry & Anomaly Surveillance System.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-[12px] text-ink-faint md:items-end">
            <span className="font-semibold text-ink">Smart India Hackathon 2026 · PS 26073</span>
            <span>Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)</span>
            <span>WMO-No. 8 & WMO-No. 488 Quality Control Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function IntelligenceCard({ title, desc, children }) {
  return (
    <div className="rounded-lg border border-line bg-base-900/50 p-6 transition-all duration-300 hover:border-line-strong">
      <div className="mb-6 flex h-28 items-center justify-center rounded-md border border-line bg-base-950/50">
        {children}
      </div>
      <h3 className="text-[15px] font-semibold text-white">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">{desc}</p>
    </div>
  );
}

function MiniDetectViz() {
  return (
    <svg viewBox="0 0 200 80" className="h-16 w-full px-4">
      <polyline
        points="0,50 20,48 40,52 60,46 80,50 95,20 110,55 130,48 150,50 170,47 200,49"
        fill="none"
        stroke="#4bbcdc"
        strokeWidth="1.5"
      />
      <circle cx="95" cy="20" r="3.5" fill="#f0555a" opacity="0.9">
        <animate attributeName="r" values="3;5;3" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function MiniExplainViz() {
  const bars = [82, 61, 31, 8];
  return (
    <div className="flex w-full flex-col gap-1.5 px-6">
      {bars.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-base-800">
            <div
              className="h-1.5 rounded-full bg-atmos-400"
              style={{ width: `${v}%`, opacity: 1 - i * 0.15 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniRespondViz() {
  return (
    <div className="flex items-center gap-3 px-6">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-signal-warn/40">
        <span className="font-mono-num text-xs font-semibold text-signal-warn">78</span>
      </div>
      <div className="text-[11px] leading-tight text-ink-dim">
        Maintenance
        <br />
        Risk Score
      </div>
    </div>
  );
}

function PreviewStat({ label, value, suffix, status }) {
  const colors = {
    good: "text-signal-good",
    warn: "text-signal-warn",
    info: "text-atmos-300",
  };
  return (
    <div className="rounded-lg border border-line bg-base-900/60 p-6">
      <div className="flex items-baseline gap-1.5">
        <span className={`font-mono-num text-2xl font-semibold ${colors[status]}`}>{value}</span>
        {suffix && <span className="font-mono-num text-sm text-ink-faint">{suffix}</span>}
      </div>
      <div className="mt-2 text-[12px] text-ink-dim">{label}</div>
    </div>
  );
}
