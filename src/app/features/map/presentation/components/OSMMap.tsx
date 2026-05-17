import { useRef, useEffect, useState, type FC } from "react";
import { Coupon, UserCoord, USER_COORD } from "../../../../core/common/mockData.ts";
import { LimaMap } from "./LimaMap.tsx";

let leafletLoaderPromise: Promise<any> | null = null;

function loadLeaflet(): Promise<any> {
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (leafletLoaderPromise) return leafletLoaderPromise;
  leafletLoaderPromise = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    css.crossOrigin = "";
    document.head.appendChild(css);
    const s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    s.crossOrigin = "";
    s.onload = () => resolve((window as any).L);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return leafletLoaderPromise;
}

interface Pin {
  id: string;
  lat: number;
  lng: number;
  discount?: string;
  featured?: boolean;
  [key: string]: any;
}

interface OSMMapProps {
  pins?: Pin[];
  activePin?: string | null;
  onPinClick?: (p: Pin) => void;
  userCoord?: UserCoord;
  showRadar?: boolean;
  theme?: string;
  interactive?: boolean;
  zoom?: number;
}

export const OSMMap: FC<OSMMapProps> = ({
  pins = [], activePin = null, onPinClick = () => {},
  userCoord = USER_COORD, showRadar = true, theme = "light",
  interactive = true, zoom = 15,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const userMarkerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then(L => {
      if (cancelled || !ref.current || mapRef.current) return;
      const map = L.map(ref.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: interactive,
        dragging: interactive,
        doubleClickZoom: interactive,
        touchZoom: interactive,
      }).setView([userCoord.lat, userCoord.lng], zoom);
      mapRef.current = map;
      setMapReady(true);
      setTimeout(() => map.invalidateSize(), 50);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !(window as any).L || !mapRef.current) return;
    const L = (window as any).L;
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    const url = theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    tileLayerRef.current = L.tileLayer(url, {
      maxZoom: 19,
      attribution: "© OpenStreetMap · © CARTO",
      subdomains: "abcd",
    }).addTo(mapRef.current);
  }, [theme, mapReady]);

  useEffect(() => {
    if (!mapReady || !(window as any).L || !mapRef.current) return;
    const L = (window as any).L;
    if (userMarkerRef.current) mapRef.current.removeLayer(userMarkerRef.current);
    const radarHtml = showRadar
      ? `<span class="user-radar"></span><span class="user-radar" style="animation-delay:1.2s"></span>`
      : "";
    const icon = L.divIcon({
      className: "geops-user-icon",
      html: `<div class="user-dot-wrap">${radarHtml}<span class="user-dot"></span></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    userMarkerRef.current = L.marker([userCoord.lat, userCoord.lng], { icon, interactive: false }).addTo(mapRef.current);
    mapRef.current.flyTo([userCoord.lat, userCoord.lng], mapRef.current.getZoom(), { animate: true, duration: 1.2 });
  }, [userCoord.lat, userCoord.lng, showRadar, mapReady]);

  const prevZoomRef = useRef<number | null>(null);
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    if (prevZoomRef.current !== null && prevZoomRef.current !== zoom) {
      mapRef.current.flyTo(mapRef.current.getCenter(), zoom, { animate: true, duration: 0.8 });
    }
    prevZoomRef.current = zoom;
  }, [zoom, mapReady]);

  useEffect(() => {
    if (!mapReady || !(window as any).L || !mapRef.current) return;
    const L = (window as any).L;
    const map = mapRef.current;
    const existing = markersRef.current;
    const seen = new Set<string>();

    pins.forEach(p => {
      seen.add(p.id);
      const isActive = activePin === p.id;
      const html = `
        <div class="geops-pin ${isActive ? "active" : ""} ${p.featured ? "featured" : ""}">
          ${isActive ? '<span class="geops-pin-halo"></span>' : ""}
          <svg viewBox="-18 -25 36 52" width="26" height="38">
            <path d="M 0 -22 C -10 -22 -16 -14 -16 -6 C -16 4 -8 12 0 22 C 8 12 16 4 16 -6 C 16 -14 10 -22 0 -22 Z"
                  fill="${isActive ? "var(--ink)" : "var(--bg-elev)"}" stroke="var(--ink)" stroke-width="2"/>
            <circle cx="0" cy="-6" r="8" fill="var(--brand)"/>
            <text x="0" y="-3" text-anchor="middle" font-size="8" font-weight="700"
                  fill="var(--brand-ink)" font-family="var(--font-mono)">−${p.discount}</text>
          </svg>
        </div>`;
      const icon = L.divIcon({
        className: "geops-pin-wrap",
        html,
        iconSize: [26, 38],
        iconAnchor: [13, 36],
      });

      if (existing[p.id]) {
        existing[p.id].setIcon(icon);
        existing[p.id].setLatLng([p.lat, p.lng]);
      } else {
        const m = L.marker([p.lat, p.lng], { icon, riseOnHover: true }).addTo(map);
        m.on("click", () => onPinClick(p));
        existing[p.id] = m;
      }
    });

    Object.keys(existing).forEach(id => {
      if (!seen.has(id)) {
        map.removeLayer(existing[id]);
        delete existing[id];
      }
    });
  }, [pins, activePin, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !activePin) return;
    const p = pins.find(x => x.id === activePin);
    if (p) mapRef.current.panTo([p.lat, p.lng], { animate: true, duration: 0.6 });
  }, [activePin]);

  return <div ref={ref} style={{ width: "100%", height: "100%", background: "var(--map-bg)" }}/>;
};

interface GeoMapProps extends OSMMapProps {
  engine?: string;
  userPos?: { x: number; y: number };
}

export const GeoMap: FC<GeoMapProps> = ({ engine = "stylized", ...props }) => {
  if (engine === "osm") return <OSMMap {...props} theme={props.theme}/>;
  return <LimaMap pins={props.pins as any} activePin={props.activePin} onPinClick={props.onPinClick as any}
                  userPos={props.userPos} theme={props.theme} showRadar={props.showRadar}/>;
};
