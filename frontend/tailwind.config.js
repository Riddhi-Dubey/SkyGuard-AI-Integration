/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#070c14",
          900: "#0b1320",
          850: "#0f1a2c",
          800: "#142238",
          700: "#1c304f",
          600: "#253f66",
          500: "#385888",
        },
        line: {
          DEFAULT: "rgba(148, 175, 205, 0.14)",
          soft: "rgba(148, 175, 205, 0.08)",
          strong: "rgba(148, 175, 205, 0.25)",
        },
        ink: {
          DEFAULT: "#edf3fb",
          dim: "#9bb0cb",
          faint: "#627794",
        },
        atmos: {
          50: "#f0f9ff",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          glow: "#38bdf8",
        },
        meteo: {
          temp: "#f97316",
          pressure: "#0ea5e9",
          humidity: "#06b6d4",
          wind: "#10b981",
          rain: "#6366f1",
          solar: "#eab308",
          battery: "#22c55e",
        },
        signal: {
          good: "#10b981",
          warn: "#f59e0b",
          bad: "#ef4444",
          info: "#38bdf8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 rgba(255,255,255,0.03) inset, 0 20px 60px -30px rgba(0,0,0,0.7)",
        glow: "0 0 40px -8px rgba(95, 211, 240, 0.35)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(148,168,194,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,168,194,0.06) 1px, transparent 1px)",
        noise: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.55, transform: "scale(1.15)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        drift: {
          "0%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(6px,-6px)" },
          "100%": { transform: "translate(0,0)" },
        },
        rise: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite",
        scan: "scan 6s linear infinite",
        drift: "drift 9s ease-in-out infinite",
        rise: "rise 0.6s ease-out both",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};
