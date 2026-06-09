import {useEffect, useState} from "react";
import {Icon} from "@/shared/ui/components/Icon.tsx";
import {Coupon} from "@/shared/types.ts";
import {PaymentModal} from "@/features/coupons/presentation/components/PaymentModal.tsx";
import {useComments} from "@/features/comments/presentation/hooks/useComments.ts";
import {Comment} from "@/features/comments/domain/entities/Comment.ts";
import {CommentStats} from "@/features/comments/domain/entities/CommentStats.ts";

interface CouponDetailViewProps {
    c: Coupon;
    isFav: boolean;
    isReserved: boolean;
    onToggleFav: () => void;
    onReserve: () => void;
    onBack: () => void;
    onViewBusiness?: () => void;
    realDist?: number;
    realWalk?: number;
}

export function CouponDetailView({ c, isFav, isReserved, onToggleFav, onReserve, onBack, onViewBusiness, realDist, realWalk }: CouponDetailViewProps) {
    const dist     = realDist ?? c.distance;
    const walk     = realWalk ?? c.walking;
    const distLabel = dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist} m`;
    const [showPayment, setShowPayment] = useState(false);
    const [copied, setCopied]    = useState(false);
    const [tcOpen, setTcOpen]    = useState(false);

    /* resenas desde el BC comments (comment-service) */
    const { list, average } = useComments();
    const [reviews, setReviews] = useState<Comment[]>([]);
    const [stats, setStats]     = useState<CommentStats | null>(null);

    // limpia las resenas en render al cambiar de cupon para no mostrar las del anterior
    const [prevId, setPrevId] = useState(c.id);
    if (c.id !== prevId) {
        setPrevId(c.id);
        setReviews([]);
        setStats(null);
    }

    useEffect(() => {
        let alive = true;
        list(c.id).then(r => { if (alive && r) setReviews(r); });
        average(c.id).then(s => { if (alive && s) setStats(s); });
        return () => { alive = false; };
    }, [c.id, list, average]);

    const handleReserve = () => { onReserve(); };

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
        <div className="cd-root">
            <div className="cd-head">
                <button type="button" className="btn btn-icon btn-sm" onClick={onBack} title="Volver" aria-label="Volver">
                    <Icon name="arrowLeft" size={16}/>
                </button>
                <span className="cd-head-title">Detalle del cupón</span>
                <button type="button" className={"btn btn-icon btn-sm cd-headbtn" + (isFav ? " on" : "")} onClick={onToggleFav} aria-label="Guardar cupón">
                    <Icon name="bookmark" size={16} filled={isFav}/>
                </button>
                <button type="button" className={"btn btn-icon btn-sm cd-headbtn" + (copied ? " on" : "")} onClick={handleShare} title="Copiar enlace" aria-label="Copiar enlace">
                    <Icon name={copied ? "check" : "share"} size={16}/>
                </button>
            </div>
            {copied && (
                <div className="cd-copied">
                    ✓ Enlace copiado al portapapeles
                </div>
            )}

            <div className="cd-body">
                <div className={"cd-hero2" + (c.imageUrl ? " has-img" : "")}>
                    {c.imageUrl && <img src={c.imageUrl} alt={c.brand} className="cd-hero-img"/>}
                    {c.imageUrl && <div className="cd-hero-scrim"/>}
                    {!c.imageUrl && <div className="cd-hero-pattern"/>}
                    <div className="cd-hero-left">
                        <div className="cd-hero-brand">{c.brand}</div>
                        <div className="cd-hero-disc">−{c.discount}</div>
                    </div>
                    <div className="cd-hero-right">
                        <div className="cd-hero-vence-label">Vence</div>
                        <div className="cd-hero-vence">{c.expiresIn}</div>
                    </div>
                    {c.featured && (
                        <div className="cd-hero-feat">
                            <Icon name="flame" size={10}/> Destacado
                        </div>
                    )}
                </div>

                <div className="cd-content">
                    <h2 className="cd-title">{c.title}</h2>
                    <div className="cd-meta-row">
                        <span className="cd-meta-item">
                            <Icon name="star" size={12} filled/> <strong>{stats?.averageRating ?? c.rating}</strong> ({stats?.totalReviews ?? c.reviews} reseñas)
                        </span>
                        <span>·</span>
                        <span className="cd-meta-item"><Icon name="location" size={11}/>{c.address}</span>
                    </div>

                    <div className="cd-stats">
                        {[
                            { label: "Precio final", value: `S/${c.finalPrice}`, sub: `antes S/${c.originalPrice}` },
                            { label: "Distancia", value: distLabel, sub: `${walk} min a pie` },
                            { label: "Stock", value: `${c.stock}`, sub: `de ${c.totalStock} dispon.` },
                        ].map((s) => (
                            <div key={s.label} className="cd-stat-c">
                                <div className="cd-stat-label">{s.label}</div>
                                <div className="cd-stat-value">{s.value}</div>
                                <div className="cd-stat-sub">{s.sub}</div>
                            </div>
                        ))}
                    </div>
                    <div className="stock-bar">
                        <div className="stock-fill" style={{ width: `${(c.stock / c.totalStock) * 100}%` }}/>
                    </div>

                    <div className="cd-block">
                        <div className="eyebrow cd-block-eyebrow">Sobre la oferta</div>
                        <p className="cd-desc">{c.description}</p>
                    </div>

                    <div className="cd-sched">
                        <div className="cd-sched-icon">
                            <Icon name="clock" size={14}/>
                        </div>
                        <div>
                            <div className="cd-sched-title">Horario de válido</div>
                            <div className="cd-sched-text">{schedule}</div>
                        </div>
                    </div>

                    <div className="cd-actions">
                        <button type="button" className="btn btn-lg cd-action-btn" onClick={handleRoute}>
                            <Icon name="map" size={16}/> Ruta
                        </button>
                        <button type="button" className="btn btn-lg cd-action-btn" onClick={onViewBusiness}>
                            <Icon name="store" size={16}/> Ver local
                        </button>
                    </div>

                    {isReserved && (
                        <div className="cd-reserved scale-in cd-mt16">
                            <div className="cd-reserved-row">
                                <div className="cd-check"><Icon name="check" size={16}/></div>
                                <div>
                                    <div className="cd-reserved-title">Reservado a tu nombre</div>
                                    <div className="cd-reserved-sub">Muestra esta pantalla en el local. Stock reservado 30 min.</div>
                                </div>
                            </div>
                            <div className="cd-code">
                                <div className="cd-code-pattern">
                                    <div className="cd-code-id mono">GEOPS · {c.id.toUpperCase()} · 7K3X</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="cd-section cd-mt24">
                        <div className="eyebrow cd-section-eyebrow">Restricciones</div>
                        <div className="cd-restr-list">
                            {restrictions.map((r) => (
                                <div key={r} className="cd-restr-item">
                                    <div className="cd-restr-icon">
                                        <Icon name="close" size={9}/>
                                    </div>
                                    {r}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="cd-section pt16">
                        <button type="button" className="cd-tc-btn" onClick={() => setTcOpen(o => !o)}>
                            <span className="eyebrow">Términos y condiciones</span>
                            <Icon name={tcOpen ? "chevronDown" : "chevron"} size={14}/>
                        </button>
                        {tcOpen && (
                            <p className="cd-tc-text">{TNC}</p>
                        )}
                    </div>

                    <div className="cd-section">
                        <div className="cd-rev-head">
                            <div className="eyebrow">Reseñas</div>
                            <div className="cd-rev-rating">
                                <Icon name="star" size={13} filled/>
                                <strong>{stats?.averageRating ?? c.rating}</strong>
                                <span className="cd-rev-count">({stats?.totalReviews ?? c.reviews})</span>
                            </div>
                        </div>
                        {reviews.length === 0 ? (
                            <div className="cd-rev-empty">
                                Aún no hay reseñas. ¡Sé el primero en opinar!
                            </div>
                        ) : (
                            <div className="cd-rev-list">
                                {reviews.map((r) => (
                                    <div key={r.id} className="cd-rev-item">
                                        <div className="cd-rev-item-head">
                                            <div className="cd-rev-author">
                                                <div className="cd-rev-avatar">
                                                    {r.userUrl
                                                        ? <img src={r.userUrl} alt={r.userName} className="cd-rev-avatar-img"/>
                                                        : r.userName[0]}
                                                </div>
                                                <div>
                                                    <div className="cd-rev-name">{r.userName}</div>
                                                    <div className="cd-rev-date">{fmtReviewDate(r.createdAt)}</div>
                                                </div>
                                            </div>
                                            <div className="cd-rev-stars">
                                                {Array.from({ length: 5 }, (_, s) => (
                                                    <Icon key={s} name="star" size={11} filled={s < r.rating} style={{ color: s < r.rating ? "var(--warn)" : "var(--line-strong)" }}/>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="cd-rev-content">{r.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="cd-spacer16"/>
                </div>
            </div>

            <div className="cd-footer">
                {isReserved ? (
                    <button type="button" className="btn btn-primary btn-lg cd-footer-btn" onClick={onBack}>
                        Listo · ir al local <Icon name="walking" size={16}/>
                    </button>
                ) : (
                    <button type="button" className="btn btn-brand btn-lg cd-footer-btn" onClick={() => setShowPayment(true)}>
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

function fmtReviewDate(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}