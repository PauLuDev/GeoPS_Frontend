import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";

export interface AddressValue {
    address: string;
    district: string;
    lat: number;
    lng: number;
}

interface AddressPickerProps {
    value: AddressValue;
    onChange: (v: AddressValue) => void;
    error?: boolean;
}

interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
    address: {
        road?: string;
        suburb?: string;
        city_district?: string;
        district?: string;
        city?: string;
        town?: string;
        village?: string;
        house_number?: string;
    };
}

let leafletLoaderPromise: Promise<unknown> | null = null;
function loadLeaflet(): Promise<unknown> {
    if ((window as any).L) return Promise.resolve((window as any).L);
    if (leafletLoaderPromise) return leafletLoaderPromise;
    leafletLoaderPromise = new Promise((resolve, reject) => {
        if (!document.querySelector('link[href*="leaflet"]')) {
            const css = document.createElement("link");
            css.rel = "stylesheet";
            css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
            css.crossOrigin = "";
            document.head.appendChild(css);
        }
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

function extractDistrict(addr: NominatimResult["address"]): string {
    return addr.suburb || addr.city_district || addr.district || addr.city || addr.town || addr.village || "Lima";
}

function buildAddress(addr: NominatimResult["address"]): string {
    const road = addr.road ?? "";
    const number = addr.house_number ? ` ${addr.house_number}` : "";
    return road ? `${road}${number}` : "";
}

export function AddressPicker({ value, onChange, error }: AddressPickerProps) {
    const id = useId();
    const [query, setQuery] = useState(value.address);
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [open, setOpen] = useState(false);
    const [reverseLoading, setReverseLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const valueRef = useRef(value);
    valueRef.current = value;

    /* sincronizar el input cuando el valor externo cambia (ej: carga del initial) */
    useEffect(() => {
        setQuery(value.address);
    }, [value.address]);

    /* búsqueda Nominatim con debounce */
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const q = query.trim();
        if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + " Lima Peru")}&format=json&countrycodes=pe&viewbox=-77.25,-12.30,-76.65,-11.75&bounded=1&addressdetails=1&limit=5`,
                    { headers: { "Accept-Language": "es" } }
                );
                const data: NominatimResult[] = await res.json();
                setSuggestions(data);
                setOpen(data.length > 0);
            } catch {
                setSuggestions([]);
            } finally {
                setSearching(false);
            }
        }, 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query]);

    /* reverse geocode de las coordenadas actuales cuando cambia value.lat/lng */
    const reverseGeocode = async (lat: number, lng: number) => {
        setReverseLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
            );
            const data = await res.json();
            if (data?.address) {
                const addr = buildAddress(data.address);
                const dist = extractDistrict(data.address);
                const newQ = addr || dist;
                setQuery(newQ);
                onChange({ address: addr || dist, district: dist, lat, lng });
            }
        } catch { /* ignore */ } finally {
            setReverseLoading(false);
        }
    };

    /* inicializar / actualizar el minimapa */
    useEffect(() => {
        if (!mapContainerRef.current) return;
        let cancelled = false;

        loadLeaflet().then((raw) => {
            if (cancelled || !mapContainerRef.current) return;
            const L = raw as any;

            if (!mapRef.current) {
                const map = L.map(mapContainerRef.current, {
                    zoomControl: true,
                    attributionControl: false,
                    scrollWheelZoom: true,
                    dragging: true,
                }).setView([valueRef.current.lat || -12.05, valueRef.current.lng || -77.05], 15);

                L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
                    maxZoom: 19,
                    subdomains: "abcd",
                }).addTo(map);

                const pinIcon = L.divIcon({
                    className: "ap-map-pin-wrap",
                    html: `<div class="ap-map-pin"></div>`,
                    iconSize: [20, 28],
                    iconAnchor: [10, 28],
                });

                const marker = L.marker(
                    [valueRef.current.lat || -12.05, valueRef.current.lng || -77.05],
                    { icon: pinIcon, draggable: true }
                ).addTo(map);

                marker.on("dragend", () => {
                    const { lat, lng } = marker.getLatLng();
                    reverseGeocode(lat, lng);
                });

                map.on("click", (e: any) => {
                    const { lat, lng } = e.latlng;
                    marker.setLatLng([lat, lng]);
                    reverseGeocode(lat, lng);
                });

                mapRef.current = map;
                markerRef.current = marker;

                setTimeout(() => map.invalidateSize(), 80);
            }
        });

        return () => { cancelled = true; };
    }, []);

    /* mover el marcador cuando cambia value.lat/lng desde fuera */
    useEffect(() => {
        if (!markerRef.current || !mapRef.current || !value.lat) return;
        markerRef.current.setLatLng([value.lat, value.lng]);
        mapRef.current.setView([value.lat, value.lng], mapRef.current.getZoom(), { animate: true });
    }, [value.lat, value.lng]);

    const pickSuggestion = (r: NominatimResult) => {
        const addr = buildAddress(r.address) || r.display_name;
        const dist = extractDistrict(r.address);
        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.lon);
        setQuery(addr);
        setSuggestions([]);
        setOpen(false);
        onChange({ address: addr, district: dist, lat, lng });
    };

    return (
        <div className="ap-root">
            {/* campo de búsqueda con sugerencias */}
            <div className="ap-search-wrap">
                <div className={`ap-search-box${error ? " ap-error" : ""}`}>
                    <Icon name="location" size={15}/>
                    <input
                        id={id}
                        className="ap-input"
                        type="text"
                        autoComplete="off"
                        placeholder="Av. Pardo 1145, Miraflores"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 180)}
                    />
                    {searching && <span className="ap-spinner"/>}
                    {!searching && query && (
                        <button type="button" className="ap-clear" onClick={() => {
                            setQuery(""); setSuggestions([]); setOpen(false);
                        }}>
                            <Icon name="close" size={12}/>
                        </button>
                    )}
                </div>
                {open && suggestions.length > 0 && (
                    <ul className="ap-dropdown">
                        {suggestions.map((r, i) => (
                            <li key={i}>
                                <button type="button" className="ap-suggestion" onMouseDown={() => pickSuggestion(r)}>
                                    <Icon name="location" size={13}/>
                                    <div className="ap-sug-text">
                                        <span className="ap-sug-name">{buildAddress(r.address) || r.display_name}</span>
                                        <span className="ap-sug-sub">{extractDistrict(r.address)} · Lima</span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* minimapa: siempre visible, clic/drag para ajustar */}
            <div className="ap-map-wrap">
                <div ref={mapContainerRef} className="ap-minimap"/>
                {reverseLoading && (
                    <div className="ap-map-loading">
                        <span className="ap-spinner ap-spinner-dark"/>
                        <span>Detectando dirección…</span>
                    </div>
                )}
                <div className="ap-map-hint">Toca o arrastra el marcador para ajustar la ubicación</div>
            </div>

            {/* campos ocultos de distrito (se puede editar si la detección falla) */}
            {value.district && (
                <div className="ap-district-row">
                    <Icon name="location" size={12}/>
                    <span className="ap-district-label">Distrito detectado:</span>
                    <strong className="ap-district-value">{value.district}</strong>
                </div>
            )}
        </div>
    );
}
