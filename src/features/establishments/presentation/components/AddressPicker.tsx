import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";

export interface AddressValue {
    address: string;
    district: string;
    lat: number;
    lng: number;
    region?: string;
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
        neighbourhood?: string;
        quarter?: string;
        suburb?: string;
        city_district?: string;
        district?: string;
        city?: string;
        town?: string;
        village?: string;
        house_number?: string;
        state?: string;
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

/* localidad más específica -> diferencia segmentos de una misma avenida (ej "Mirones") */
function extractLocality(addr: NominatimResult["address"]): string {
    return addr.neighbourhood || addr.quarter || addr.suburb || addr.city_district || addr.district || "";
}
function extractCity(addr: NominatimResult["address"]): string {
    return addr.city || addr.town || addr.village || addr.state || "Lima";
}

/* subtítulo de la sugerencia: "localidad · ciudad" cuando hay detalle, si no la ciudad */
function suggestionSub(addr: NominatimResult["address"]): string {
    const loc = extractLocality(addr);
    const city = extractCity(addr);
    return loc && loc !== city ? `${loc} · ${city}` : city;
}


function extractRegion(addr: NominatimResult["address"]): string {
    return addr.state || "Lima";
}

/* arma "calle número" a partir de un resultado de Nominatim. En Lima, Nominatim
   suele omitir house_number en el objeto address y colapsar la búsqueda al centro
   de la vía, por eso también miramos el primer segmento del display_name, que a
   veces trae el número (ej "1145, Avenida Pardo, ...") */
function buildAddress(r: { address: NominatimResult["address"]; display_name?: string }): string {
    const road = r.address.road ?? "";
    if (road && r.address.house_number) return `${road} ${r.address.house_number}`;
    const first = r.display_name?.split(",")[0]?.trim() ?? "";
    if (road) return /^\d+[a-z]?$/i.test(first) ? `${road} ${first}` : road;
    return first;
}

/* extrae un número de puerta del texto que escribió el usuario (ej "Olaya 250" -> "250") */
function extractTypedNumber(text: string): string {
    const m = text.match(/\b\d+[a-z]?\b/i);
    return m ? m[0] : "";
}


function isDarkTheme(): boolean {
    return document.querySelector(".geops-app")?.getAttribute("data-theme") === "dark";
}
function tileUrl(dark: boolean): string {
    return dark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
}

export function AddressPicker({ value, onChange, error }: AddressPickerProps) {
    const id = useId();
    const [query, setQuery] = useState(value.address);
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [open, setOpen] = useState(false);
    const [reverseLoading, setReverseLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    /* evita que el cambio programático de query (tras picar en el mapa) dispare
       una segunda búsqueda: la búsqueda ya la lanza reverseGeocode directamente */
    const skipSearchRef = useRef(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const tileLayerRef = useRef<any>(null);
    const didAutoLocate = useRef(false);
    const valueRef = useRef(value);
    valueRef.current = value;

    /* sincronizar el input cuando el valor externo cambia (ej: carga del initial) */
    useEffect(() => {
        setQuery(value.address);
    }, [value.address]);

    /* consulta Nominatim y llena/abre el dropdown de sugerencias */
    const searchAddresses = useCallback(async (raw: string) => {
        const q = raw.trim();
        if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
        setSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + " Lima Peru")}&format=json&countrycodes=pe&viewbox=-77.25,-12.30,-76.65,-11.75&bounded=1&addressdetails=1&limit=5`,
                { headers: { "Accept-Language": "es" } }
            );
            const data: NominatimResult[] = await res.json();
            /* Nominatim devuelve varios segmentos idénticos de una misma vía;
               colapsamos los que muestran la misma calle y localidad */
            const seen = new Set<string>();
            const unique = data.filter((r) => {
                const key = `${buildAddress(r)}|${suggestionSub(r.address)}`.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            setSuggestions(unique);
            setOpen(unique.length > 0);
        } catch {
            setSuggestions([]);
        } finally {
            setSearching(false);
        }
    }, []);

    /* búsqueda con debounce al teclear (se omite si el cambio vino de picar el mapa) */
    useEffect(() => {
        if (skipSearchRef.current) { skipSearchRef.current = false; return; }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const q = query.trim();
        if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
        debounceRef.current = setTimeout(() => searchAddresses(q), 350);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query, searchAddresses]);

    /* reverse geocode de las coordenadas actuales cuando cambia value.lat/lng.
       zoom=18 -> nivel edificio, así Nominatim devuelve el número de puerta si existe */
    const reverseGeocode = async (lat: number, lng: number) => {
        setReverseLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`
            );
            const data = await res.json();
            if (data?.address) {
                const addr = buildAddress(data);
                const dist = extractDistrict(data.address);
                const region = extractRegion(data.address);
                const newQ = addr || dist;
                /* el cambio de query es programático -> que no lo re-busque el debounce */
                skipSearchRef.current = true;
                setQuery(newQ);
                onChange({ address: addr || dist, district: dist, lat, lng, region });
                /* mostramos sugerencias del lugar elegido para poder afinar la dirección */
                void searchAddresses(newQ);
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
                    zoomControl: false,   // sin botones +/- -> se hace zoom con la rueda
                    attributionControl: false,
                    scrollWheelZoom: true,
                    dragging: true,
                }).setView([valueRef.current.lat || -12.05, valueRef.current.lng || -77.05], 15);

                tileLayerRef.current = L.tileLayer(tileUrl(isDarkTheme()), {
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


    useEffect(() => {
        const appEl = document.querySelector(".geops-app");
        if (!appEl) return;
        const obs = new MutationObserver(() => {
            const L = (window as any).L;
            if (!L || !mapRef.current) return;
            if (tileLayerRef.current) mapRef.current.removeLayer(tileLayerRef.current);
            tileLayerRef.current = L.tileLayer(tileUrl(isDarkTheme()), {
                maxZoom: 19, subdomains: "abcd",
            }).addTo(mapRef.current);
        });
        obs.observe(appEl, { attributes: true, attributeFilter: ["data-theme"] });
        return () => obs.disconnect();
    }, []);


    useEffect(() => {
        if (didAutoLocate.current) return;
        if (valueRef.current.address.trim()) return;   // editando -> no sobreescribir
        if (!navigator.geolocation) return;
        didAutoLocate.current = true;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                if (markerRef.current && mapRef.current) {
                    markerRef.current.setLatLng([latitude, longitude]);
                    mapRef.current.setView([latitude, longitude], 16, { animate: true });
                }
                void reverseGeocode(latitude, longitude);
            },
            () => { /* permiso denegado -> se queda con el default */ },
            { enableHighAccuracy: true, timeout: 8000 },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* mover el marcador cuando cambia value.lat/lng desde fuera */
    useEffect(() => {
        if (!markerRef.current || !mapRef.current || !value.lat) return;
        markerRef.current.setLatLng([value.lat, value.lng]);
        mapRef.current.setView([value.lat, value.lng], mapRef.current.getZoom(), { animate: true });
    }, [value.lat, value.lng]);

    /* etiqueta de una sugerencia: calle (+número si Nominatim lo trae) y, si la
       vía no tiene número pero el usuario tecleó uno, lo conserva en el texto */
    const suggestionLabel = (r: NominatimResult): string => {
        const base = buildAddress(r) || r.display_name;
        if (!/\d/.test(base)) {
            const typed = extractTypedNumber(query);
            if (typed) return `${base} ${typed}`;
        }
        return base;
    };

    const pickSuggestion = (r: NominatimResult) => {
        const addr = suggestionLabel(r);
        const dist = extractDistrict(r.address);
        const region = extractRegion(r.address);
        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.lon);
        setQuery(addr);
        setSuggestions([]);
        setOpen(false);
        onChange({ address: addr, district: dist, lat, lng, region });
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
                                        <span className="ap-sug-name">{suggestionLabel(r)}</span>
                                        <span className="ap-sug-sub">{suggestionSub(r.address)}</span>
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
