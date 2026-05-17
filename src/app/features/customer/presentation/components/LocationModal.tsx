import {useEffect, useRef, useState} from "react";
import {AuthScreen} from "@/app/features/auth/presentation/views/AuthScreen.tsx";
import { Icon } from "@/app/ui/components/Icon";
import {createPortal} from "react-dom";
import {UserLocation} from "@/app/core/common/types.ts";

interface LocationModalProps {
    onSelect: (loc: UserLocation) => void;
    onClose?: () => void;
    isFirst?: boolean;
}

const LIMA_ALL_PLACES = [
    { name: "Miraflores",           sub: "Lima Moderna",        lat: -12.1211, lng: -77.0297 },
    { name: "San Isidro",           sub: "Lima Moderna",        lat: -12.0971, lng: -77.0369 },
    { name: "Barranco",             sub: "Lima Moderna",        lat: -12.1494, lng: -77.0213 },
    { name: "San Borja",            sub: "Lima Moderna",        lat: -12.1006, lng: -76.9990 },
    { name: "Magdalena del Mar",    sub: "Lima Moderna",        lat: -12.0882, lng: -77.0724 },
    { name: "Pueblo Libre",         sub: "Lima Moderna",        lat: -12.0775, lng: -77.0689 },
    { name: "Surco",                sub: "Lima Sur",            lat: -12.0890, lng: -76.9770 },
    { name: "Chorrillos",           sub: "Lima Sur",            lat: -12.1692, lng: -77.0207 },
    { name: "Surquillo",            sub: "Lima Sur",            lat: -12.1117, lng: -77.0108 },
    { name: "Villa María del Triunfo", sub: "Lima Sur",         lat: -12.1617, lng: -76.9321 },
    { name: "La Molina",            sub: "Lima Este",           lat: -12.0800, lng: -76.9433 },
    { name: "Ate",                  sub: "Lima Este",           lat: -12.0266, lng: -76.9167 },
    { name: "Santa Anita",          sub: "Lima Este",           lat: -12.0472, lng: -76.9696 },
    { name: "Lurigancho",           sub: "Lima Este",           lat: -11.9912, lng: -76.9706 },
    { name: "Lima Centro",          sub: "Cercado de Lima",     lat: -12.0464, lng: -77.0428 },
    { name: "Breña",                sub: "Lima Centro",         lat: -12.0663, lng: -77.0515 },
    { name: "La Victoria",          sub: "Lima Centro",         lat: -12.0671, lng: -77.0185 },
    { name: "Rímac",                sub: "Lima Centro",         lat: -12.0281, lng: -77.0319 },
    { name: "Los Olivos",           sub: "Lima Norte",          lat: -11.9880, lng: -77.0641 },
    { name: "San Martín de Porres", sub: "Lima Norte",          lat: -12.0267, lng: -77.1027 },
    { name: "Comas",                sub: "Lima Norte",          lat: -11.9363, lng: -77.0546 },
    { name: "Independencia",        sub: "Lima Norte",          lat: -12.0000, lng: -77.0540 },
    { name: "Jesús María",          sub: "Lima Moderna",        lat: -12.0731, lng: -77.0473 },
    { name: "Lince",                sub: "Lima Moderna",        lat: -12.0847, lng: -77.0363 },
    { name: "San Miguel",           sub: "Lima Moderna",        lat: -12.0781, lng: -77.0897 },
    { name: "Av. La Marina",        sub: "San Miguel",          lat: -12.0747, lng: -77.0889 },
    { name: "Av. Larco",            sub: "Miraflores",          lat: -12.1293, lng: -77.0303 },
    { name: "Av. Javier Prado",     sub: "San Isidro",          lat: -12.0944, lng: -77.0209 },
    { name: "Av. La Molina",        sub: "La Molina",           lat: -12.0814, lng: -76.9500 },
    { name: "Av. Las Flores de Primavera", sub: "San Juan de Lurigancho", lat: -12.0200, lng: -76.9800 },
    { name: "Av. La Paz",           sub: "Lima",                lat: -12.1195, lng: -77.0282 },
    { name: "Av. Las Palmeras",     sub: "Los Olivos",          lat: -11.9750, lng: -77.0610 },
    { name: "Av. Universitaria",    sub: "Los Olivos",          lat: -11.9700, lng: -77.0600 },
];

const LOC_SUGGESTED = [
    "Miraflores", "San Isidro", "Barranco", "Surco", "La Molina",
    "Los Olivos", "San Martín de Porres", "Lima Centro",
];

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

    useEffect(() => { setTimeout(() => inputRef.current?.focus(), 120); }, []);

    useEffect(() => {
        const q = query.trim();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (q.length < 2) { setOsm([]); setLoading(false); return; }
        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=pe&viewbox=-77.25,-12.30,-76.65,-11.75&bounded=1&addressdetails=1&limit=7&accept-language=es`;
                const res = await fetch(url, { headers: { "Accept-Language": "es" } });
                const data: NominatimResult[] = await res.json();
                setOsm(data.map(parseNominatim));
            } catch { setOsm([]); }
            setLoading(false);
        }, 340);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
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
        <div className="overlay" onClick={isFirst ? undefined : onClose}
             style={{ alignItems: "flex-start", paddingTop: "6vh", zIndex: 95 }}>
            <div className="modal" onClick={e => e.stopPropagation()}
                 style={{ width: "min(440px, calc(100vw - 20px))", padding: 0, overflow: "hidden",
                     borderRadius: 18, boxShadow: "0 12px 48px rgba(0,0,0,0.22)" }}>

                <div style={{ padding: "20px 20px 16px", background: "var(--bg-elev)",
                    borderBottom: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 13,
                                background: "color-mix(in oklab, var(--brand) 16%, var(--bg-sunken))",
                                display: "grid", placeItems: "center", color: "var(--brand-strong)", flexShrink: 0 }}>
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
                            <button className="btn btn-icon btn-sm" onClick={onClose} style={{ flexShrink: 0, marginTop: 2 }}>
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
                               placeholder="Busca tu distrito, avenida o lugar…"
                               autoComplete="off"
                               style={{ flex: 1, border: "none", outline: "none", background: "transparent",
                                   fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--ink)" }}/>
                        {query && (
                            <button onClick={() => { setQuery(""); setOsm([]); inputRef.current?.focus(); }}
                                    style={{ appearance: "none", border: 0, background: "transparent",
                                        cursor: "pointer", color: "var(--ink-3)", padding: 2, display: "flex", flexShrink: 0 }}>
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
                        <button key={p.name} onClick={() => pickSuggested(p)}
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
                        <button key={`osm-${i}-${p.lat}-${p.lng}`} onClick={() => pickOsm(p)}
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
            <style>{`
        @keyframes loc-spin  { to { transform: rotate(360deg); } }
        @keyframes loc-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
      `}</style>
        </div>,
        document.getElementById("geops-portal-root") ?? document.body
    );
}