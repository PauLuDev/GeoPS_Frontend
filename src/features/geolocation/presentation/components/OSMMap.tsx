import { useRef, useEffect, useState, type FC } from "react";
import type { UserCoord } from "@/shared/types.ts";
import { USER_COORD } from "@/shared/constants.ts";
import { LimaMap } from "./LimaMap.tsx";

type LMap = {
    remove(): void;
    getZoom(): number;
    getCenter(): unknown;
    flyTo(latlng: [number, number], zoom?: number, options?: object): void;
    panTo(latlng: [number, number], options?: object): void;
    invalidateSize(force?: boolean): void;
    removeLayer(layer: LLayer): void;
    setView(center: [number, number], zoom: number): LMap;
    on(event: string, handler: (e: any) => void): LMap;
    off(event: string, handler: (e: any) => void): LMap;
    zoomIn(): LMap;
    zoomOut(): LMap;
    latLngToContainerPoint(latlng: [number, number]): { x: number; y: number };
};

export interface MapApi {
    zoomIn: () => void;
    zoomOut: () => void;
    flyTo: (lat: number, lng: number, zoom?: number) => void;
    invalidate: () => void;
}
type LMarker = {
    setIcon(icon: LIcon): void;
    setLatLng(latlng: [number, number]): void;
    on(event: string, handler: () => void): LMarker;
};
type LTileLayer = LLayer & { redraw?: () => void };
type LIcon = object;
type LLayer = object;

let leafletLoaderPromise: Promise<unknown> | null = null;

function loadLeaflet(): Promise<unknown> {
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
    isEstablishment?: boolean; // Identificador para renderizado dinámico de locales
    [key: string]: any;
}

const EMPTY_PINS: Pin[] = [];

interface OSMMapProps {
    pins?: Pin[];
    activePin?: string | null;
    onPinClick?: (p: Pin) => void;
    userCoord?: UserCoord | null;
    centerCoord?: UserCoord;
    searchCenter?: UserCoord | null;
    showRadar?: boolean;
    theme?: string;
    interactive?: boolean;
    zoom?: number;
    pickingOnMap?: boolean;
    pickedCoord?: { lat: number; lng: number } | null;
    /* modo marcador-centrado -> reporta el centro del mapa al moverse y muestra su direccion en la burbuja */
    onPickCenterChange?: (lat: number, lng: number) => void;
    pickCenterLabel?: string | null;
    onMapReady?: (api: MapApi) => void;
}

