import { Link } from "react-router-dom";
import {
  LayoutGrid,
  Radio,
  AlertTriangle,
  MapPin,
  BarChart3,
  UserCircle2,
  X,
} from "lucide-react";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "monitoring", label: "Live Monitoring", icon: Radio },
  { id: "anomalies", label: "Anomalies", icon: AlertTriangle },
  { id: "stations", label: "Stations", icon: MapPin },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar({ active, onSelect, mobileOpen, onCloseMobile }) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-line bg-base-900 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded border border-line-strong bg-base-800 text-atmos-300">
              <Radio size={13} />
            </span>
            <span className="text-[13px] font-semibold tracking-[0.14em] text-white">
              SKYGUARD <span className="text-atmos-300">AI</span>
            </span>
          </Link>
          <button className="text-ink-dim lg:hidden" onClick={onCloseMobile} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  onCloseMobile?.();
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-atmos-400 ${
                  isActive
                    ? "bg-atmos-400/10 text-atmos-300"
                    : "text-ink-dim hover:bg-base-800 hover:text-ink"
                }`}
              >
                <Icon size={16} strokeWidth={1.8} />
                {item.label}
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-atmos-400" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-line px-5 py-4">
          <div className="flex items-center gap-2 text-[12px] text-ink-dim">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-good opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-good" />
            </span>
            All systems operational
          </div>
          <div className="mt-4 flex items-center gap-2.5 rounded-md border border-line bg-base-850 px-3 py-2.5">
            <UserCircle2 size={22} className="text-ink-faint" />
            <div className="leading-tight">
              <div className="text-[12px] font-medium text-ink">Ops Analyst</div>
              <div className="text-[11px] text-ink-faint">IMD · Regional Cell</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
