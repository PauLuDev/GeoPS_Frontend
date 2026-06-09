import {useEffect, useRef, useState} from "react";
import { Icon } from "@/shared/ui/components/Icon";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import {UserLocation} from "@/shared/types.ts";
import { LIMA_ALL_PLACES, LOC_SUGGESTED } from "@/features/geolocation/infrastructure/services/limaDistricts.ts";

interface LocationModalProps {
    onSelect: (loc: UserLocation) => void;
    onClose?: () => void;
    isFirst?: boolean;
}

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address?: {
        suburb?: string; city_district?: string; borough?: string;
        county?: string; state?: string; road?: string; town?: string; village?: string;
    };
}
function parseNominatim(r: NominatimResult) {
    const parts = r.display_name.split(",");
    const name = parts[0]?.trim() ?? r.display_name;
    const a = r.address ?? {};
    const sub = a.city_district ?? a.suburb ?? a.borough ?? a.county ?? parts[1]?.trim() ?? "";
    return { name, sub, lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
}

/* resalta la coincidencia de la busqueda dentro del texto (puro) */
function highlight(text: string, q: string) {
    if (!q) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return <>{text.slice(0, idx)}<strong className="lm-hl">{text.slice(idx, idx + q.length)}</strong>{text.slice(idx + q.length)}</>;
}

export function LocationModal({ onSelect, onClose, isFirst = false }: LocationModalProps) {
    const [query, setQuery] = useState("");
    const [osm, setOsm] = useState<ReturnType<typeof parseNominatim>[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const id = setTimeout(() => inputRef.current?.focus(), 120);
        return () => clearTimeout(id);
    }, []);

    useEffect(() => {
        const q = query.trim();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (q.length < 2) { setOsm([]); setLoading(false); return; }
        setLoading(true);
        const controller = new AbortController();
        debounceRef.current = setTimeout(async () => {
            try {
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=pe&viewbox=-77.25,-12.30,-76.65,-11.75&bounded=1&addressdetails=1&limit=7&accept-language=es`;
                const res = await fetch(url, { signal: controller.signal, headers: { "Accept-Language": "es" } });
                const data: NominatimResult[] = await res.json();
                setOsm(data.map(parseNominatim));
            } catch (e) {
                if ((e as Error).name !== "AbortError") setOsm([]);
            }
            setLoading(false);
        }, 340);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            controller.abort();
        };
    }, [query]);

    const isSearching = query.trim().length >= 2;
    const suggested = LIMA_ALL_PLACES.filter(p => LOC_SUGGESTED.includes(p.name));

    const pickOsm = (p: ReturnType<typeof parseNominatim>) =>
        onSelect({ lat: p.lat, lng: p.lng, name: p.name, source: "manual" });
    const pickSuggested = (p: typeof LIMA_ALL_PLACES[0]) =>
        onSelect({ lat: p.lat, lng: p.lng, name: p.name, source: "manual" });

    return (
        <Modal onClose={() => onClose?.()} ariaLabel="Seleccionar ubicación" className="lm-modal" dismissable={!isFirst}>

                <div className="lm-header">
                    <div className="lm-header-top">
                        <div className="lm-title-row">
                            <div className="loc-icon">
                                <Icon name="pin" size={22}/>
                            </div>
                            <div>
                                <div className="lm-title">
                                    ¿Dónde te encuentras?
                                </div>
                                <div className="lm-subtitle">
                                    GeoPS muestra cupones activos cerca de ti
                                </div>
                            </div>
                        </div>
                        {!isFirst && onClose && (
                            <button type="button" className="btn btn-icon btn-sm lm-close" onClick={onClose}>
                                <Icon name="close" size={14}/>
                            </button>
                        )}
                    </div>

                    <div className="lm-search">
                        {loading
                            ? <div className="lm-spinner"/>
                            : <Icon name="search" size={17}/>}
                        <input ref={inputRef} value={query}
                               onChange={e => setQuery(e.target.value)}
                               aria-label="Buscar ubicación"
                               placeholder="Busca tu distrito, avenida o lugar…"
                               autoComplete="off"
                               className="lm-input"/>
                        {query && (
                            <button type="button" className="loc-clear-btn" onClick={() => { setQuery(""); setOsm([]); inputRef.current?.focus(); }}>
                                <Icon name="close" size={13}/>
                            </button>
                        )}
                    </div>
                </div>

                <div className="lm-list">
                    <div className="lm-list-head">
                        <span className="lm-list-label">
                            {isSearching
                                ? loading ? "Buscando…" : `${osm.length} resultado${osm.length !== 1 ? "s" : ""}`
                                : "Zonas populares"}
                        </span>
                    </div>

                    {!isSearching && suggested.map((p) => (
                        <button type="button" key={p.name} onClick={() => pickSuggested(p)} className="loc-row">
                            <div className="loc-row-icon">
                                <Icon name="clock" size={15}/>
                            </div>
                            <div className="loc-row-main">
                                <div className="loc-row-name">{p.name}</div>
                                <div className="loc-row-sub">{p.sub}</div>
                            </div>
                        </button>
                    ))}

                    {isSearching && !loading && osm.length > 0 && osm.map((p, i) => (
                        <button type="button" key={`osm-${i}-${p.lat}-${p.lng}`} onClick={() => pickOsm(p)} className="loc-row">
                            <div className="loc-row-icon brand">
                                <Icon name="pin" size={16}/>
                            </div>
                            <div className="loc-row-main">
                                <div className="loc-row-name ellipsis">
                                    {highlight(p.name, query.trim())}
                                </div>
                                {p.sub && <div className="loc-row-sub mt1">{p.sub}</div>}
                            </div>
                        </button>
                    ))}

                    {isSearching && !loading && osm.length === 0 && (
                        <div className="lm-empty">
                            <Icon name="search" size={28}/>
                            <div className="lm-empty-text">
                                Sin resultados para <strong className="lm-strong">«{query}»</strong>
                                <br/>
                                <span className="lm-empty-hint">Intenta con el nombre del distrito o avenida</span>
                            </div>
                        </div>
                    )}

                    {loading && [1,2,3].map(i => (
                        <div key={i} className="lm-skel-row">
                            <div className="lm-skel-icon"/>
                            <div className="lm-skel-main">
                                <div className="lm-skel-line1" style={{ width: `${55 + i * 12}%` }}/>
                                <div className="lm-skel-line2"/>
                            </div>
                        </div>
                    ))}
                </div>
        </Modal>
    );
}