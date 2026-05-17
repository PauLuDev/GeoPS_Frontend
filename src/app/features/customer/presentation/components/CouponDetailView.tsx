import {useEffect, useMemo, useRef, useState} from "react";
import {Icon} from "@/app/ui/components/Icon.tsx";
import {Coupon} from "@/app/core/common/types.ts";
import {PaymentModal} from "@/app/features/payment/presentation/components/PaymentModal.tsx";

interface CouponDetailViewProps {
    c: Coupon;
    isFav: boolean;
    isReserved: boolean;
    onToggleFav: () => void;
    onReserve: () => void;
    onBack: () => void;
    realDist?: number;
    realWalk?: number;
}

export function CouponDetailView({ c, isFav, isReserved, onToggleFav, onReserve, onBack, realDist, realWalk }: CouponDetailViewProps) {
    const dist     = realDist ?? c.distance;
    const walk     = realWalk ?? c.walking;
    const distLabel = dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist} m`;
    const [reserved, setReserved] = useState(isReserved);
    const [showPayment, setShowPayment] = useState(false);
    const [copied, setCopied]    = useState(false);
    const [tcOpen, setTcOpen]    = useState(false);
    const reviews = useMemo(() => buildReviews(c), [c.id]);

    useEffect(() => { setReserved(isReserved); }, [c.id, isReserved]);

    const handleReserve = () => { onReserve(); setReserved(true); };

    const handleRoute = () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}&destination_place_id=${encodeURIComponent(c.address)}`, "_blank");
    };

    const handleShare = () => {
        const url = `https://geops.app/c/${c.id}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200); }).catch(fallback);
        } else { fallback(); }
        function fallback() {
            const el = document.createElement("input"); el.value = url;
            document.body.appendChild(el); el.select(); document.execCommand("copy");
            document.body.removeChild(el); setCopied(true); setTimeout(() => setCopied(false), 2200);
        }
    };

    const restrictions = CAT_RESTRICTIONS[c.category] ?? CAT_RESTRICTIONS.food;
    const schedule     = CAT_SCHEDULE[c.category]     ?? CAT_SCHEDULE.food;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--bg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--line)", background: "var(--bg-elev)", flexShrink: 0 }}>
                <button className="btn btn-icon btn-sm" onClick={onBack} title="Volver">
                    <Icon name="arrowLeft" size={16}/>
                </button>
                <span style={{ fontSize: 12, color: "var(--ink-3)", flex: 1 }}>Detalle del cupón</span>
                <button className="btn btn-icon btn-sm" onClick={onToggleFav}
                        style={{ color: isFav ? "var(--brand-strong)" : "var(--ink-2)" }}>
                    <Icon name="bookmark" size={16} filled={isFav}/>
                </button>
                <button className="btn btn-icon btn-sm" onClick={handleShare}
                        style={{ color: copied ? "var(--brand-strong)" : "var(--ink-2)" }} title="Copiar enlace">
                    <Icon name={copied ? "check" : "share"} size={16}/>
                </button>
            </div>
            {copied && (
                <div style={{ background: "var(--ink)", color: "var(--bg)", fontSize: 12, padding: "8px 16px", textAlign: "center" }}>
                    ✓ Enlace copiado al portapapeles
                </div>
            )}

            <div style={{ flex: 1, overflowY: "auto" }}>
                <div style={{ position: "relative", height: 200, overflow: "hidden", flexShrink: 0,
                    background: c.imageUrl ? "transparent"
                        : `linear-gradient(135deg, color-mix(in oklab, var(--brand) 50%, var(--bg-sunken)) 0%, color-mix(in oklab, var(--accent-2) 30%, var(--bg-sunken)) 100%)` }}>
                    {c.imageUrl && <img src={c.imageUrl} alt={c.brand} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>}
                    <div style={{ position: "absolute", inset: 0, background: c.imageUrl ? "linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 60%)" : "none" }}/>
                    {!c.imageUrl && <div className="cd-hero-pattern"/>}
                    <div style={{ position: "absolute", left: 20, bottom: 18, color: c.imageUrl ? "#fff" : "var(--brand-ink)" }}>
                        <div style={{ fontSize: 11, opacity: 0.75, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{c.brand}</div>
                        <div style={{ fontSize: 48, lineHeight: 1, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "-0.04em", marginTop: 4 }}>−{c.discount}</div>
                    </div>
                    <div style={{ position: "absolute", right: 20, bottom: 18, textAlign: "right", color: c.imageUrl ? "#fff" : "var(--brand-ink)" }}>
                        <div style={{ fontSize: 11, opacity: 0.65, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Vence</div>
                        <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 2 }}>{c.expiresIn}</div>
                    </div>
                    {c.featured && (
                        <div style={{ position: "absolute", top: 12, left: 12, background: "var(--warn)", color: "#fff", fontSize: 10, padding: "3px 8px", borderRadius: 6, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 4 }}>
                            <Icon name="flame" size={10}/> Destacado
                        </div>
                    )}
                </div>

                <div style={{ padding: "20px 20px 0" }}>
                    <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{c.title}</h2>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "var(--ink-2)", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              <Icon name="star" size={12} filled/> <strong style={{ color: "var(--ink)" }}>{c.rating}</strong> ({c.reviews} reseñas)
            </span>
                        <span>·</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="location" size={11}/>{c.address}</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16, background: "var(--bg-sunken)", borderRadius: 12, padding: "14px 12px" }}>
                        {[
                            { label: "Precio final", value: `S/${c.finalPrice}`, sub: `antes S/${c.originalPrice}` },
                            { label: "Distancia", value: distLabel, sub: `${walk} min a pie` },
                            { label: "Stock", value: `${c.stock}`, sub: `de ${c.totalStock} dispon.` },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 9, color: "var(--ink-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
                                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: 4 }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{s.sub}</div>
                            </div>
                        ))}
                    </div>
                    <div className="stock-bar" style={{ marginTop: 8 }}>
                        <div className="stock-fill" style={{ width: `${(c.stock / c.totalStock) * 100}%` }}/>
                    </div>

                    <div style={{ marginTop: 20 }}>
                        <div className="eyebrow" style={{ marginBottom: 8 }}>Sobre la oferta</div>
                        <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>{c.description}</p>
                    </div>

                    <div style={{ marginTop: 20, padding: 14, background: "var(--bg-sunken)", borderRadius: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-elev)", border: "1px solid var(--line)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                            <Icon name="clock" size={14}/>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Horario de válido</div>
                            <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.7, fontFamily: "var(--font-mono)" }}>{schedule}</div>
                        </div>
                    </div>

                    <button className="btn btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: 14, gap: 10 }} onClick={handleRoute}>
                        <Icon name="map" size={16}/> Ver ruta en Google Maps
                    </button>

                    {reserved && (
                        <div className="cd-reserved scale-in" style={{ marginTop: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div className="cd-check"><Icon name="check" size={16}/></div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>Reservado a tu nombre</div>
                                    <div style={{ fontSize: 12, color: "var(--ink-2)" }}>Muestra esta pantalla en el local. Stock reservado 30 min.</div>
                                </div>
                            </div>
                            <div className="cd-code">
                                <div className="cd-code-pattern">
                                    <div className="cd-code-id mono">GEOPS · {c.id.toUpperCase()} · 7K3X</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 24, borderTop: "1px solid var(--line)", paddingTop: 20 }}>
                        <div className="eyebrow" style={{ marginBottom: 12 }}>Restricciones</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {restrictions.map((r, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--ink-2)" }}>
                                    <div style={{ width: 20, height: 20, borderRadius: 6, background: "var(--bg-sunken)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                                        <Icon name="close" size={9}/>
                                    </div>
                                    {r}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: 20, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                        <button style={{ width: "100%", appearance: "none", border: 0, background: "transparent", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", color: "var(--ink)" }}
                                onClick={() => setTcOpen(o => !o)}>
                            <span className="eyebrow">Términos y condiciones</span>
                            <Icon name={tcOpen ? "chevronDown" : "chevron"} size={14}/>
                        </button>
                        {tcOpen && (
                            <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--ink-3)", lineHeight: 1.65 }}>{TNC}</p>
                        )}
                    </div>

                    <div style={{ marginTop: 20, borderTop: "1px solid var(--line)", paddingTop: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <div className="eyebrow">Reseñas</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}>
                                <Icon name="star" size={13} filled style={{ color: "var(--warn)" }}/>
                                <strong>{c.rating}</strong>
                                <span style={{ color: "var(--ink-3)" }}>({c.reviews})</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {reviews.map((r, i) => (
                                <div key={i} style={{ padding: 14, background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-sunken)", border: "1px solid var(--line)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600 }}>
                                                {r.name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                                                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.date}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: 2 }}>
                                            {Array.from({ length: 5 }, (_, s) => (
                                                <Icon key={s} name="star" size={11} filled={s < r.rating} style={{ color: s < r.rating ? "var(--warn)" : "var(--line-strong)" }}/>
                                            ))}
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ height: 90 }}/>
                </div>
            </div>

            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)", background: "var(--bg-elev)", flexShrink: 0 }}>
                {reserved ? (
                    <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={onBack}>
                        Listo · ir al local <Icon name="walking" size={16}/>
                    </button>
                ) : (
                    <button className="btn btn-brand btn-lg" style={{ width: "100%", justifyContent: "center" }}
                            onClick={() => setShowPayment(true)}>
                        {c.finalPrice === 0 ? "Reservar gratis" : `Reservar · S/${c.finalPrice}`}
                        <Icon name="arrowRight" size={16}/>
                    </button>
                )}
            </div>

            {showPayment && (
                <PaymentModal coupon={c} onSuccess={handleReserve} onClose={() => setShowPayment(false)}/>
            )}
        </div>
    );
}

const CAT_RESTRICTIONS: Record<string, string[]> = {
    food:     ["Válido lun.–jue. de 12:00 a 16:00", "Solo para consumo en local", "No aplica con otras promociones", "Mínimo 2 personas para el 2×1"],
    cafe:     ["Válido todos los días de 08:00 a 20:00", "Bebida de tamaño mediano máximo", "Un cupón por persona por día"],
    shop:     ["Solo para productos en stock marcados", "No aplica en outlet ni packs", "Compra mínima de S/50"],
    health:   ["Requiere cita previa en el local", "Válido solo para nuevos pacientes", "Lun.–sáb. en horario de atención"],
    services: ["Reserva con 24 h de anticipación", "Sujeto a disponibilidad de agenda", "Válido mar.–dom. de 10:00 a 20:00"],
};
const CAT_SCHEDULE: Record<string, string> = {
    food:     "Lun.–Jue. 12:00–16:00  ·  Vie.–Sáb. 12:00–17:00  ·  Dom. cerrado",
    cafe:     "Todos los días  08:00–21:00",
    shop:     "Lun.–Sáb. 10:00–21:00  ·  Dom. 11:00–19:00",
    health:   "Lun.–Vie. 08:00–18:00  ·  Sáb. 08:00–13:00",
    services: "Mar.–Dom. 10:00–20:00",
};
const TNC = "Al usar este cupón el usuario acepta que el beneficio es personal e intransferible, válido por una sola vez por cuenta registrada en GeoPS. El establecimiento puede rechazar el cupón si existe evidencia de mal uso. GeoPS no garantiza disponibilidad de stock después de la reserva si el usuario no se presenta dentro del plazo de 30 minutos. Los precios mostrados incluyen IGV. El beneficio no puede canjearse por dinero en efectivo.";

function seedRand(seed: number) {
    let s = seed;
    return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function buildReviews(c: Coupon) {
    const rand = seedRand(c.id.charCodeAt(1) * 31 + c.reviews);
    const NAMES  = ["Carlos M.","Lucía R.","Diego P.","Valeria S.","Andrés T.","Camila F.","Miguel A.","Sofía L.","Fernanda C.","Rodrigo V."];
    const TEXTS  = [
        "Muy buen descuento, lo recomiendo al 100 %.",
        "Rápido y sin problema, en 5 min ya estaba usando el cupón.",
        "Excelente atención en el local, el descuento se aplicó sin rollos.",
        "Vale la pena, buena comida y precio justo para Lima.",
        "El staff fue amable y el proceso muy sencillo.",
        "Buen descuento aunque el stock se agota bastante rápido.",
        "Lo usé un martes, sin cola y bien atendido.",
        "Súper recomendado para el almuerzo del finde.",
        "Repetí al mes siguiente, igual de buena experiencia.",
        "La reserva fue instantánea, llegué y me atendieron al toque.",
    ];
    const DATES  = ["Hace 1 día","Hace 3 días","Hace 1 semana","Hace 2 semanas","Hace 1 mes"];
    const count  = 2 + Math.floor(rand() * 4);
    return Array.from({ length: count }, (_, i) => ({
        name:    NAMES[Math.floor(rand() * NAMES.length)],
        rating:  Math.max(3, Math.min(5, Math.round(c.rating + (rand() - 0.5) * 1.2))),
        comment: TEXTS[Math.floor(rand() * TEXTS.length)],
        date:    DATES[i % DATES.length],
    }));
}