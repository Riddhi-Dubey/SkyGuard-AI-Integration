import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Button from "./Button";

function RadarMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="shrink-0">
      <circle cx="13" cy="13" r="11.5" stroke="#2e3849" strokeWidth="1" />
      <circle cx="13" cy="13" r="7.5" stroke="#2e3849" strokeWidth="1" />
      <path d="M13 13 L13 2.5" stroke="#5fd3f0" strokeWidth="1.4" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 13 13"
          to="360 13 13"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
      <circle cx="13" cy="13" r="1.6" fill="#5fd3f0" />
      <circle cx="17.5" cy="8.5" r="1.1" fill="#4bbcdc" />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Platform", href: "#platform" },
    { label: "Intelligence", href: "#intelligence" },
    { label: "AWS Architecture", href: "#platform" },
    { label: "Sensor Diagnostics", href: "#how-it-works" },
    { label: "WMO Quality Control", href: "#intelligence" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-base-950/90 backdrop-blur-md border-b border-line" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <RadarMark />
          <div>
            <div className="text-[14px] font-semibold tracking-[0.12em] text-white">
              SKYGUARD <span className="text-atmos-400">AWS</span>
            </div>
            <div className="text-[10px] tracking-wider text-ink-faint uppercase font-mono-num">
              National Weather Station Surveillance
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13px] font-medium text-ink-dim transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-line bg-base-900/80 px-3 py-1 text-[11px] font-mono-num text-ink-dim">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-good opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-good" />
            </span>
            <span>INSAT-3DR: <strong>ACTIVE</strong></span>
          </div>
          <Button as={Link} to="/dashboard" variant="secondary" className="!py-1.5 !px-3 text-[12px]">
            Open Command Center
          </Button>
        </div>

        <button
          className="text-ink md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-base-950/95 px-6 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-ink-dim" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <Button as={Link} to="/dashboard" variant="secondary" className="mt-2 w-full">
              Open Dashboard
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
