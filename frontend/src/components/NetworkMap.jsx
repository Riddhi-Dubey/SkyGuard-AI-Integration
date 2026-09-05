import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Plus, Minus, RotateCcw, Layers, MapPin } from "lucide-react";

const STATUS_COLOR = {
  healthy: "#3ddc8b",
  warning: "#f2b84b",
  anomaly: "#f0555a",
};

// Fallback accurate GPS coordinates for all Indian AWS stations
const CITY_COORDS = {
  "AWS-DEL-01": { lat: 28.6139, lng: 77.2090, name: "Delhi" },
  "AWS-MUM-04": { lat: 19.0760, lng: 72.8777, name: "Mumbai" },
  "AWS-CHE-02": { lat: 13.0827, lng: 80.2707, name: "Chennai" },
  "AWS-KOL-03": { lat: 22.5726, lng: 88.3639, name: "Kolkata" },
  "AWS-BLR-05": { lat: 12.9716, lng: 77.5946, name: "Bengaluru" },
  "AWS-HYD-06": { lat: 17.3850, lng: 78.4867, name: "Hyderabad" },
  "AWS-JAI-02": { lat: 26.9124, lng: 75.7873, name: "Jaipur" },
  "AWS-LKO-07": { lat: 26.8467, lng: 80.9462, name: "Lucknow" },
  "AWS-GHY-08": { lat: 26.1445, lng: 91.7362, name: "Guwahati" },
  "AWS-BPL-09": { lat: 23.2599, lng: 77.4126, name: "Bhopal" },
  "AWS-AMD-10": { lat: 23.0225, lng: 72.5714, name: "Ahmedabad" },
  "AWS-SXR-11": { lat: 34.0837, lng: 74.7973, name: "Srinagar" },
};

// Geographic telemetry network connections between neighbouring regional hubs
const NETWORK_GRID_LINKS = [
  ["AWS-SXR-11", "AWS-DEL-01"],
  ["AWS-DEL-01", "AWS-JAI-02"],
  ["AWS-DEL-01", "AWS-LKO-07"],
  ["AWS-JAI-02", "AWS-AMD-10"],
  ["AWS-AMD-10", "AWS-BPL-09"],
  ["AWS-AMD-10", "AWS-MUM-04"],
  ["AWS-LKO-07", "AWS-BPL-09"],
  ["AWS-LKO-07", "AWS-KOL-03"],
  ["AWS-KOL-03", "AWS-GHY-08"],
  ["AWS-BPL-09", "AWS-HYD-06"],
  ["AWS-MUM-04", "AWS-BLR-05"],
  ["AWS-HYD-06", "AWS-BLR-05"],
  ["AWS-HYD-06", "AWS-CHE-02"],
  ["AWS-BLR-05", "AWS-CHE-02"],
  ["AWS-CHE-02", "AWS-KOL-03"],
];

const TILE_LAYERS = {
  dark: {
    name: "Dark Radar",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    subdomains: "abcd",
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri &mdash; Earthstar Geographics",
    subdomains: "",
  },
  standard: {
    name: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: "abc",
  },
};

