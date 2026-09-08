import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Button from "./Button";

function RadarMark() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-white shadow-sm ring-1 ring-sky-600/20">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="rgba(255,255,255,0.2)" />
        <path d="M12 12v6" stroke="#fef08a" strokeWidth="2.2" />
        <path d="M8 18h8" stroke="#fef08a" strokeWidth="2.2" />
      </svg>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Surveillance Grid", href: "#platform" },
    { label: "WMO Standards", href: "#how-it-works" },
    { label: "Station Telemetry", href: "#intelligence" },
    { label: "Live Network", href: "#monitoring" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-white/80 backdrop-blur-sm border-b border-slate-200/60"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <RadarMark />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-bold tracking-tight text-slate-900">
                SKYGUARD
              </span>
              <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">
                AWS
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              IMD Surface Meteorological Network
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13px] font-medium text-slate-600 transition-colors hover:text-sky-600"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[11px] font-medium text-emerald-800 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            <span>INSAT-3DR Synced · <strong>Live</strong></span>
          </div>
          <Button as={Link} to="/dashboard" variant="primary" className="!py-2 !px-4 text-[13px]">
            Open AWS Dashboard
          </Button>
        </div>

        <button
          className="rounded-md p-1.5 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-6 py-5 shadow-lg md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-slate-700 hover:text-sky-600"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Button as={Link} to="/dashboard" variant="primary" className="mt-2 w-full">
              Open AWS Dashboard
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
