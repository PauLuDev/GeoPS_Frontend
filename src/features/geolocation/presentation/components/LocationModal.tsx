import {useEffect, useRef, useState} from "react";
import { Icon } from "@/shared/ui/components/Icon";
import {createPortal} from "react-dom";
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

    const highlight = (text: string, q: string) => {
        if (!q) return <>{text}</>;
        const idx = text.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return <>{text}</>;
        return <>{text.slice(0, idx)}<strong style={{ color: "var(--ink)", fontWeight: 700 }}>{text.slice(idx, idx + q.length)}</strong>{text.slice(idx + q.length)}</>;
    };

    return createPortal(
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Seleccionar ubicación" onClick={isFirst ? undefined : onClose}
             style={{ alignItems: "flex-start", paddingTop: "6vh", zIndex: 95 }}>
            <div className="modal" onClick={e => e.stopPropagation()}
                 style={{ width: "min(440px, calc(100vw - 20px))", padding: 0, overflow: "hidden",
                     borderRadius: 18, boxShadow: "0 12px 48px rgba(0,0,0,0.22)" }}>

                <div style={{ padding: "20px 20px 16px", background: "var(--bg-elev)",
                    borderBottom: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div className="loc-icon">
                                <Icon name="pin" size={22}/>
                            </div>
                            <div>
                                <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.3px" }}>
                                    ¿Dónde te encuentras?
                                </div>
                                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.5 }}>
                                    GeoPS muestra cupones activos cerca de ti
                                </div>
                            </div>
                        </div>
                        {!isFirst && onClose && (
                            <button type="button" className="btn btn-icon btn-sm" onClick={onClose} style={{ flexShrink: 0, marginTop: 2 }}>
                                <Icon name="close" size={14}/>
                            </button>
                        )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10,
                        background: "var(--bg-sunken)", borderRadius: 12,
                        padding: "10px 14px", border: "1.5px solid var(--line)" }}>
                        {loading
                            ? <div style={{ width: 17, height: 17, border: "2px solid var(--brand)", borderTopColor: "transparent",
                                borderRadius: "50%", animation: "loc-spin 0.65s linear infinite", flexShrink: 0 }}/>
                            : <Icon name="search" size={17} style={{ color: "var(--ink-3)", flexShrink: 0 }}/>}
                        <input ref={inputRef} value={query}
                               onChange={e => setQuery(e.target.value)}
                               aria-label="Buscar ubicación"
                               placeholder="Busca tu distrito, avenida o lugar…"
                               autoComplete="off"
                               style={{ flex: 1, border: "none", outline: "none", background: "transparent",
                                   fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--ink)" }}/>
                        {query && (
                            <button type="button" className="loc-clear-btn" onClick={() => { setQuery(""); setOsm([]); inputRef.current?.focus(); }}>
                                <Icon name="close" size={13}/>
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ background: "var(--bg-elev)", maxHeight: "52vh", overflowY: "auto" }}>
                    <div style={{ padding: "10px 16px 4px" }}>
            <span style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase",
                letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>
              {isSearching
                  ? loading ? "Buscando…" : `${osm.length} resultado${osm.length !== 1 ? "s" : ""}`
                  : "Zonas populares"}
            </span>
                    </div>

                    {!isSearching && suggested.map((p, i) => (
                        <button type="button" key={p.name} onClick={() => pickSuggested(p)}
                                style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px",
                                    width: "100%", background: "transparent", border: 0, cursor: "pointer",
                                    fontFamily: "inherit", textAlign: "left", transition: "background 80ms",
                                    borderBottom: i < suggested.length - 1 ? "1px solid var(--line)" : "none" }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-sunken)"}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                                background: "var(--bg-sunken)", display: "grid", placeItems: "center",
                                color: "var(--ink-3)" }}>
                                <Icon name="clock" size={15}/>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>{p.name}</div>
                                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{p.sub}</div>
                            </div>
                        </button>
                    ))}

                    {isSearching && !loading && osm.length > 0 && osm.map((p, i) => (
                        <button type="button" key={`osm-${i}-${p.lat}-${p.lng}`} onClick={() => pickOsm(p)}
                                style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px",
                                    width: "100%", background: "transparent", border: 0, cursor: "pointer",
                                    fontFamily: "inherit", textAlign: "left", transition: "background 80ms",
                                    borderBottom: i < osm.length - 1 ? "1px solid var(--line)" : "none" }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-sunken)"}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                                background: "color-mix(in oklab, var(--brand) 12%, var(--bg-sunken))",
                                display: "grid", placeItems: "center", color: "var(--brand-strong)" }}>
                                <Icon name="pin" size={16}/>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500,
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {highlight(p.name, query.trim())}
                                </div>
                                {p.sub && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>{p.sub}</div>}
                            </div>
                        </button>
                    ))}

                    {isSearching && !loading && osm.length === 0 && (
                        <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column",
                            alignItems: "center", gap: 8, color: "var(--ink-3)" }}>
                            <Icon name="search" size={28}/>
                            <div style={{ fontSize: 13, textAlign: "center" }}>
                                Sin resultados para <strong style={{ color: "var(--ink)" }}>«{query}»</strong>
                                <br/>
                                <span style={{ fontSize: 11 }}>Intenta con el nombre del distrito o avenida</span>
                            </div>
                        </div>
                    )}

                    {loading && [1,2,3].map(i => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px",
                            borderBottom: "1px solid var(--line)" }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-sunken)",
                                animation: "loc-pulse 1.2s ease-in-out infinite" }}/>
                            <div style={{ flex: 1 }}>
                                <div style={{ height: 12, borderRadius: 6, background: "var(--bg-sunken)",
                                    width: `${55 + i * 12}%`, animation: "loc-pulse 1.2s ease-in-out infinite" }}/>
                                <div style={{ height: 10, borderRadius: 6, background: "var(--bg-sunken)",
                                    width: "40%", marginTop: 6, animation: "loc-pulse 1.2s ease-in-out infinite" }}/>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>,
        document.getElementById("geops-portal-root") ?? document.body
    );
}