export default function NetworkMap({ stations = [], selectedId, onSelect }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});
  const polylineGroupRef = useRef(null);
  const [mapType, setMapType] = useState("dark");
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered on geographic center of India
    const map = L.map(mapContainerRef.current, {
      center: [22.8, 80.2],
      zoom: 4.8,
      minZoom: 4,
      maxZoom: 11,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [
        [5.0, 65.0],
        [38.5, 99.0],
      ],
      maxBoundsViscosity: 0.8,
    });

    const tileConfig = TILE_LAYERS[mapType];
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains,
      maxZoom: 18,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    polylineGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when user switches style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    map.removeLayer(tileLayerRef.current);
    const tileConfig = TILE_LAYERS[mapType];
    const newTileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains,
      maxZoom: 18,
    }).addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [mapType]);

  // Render Telemetry Grid Polylines & Markers with exact India Coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Draw Network Mesh Polylines between stations
    if (polylineGroupRef.current) {
      polylineGroupRef.current.clearLayers();

      const stationMap = new Map();
      stations.forEach((s) => {
        const coords = [
          s.lat ?? CITY_COORDS[s.id]?.lat,
          s.lng ?? CITY_COORDS[s.id]?.lng,
        ];
        if (coords[0] && coords[1]) {
          stationMap.set(s.id, coords);
        }
      });

      NETWORK_GRID_LINKS.forEach(([idA, idB]) => {
        const pA = stationMap.get(idA);
        const pB = stationMap.get(idB);
        if (pA && pB) {
          L.polyline([pA, pB], {
            color: "#4bbcdc",
            weight: 1.2,
            opacity: 0.28,
            dashArray: "3, 6",
            interactive: false,
          }).addTo(polylineGroupRef.current);
        }
      });
    }

    // 2. Render Station Markers
    // Clean up old markers
    Object.values(markersRef.current).forEach((marker) => map.removeLayer(marker));
    markersRef.current = {};

    stations.forEach((s) => {
      const lat = s.lat ?? CITY_COORDS[s.id]?.lat;
      const lng = s.lng ?? CITY_COORDS[s.id]?.lng;
      if (!lat || !lng) return;

      const isSelected = s.id === selectedId;
      const color = STATUS_COLOR[s.status] || "#3ddc8b";

      // Custom pulsing HTML marker element
      const markerHtml = `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer" style="width: 36px; height: 36px;">
          ${
            s.status !== "healthy"
              ? `<span class="absolute inline-flex h-8 w-8 rounded-full animate-ping opacity-60" style="background-color: ${color};"></span>`
              : ""
          }
          ${
            isSelected
              ? `<span class="absolute inline-flex h-9 w-9 rounded-full ring-2 ring-atmos-400 bg-atmos-400/20 shadow-[0_0_15px_#4bbcdc]"></span>`
              : ""
          }
          <div class="relative flex items-center justify-center rounded-full border border-white/80 shadow-md transition-transform duration-200 group-hover:scale-125"
               style="width: ${isSelected ? "16px" : "12px"}; height: ${isSelected ? "16px" : "12px"}; background-color: ${color};">
            <span class="h-1.5 w-1.5 rounded-full bg-white"></span>
          </div>
          ${
            isSelected
              ? `<div class="absolute -top-7 whitespace-nowrap rounded border border-line-strong bg-base-900/95 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xl pointer-events-none">
                   ${s.name} (${s.id})
                 </div>`
              : ""
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-station-pin",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Interactive popup
      marker.bindTooltip(
        `<div class="p-1 text-left font-sans">
          <div class="text-[12px] font-semibold text-white">${s.name} <span class="text-ink-faint">(${s.id})</span></div>
          <div class="text-[11px] text-ink-dim">${s.state || "India"}</div>
          <div class="mt-1.5 flex items-center gap-2 text-[11px] font-mono-num">
            <span class="text-white">${s.temp}°C</span>
            <span class="text-ink-faint">·</span>
            <span class="text-white">${s.humidity}% RH</span>
            <span class="text-ink-faint">·</span>
            <span class="uppercase font-semibold" style="color: ${color}">${s.status}</span>
          </div>
        </div>`,
        {
          direction: "top",
          offset: [0, -12],
          className: "leaflet-dark-tooltip",
        }
      );

      marker.on("click", () => {
        onSelect(s.id);
      });

      markersRef.current[s.id] = marker;
    });
  }, [stations, selectedId]);

  // Center or pan smoothly when selectedId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedId) return;

    const selectedStation = stations.find((s) => s.id === selectedId);
    const lat = selectedStation?.lat ?? CITY_COORDS[selectedId]?.lat;
    const lng = selectedStation?.lng ?? CITY_COORDS[selectedId]?.lng;

    if (lat && lng) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 6), {
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }
  }, [selectedId, stations]);

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([22.8, 80.2], 4.8, { duration: 0.7 });
    }
  };

  const handleZoomIn = () => {
    const map = mapInstanceRef.current;
    if (map) map.zoomIn();
  };

  const handleZoomOut = () => {
    const map = mapInstanceRef.current;
    if (map) map.zoomOut();
  };

  return (
    <div className="relative h-[460px] overflow-hidden rounded-lg border border-line bg-base-950 isolate lg:h-[520px]">
      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Top Bar: Legend and Station counter */}
      <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-3 rounded-md border border-line bg-base-900/90 px-3 py-1.5 text-[11px] text-ink-dim backdrop-blur-md shadow-lg">
          <LegendDot color={STATUS_COLOR.healthy} label="Healthy" />
          <LegendDot color={STATUS_COLOR.warning} label="Warning" />
          <LegendDot color={STATUS_COLOR.anomaly} label="Anomaly" />
        </div>
        <div className="hidden sm:flex items-center gap-1.5 rounded-md border border-line bg-base-900/90 px-2.5 py-1.5 text-[11px] text-atmos-300 backdrop-blur-md shadow-lg font-mono-num">
          <MapPin size={12} />
          <span>India AWS Observation Grid</span>
        </div>
      </div>

      {/* Top Right: Layer Switcher */}
      <div className="absolute right-3 top-3 z-10">
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-md border border-line bg-base-900/90 px-2.5 py-1.5 text-[11px] font-medium text-ink-dim transition-colors hover:bg-base-800 hover:text-white backdrop-blur-md shadow-lg"
            aria-label="Switch map style"
          >
            <Layers size={13} />
            <span className="capitalize">{TILE_LAYERS[mapType].name}</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-1 w-36 rounded-md border border-line bg-base-900 p-1 shadow-2xl backdrop-blur-md animate-toast-in">
              {Object.entries(TILE_LAYERS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    setMapType(key);
                    setShowLayerMenu(false);
                  }}
                  className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                    mapType === key
                      ? "bg-atmos-400/15 text-atmos-300"
                      : "text-ink-dim hover:bg-base-800 hover:text-white"
                  }`}
                >
                  {config.name}
                  {mapType === key && <span className="h-1.5 w-1.5 rounded-full bg-atmos-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Right: Zoom & Reset Controls */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1 rounded-md border border-line bg-base-900/90 p-1 backdrop-blur-md shadow-lg">
        <button
          onClick={handleZoomIn}
          className="rounded p-1.5 text-ink-dim transition-colors hover:bg-base-800 hover:text-white"
          aria-label="Zoom in"
          title="Zoom In"
        >
          <Plus size={14} />
        </button>
        <button
          onClick={handleZoomOut}
          className="rounded p-1.5 text-ink-dim transition-colors hover:bg-base-800 hover:text-white"
          aria-label="Zoom out"
          title="Zoom Out"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={handleResetView}
          className="rounded p-1.5 text-ink-dim transition-colors hover:bg-base-800 hover:text-white"
          aria-label="Reset zoom and center on India"
          title="Reset to full India view"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Custom Tooltip Styling in CSS */}
      <style>{`
        .leaflet-dark-tooltip {
          background-color: rgba(15, 20, 31, 0.95) !important;
          border: 1px solid rgba(46, 56, 73, 0.9) !important;
          border-radius: 6px !important;
          color: #f1f5f9 !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6) !important;
          padding: 6px 10px !important;
        }
        .leaflet-dark-tooltip:before {
          border-top-color: rgba(15, 20, 31, 0.95) !important;
        }
        .leaflet-container {
          background-color: #07090e !important;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
