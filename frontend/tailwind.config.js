/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#05070b",
          900: "#080b12",
          850: "#0b0f18",
          800: "#0f141f",
          700: "#161c2a",
          600: "#212938",
          500: "#2e3849",
        },
        line: {
          DEFAULT: "rgba(148, 168, 194, 0.12)",
          soft: "rgba(148, 168, 194, 0.07)",
          strong: "rgba(148, 168, 194, 0.22)",
        },
        ink: {
          DEFAULT: "#e8edf5",
          dim: "#9aa8bd",
          faint: "#5e6b80",
        },
        atmos: {
          50: "#eefbff",
          200: "#a9e6f7",
          300: "#7ad4ec",
          400: "#4bbcdc",
          500: "#2ea1c4",
          600: "#1c7fa0",
          glow: "#5fd3f0",
        },
        signal: {
          good: "#3ddc8b",
          warn: "#f2b84b",
          bad: "#f0555a",
          info: "#6fa8ff",
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
