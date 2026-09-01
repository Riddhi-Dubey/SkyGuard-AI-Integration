# SkyGuard AI — Frontend Prototype

Intelligent Anomaly Detection for Automatic Weather Stations.
Built for **Smart India Hackathon 2026 — Problem Statement 26073** (Ministry of Earth Sciences / IMD).

This is a **frontend-only** prototype. All data (stations, sensor readings, anomalies, SHAP
contributions) is mock/static data in `src/data/mockData.js`, with simulated real-time updates.
There is no backend, database, authentication, or ML model — this is purely the UI/UX layer.

## Tech stack

- React 19 + Vite
- React Router (Landing ↔ Dashboard)
- Tailwind CSS
- Recharts (sensor charts, KPI sparklines)
- Lucide React (icons)

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

To verify a production build compiles cleanly:

```bash
npm run build
npm run preview
```

## Structure

```
src/
  components/     Reusable UI: Navbar, Button, StatusBadge, KPICard, NetworkMap,
                  StationInspector, SensorChart, AnomalyTable, AnomalyDetail,
                  ShapChart, AIInsight, MaintenanceRisk, Sidebar, Toast,
                  AtmosphericVisual
  pages/          Landing.jsx (marketing/hero page), Dashboard.jsx (Command Center)
  data/           mockData.js — single source of mock data, shaped so a real API
                  can replace each export independently
  App.jsx         Routes: "/" -> Landing, "/dashboard" -> Dashboard
  main.jsx        Entry point
  index.css       Tailwind base + design tokens (grid texture, fonts, utilities)
```

## Pages

- **`/` — Landing**: hero with an animated AWS network visualization, problem
  section, "How SkyGuard Thinks" pipeline, Detect/Explain/Respond intelligence
  section, live network preview stats, footer.
- **`/dashboard` — Command Center**: sidebar navigation, live KPI cards, a
  stylized India network map with clickable stations, a station inspector,
  three live sensor charts (temperature/pressure/humidity) with an anomaly
  highlight, a recent-anomalies table, and a slide-over anomaly detail panel
  with SHAP explainability, AI root-cause assessment, a corrected-value
  recommendation (which never overwrites the raw observation), and a
  maintenance-risk gauge. Simulated anomalies periodically appear with a
  toast notification.

## Notes for a future backend integration

`src/data/mockData.js` exports are named and shaped to mirror what a real API
would likely return (`STATIONS`, `SENSOR_SERIES`, `ANOMALIES`, `SHAP_CONTRIBUTIONS`,
`NETWORK_STATS`, etc.), so swapping mock data for live fetches should mostly be
a matter of replacing these exports with API calls / React Query hooks.