export const OSMMap: FC<OSMMapProps> = ({
    pins = EMPTY_PINS,
    activePin = null,
    onPinClick = () => {},
    userCoord,
    centerCoord,
    searchCenter = null,
    showRadar = true,
    theme = "light",
    interactive = true,
    zoom = 15,
    pickingOnMap = false,
    pickedCoord = null,
    onPickCenterChange,
    pickCenterLabel = null,
    onMapReady,
}) => {
    const effectiveCenter = centerCoord ?? userCoord ?? USER_COORD;
    const outerRef = useRef<HTMLDivElement>(null);
    const ref = useRef<HTMLDivElement>(null);
    const mapRef = useRef<LMap | null>(null);
    const markersRef = useRef<Record<string, LMarker>>({});
    const userMarkerRef = useRef<LMarker | null>(null);
    const searchMarkerRef = useRef<LMarker | null>(null);
    const tileLayerRef = useRef<LTileLayer | null>(null);
    /* el pick pin transitorio va como overlay React por pixeles; el search center va como
       marcador nativo de leaflet (searchMarkerRef) para que el zoom sea suave y no parpadee */
    const [pickPixel, setPickPixel] = useState<{ x: number; y: number } | null>(null);
    const onPinClickRef = useRef(onPinClick);
    onPinClickRef.current = onPinClick;
    const onPickCenterChangeRef = useRef(onPickCenterChange);
    onPickCenterChangeRef.current = onPickCenterChange;
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        loadLeaflet().then((raw) => {
            const L = raw as any;
            if (cancelled || !ref.current || mapRef.current) return;
            const map = L.map(ref.current, {
                zoomControl: false,
                attributionControl: true,
                scrollWheelZoom: interactive,
                dragging: interactive,
                doubleClickZoom: interactive,
                touchZoom: interactive,
            }).setView([effectiveCenter.lat, effectiveCenter.lng], zoom);
            mapRef.current = map;
            setMapReady(true);
            setTimeout(() => map.invalidateSize(true), 50);
            onMapReady?.({
                zoomIn: () => map.zoomIn(),
                zoomOut: () => map.zoomOut(),
                flyTo: (lat: number, lng: number, z?: number) => map.flyTo([lat, lng], z ?? map.getZoom(), { animate: true, duration: 0.8 }),
                invalidate: () => map.invalidateSize(),
            });
        });
        return () => {
            cancelled = true;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }

            markersRef.current = {};
            userMarkerRef.current = null;
            searchMarkerRef.current = null;
            tileLayerRef.current = null;
            setPickPixel(null);
        };
    }, []);

    useEffect(() => {
        if (!mapReady || !(window as any).L || !mapRef.current) return;
        const L = (window as any).L;
        if (tileLayerRef.current) {
            mapRef.current.removeLayer(tileLayerRef.current);
        }
        const url =
            theme === "dark"
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
        if (userMarkerRef.current) {
            mapRef.current.removeLayer(userMarkerRef.current);
            userMarkerRef.current = null;
        }
        if (!userCoord) return;
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
    }, [userCoord?.lat, userCoord?.lng, showRadar, mapReady]);

    /* search center como marcador nativo de leaflet -> se pega a la coordenada y el zoom no parpadea */
    useEffect(() => {
        if (!mapReady || !(window as any).L || !mapRef.current) return;
        const L = (window as any).L;
        if (searchMarkerRef.current) {
            mapRef.current.removeLayer(searchMarkerRef.current);
            searchMarkerRef.current = null;
        }
        if (!searchCenter) return;
        const icon = L.divIcon({
            className: "geops-scm-icon",
            html: `<div class="scm-wrap"><span class="scm-ring scm-ring-1"></span><span class="scm-ring scm-ring-2"></span><span class="scm-dot"></span></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });
        searchMarkerRef.current = L.marker([searchCenter.lat, searchCenter.lng], { icon, interactive: false }).addTo(mapRef.current);
    }, [searchCenter?.lat, searchCenter?.lng, mapReady]);

    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        mapRef.current.flyTo([effectiveCenter.lat, effectiveCenter.lng], mapRef.current.getZoom(), { animate: true, duration: 1.0 });
    }, [effectiveCenter.lat, effectiveCenter.lng, mapReady]);

    /* Posición píxel del pick pin — overlay React, sin tocar el DOM de Leaflet */
    useEffect(() => {
        if (!mapReady || !mapRef.current || !pickedCoord) {
            setPickPixel(null);
            return;
        }
        const map = mapRef.current;
        const lat = pickedCoord.lat;
        const lng = pickedCoord.lng;
        const update = () => {
            const p = map.latLngToContainerPoint([lat, lng]);
            setPickPixel({ x: p.x, y: p.y });
        };
        update();
        map.on("move zoom viewreset", update);
        return () => { map.off("move zoom viewreset", update); };
    }, [pickedCoord?.lat, pickedCoord?.lng, mapReady]);

    /* modo marcador-centrado -> el pin queda fijo al centro de la pantalla y reportamos
       el centro del mapa cada vez que el usuario deja de moverlo (moveend limita las llamadas) */
    useEffect(() => {
        if (!mapReady || !mapRef.current || !pickingOnMap) return;
        const map = mapRef.current;
        const report = () => {
            const c = map.getCenter() as { lat: number; lng: number };
            if (c && typeof c.lat === "number" && typeof c.lng === "number") {
                onPickCenterChangeRef.current?.(c.lat, c.lng);
            }
        };
        report();
        map.on("moveend", report);
        return () => { map.off("moveend", report); };
    }, [pickingOnMap, mapReady]);

    useEffect(() => {
        if (!mapReady || !mapRef.current || !ref.current) return;
        const ro = new ResizeObserver(() => mapRef.current?.invalidateSize());
        ro.observe(ref.current);
        return () => ro.disconnect();
    }, [mapReady]);

    /* Recalcula tamaño cuando el banner de picking aparece/desaparece (puede cambiar el alto disponible) */
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        const m = mapRef.current;
        const t = setTimeout(() => m.invalidateSize(), 80);
        return () => clearTimeout(t);
    }, [pickingOnMap, mapReady]);

    /* Cuando el usuario vuelve de otra pestaña, el compositor puede haber descartado los tiles */
    useEffect(() => {
        if (!mapReady) return;
        const onVisible = () => {
            if (document.visibilityState === "visible") mapRef.current?.invalidateSize(true);
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [mapReady]);

    const prevZoomRef = useRef<number | null>(null);
    useEffect(() => {
        if (!mapReady || !mapRef.current) return;
        if (prevZoomRef.current !== null && prevZoomRef.current !== zoom) {
            mapRef.current.flyTo(mapRef.current.getCenter() as [number, number], zoom, { animate: true, duration: 0.8 });
        }
        prevZoomRef.current = zoom;
    }, [zoom, mapReady]);

    useEffect(() => {
        if (!mapReady || !(window as any).L || !mapRef.current) return;
        const L = (window as any).L;
        const map = mapRef.current;
        const existing = markersRef.current;
        const seen = new Set<string>();

        pins.forEach((p) => {
            seen.add(p.id);
            const isActive = activePin === p.id;

            /* Renderizado adaptativo de la etiqueta interna del Pin */
            const markerLabel = p.isEstablishment ? p.discount : `−${p.discount}`;

            const html = `
        <div class="geops-pin ${isActive ? "active" : ""} ${p.featured ? "featured" : ""}">
          ${isActive ? '<span class="geops-pin-halo"></span>' : ""}
          <svg viewBox="-18 -25 36 52" width="26" height="38">
            <path d="M 0 -22 C -10 -22 -16 -14 -16 -6 C -16 4 -8 12 0 22 C 8 12 16 4 16 -6 C 16 -14 10 -22 0 -22 Z"
                  fill="${isActive ? "var(--ink)" : "var(--bg-elev)"}" stroke="var(--ink)" stroke-width="2"/>
            <circle cx="0" cy="-6" r="8" fill="var(--brand)"/>
            <text x="0" y="-3" text-anchor="middle" font-size="8" font-weight="700"
                  fill="var(--on-brand)" font-family="var(--font-mono)">${markerLabel}</text>
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
                m.on("click", () => onPinClickRef.current(p));
                existing[p.id] = m;
            }
        });

        Object.keys(existing).forEach((id) => {
            if (!seen.has(id)) {
                map.removeLayer(existing[id]);
                delete existing[id];
            }
        });

    }, [pins, activePin, mapReady]);

    useEffect(() => {
        if (!mapReady || !mapRef.current || !activePin) return;
        const p = pins.find((x) => x.id === activePin);
        if (p) mapRef.current.panTo([p.lat, p.lng], { animate: true, duration: 0.6 });
    }, [activePin]);

    return (
        /* El outer div tiene la clase CSS osm-canvas y sirve como contenedor relativo para los overlays.
           El inner div (ref) es el contenedor real de Leaflet.
           Los overlays (pick pin, search center) son hijos del outer div, FUERA del DOM de Leaflet,
           así evitamos modificar leaflet-marker-pane y no se invalida la capa GPU del tile-pane. */
        <div ref={outerRef} className={"osm-canvas" + (pickingOnMap ? " picking" : "")} style={{ position: "relative" }}>
            <div ref={ref} style={{ position: "absolute", inset: "0" }} />

            {pickPixel && (
                <div style={{ position: "absolute", left: pickPixel.x, top: pickPixel.y, transform: "translate(-12px,-30px)", pointerEvents: "none", zIndex: 700 }}>
                    <div className="pick-pin">
                        <span className="pick-pin-stem" />
                        <span className="pick-pin-head" />
                    </div>
                </div>
            )}

            {/* pin fijo al centro (modo marcador-centrado): el mapa se mueve por debajo
                y la colita de la bandera apunta al punto exacto */}
            {pickingOnMap && (
                <div className="pick-center-pin" aria-hidden="true">
                    {pickCenterLabel && <div className="pick-center-bubble">{pickCenterLabel}</div>}
                    <div className="pick-center-flag">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor"
                             strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 21V3M6 3h12l-2 4 2 4H6" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};

interface GeoMapProps extends OSMMapProps {
    engine?: string;
    userPos?: { x: number; y: number };
}

export const GeoMap: FC<GeoMapProps> = ({ engine = "stylized", searchCenter, ...props }) => {
    if (engine === "osm") return <OSMMap {...props} searchCenter={searchCenter} theme={props.theme} />;
    return (
        <LimaMap
            pins={props.pins as any}
            activePin={props.activePin}
            onPinClick={props.onPinClick as any}
            userPos={props.userPos}
            theme={props.theme}
            showRadar={props.showRadar}
        />
    );
};