import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Business, Coupon } from "@/shared/types.ts";
import { CATEGORIES } from "@/shared/constants.ts";
import { CouponCard } from "@/features/coupons/presentation/components/CouponCard.tsx";

interface BusinessDetailViewProps {
    business: Business;
    coupons: Coupon[];
    favorites: Set<string>;
    reserved: Set<string>;
    onToggleFav: (id: string) => void;
    onBack: () => void;
    onViewCoupon?: (c: Coupon) => void;
    realDist?: (c: Coupon) => number;
    realWalk?: (c: Coupon) => number;
}

function timeToMinutes(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
}

function jsToOurIdx(jsDay: number) { return jsDay === 0 ? 6 : jsDay - 1; }

export function BusinessDetailView({ business, coupons, favorites, reserved, onToggleFav, onBack, onViewCoupon, realDist, realWalk }: BusinessDetailViewProps) {
    const now      = new Date();
    const todayIdx = jsToOurIdx(now.getDay());

    // calculo barato, no necesita useMemo (depende de la hora actual)
    const isOpenNow = (() => {
        const today = business.hours[todayIdx];
        if (!today || today.closed) return false;
        const cur   = now.getHours() * 60 + now.getMinutes();
        const open  = timeToMinutes(today.open);
        let   close = timeToMinutes(today.close);
        if (close < open) close += 24 * 60; // past midnight
        return cur >= open && cur < close;
    })();

    const catLabel = CATEGORIES.find(c => c.id === business.category)?.label ?? business.category;
    const catIcon  = CATEGORIES.find(c => c.id === business.category)?.icon  ?? "store";

    const handleRoute = () => {
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}&destination_place_id=${encodeURIComponent(business.address)}`,
            "_blank"
        );
    };

    const handleCall = () => {
        if (business.phone) window.open(`tel:${business.phone.replace(/\s/g, "")}`);
    };

    return (
        <div className="biz-detail">

            {/* header */}
            <div className="biz-detail-head">
                <button type="button" className="btn btn-icon btn-sm" onClick={onBack} title="Volver" aria-label="Volver">
                    <Icon name="arrowLeft" size={16}/>
                </button>
                <span className="biz-detail-head-title">Establecimiento</span>
            </div>

            {/* scrollable body */}
            <div className="biz-detail-body">

                {/* hero */}
                <div className="biz-hero">
                    {business.imageUrl && <img className="biz-hero-img" src={business.imageUrl} alt={business.name}/>}
                    <div className="biz-hero-scrim"/>
                    <div className="biz-hero-content">
                        <div className="biz-hero-tags">
                            <span className="biz-cat">
                                <Icon name={catIcon} size={11}/>{catLabel}
                            </span>
                            <span className="biz-dot-sep">·</span>
                            <span className={`biz-status ${isOpenNow ? "biz-open" : "biz-closed"}`}>
                                <span className="biz-status-dot"/>
                                {isOpenNow ? "Abierto" : "Cerrado"}
                            </span>
                        </div>
                        <div className="biz-name">{business.name}</div>
                        <div className="biz-rating">
                            <Icon name="star" size={11} filled/>
                            <span className="biz-rating-text">
                                {business.rating} <span className="biz-rating-reviews">({business.totalReviews} reseñas)</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* datos del establecimiento */}
                <div className="biz-section biz-section-top">
                    <div className="eyebrow biz-mb12">Datos del establecimiento</div>
                    <div className="biz-info-list">

                        {/* RUC */}
                        <div className="biz-info-row">
                            <div className="biz-info-icon"><Icon name="shield" size={15}/></div>
                            <div className="biz-info-main">
                                <div className="eyebrow biz-info-eyebrow">RUC</div>
                                <div className="biz-info-ruc">{business.ruc}</div>
                            </div>
                            {business.ruc !== "No disponible" && (
                                <span className="biz-verified">Verificado</span>
                            )}
                        </div>

                        {/* direccion */}
                        <div className="biz-info-row">
                            <div className="biz-info-icon"><Icon name="location" size={15}/></div>
                            <div className="biz-info-main">
                                <div className="eyebrow biz-info-eyebrow">Dirección</div>
                                <div className="biz-info-value">{business.address}</div>
                                <div className="biz-info-sub">{business.district} · Lima</div>
                            </div>
                        </div>

                        {/* telefono */}
                        {business.phone && (
                            <div className="biz-info-row">
                                <div className="biz-info-icon"><Icon name="phone" size={15}/></div>
                                <div className="biz-info-main">
                                    <div className="eyebrow biz-info-eyebrow">Teléfono</div>
                                    <div className="biz-info-value">{business.phone}</div>
                                </div>
                                <button type="button" className="btn btn-sm biz-noshrink" onClick={handleCall}>
                                    Llamar
                                </button>
                            </div>
                        )}

                        {/* email */}
                        {business.email && (
                            <div className="biz-info-row">
                                <div className="biz-info-icon"><Icon name="mail" size={15}/></div>
                                <div className="biz-info-main">
                                    <div className="eyebrow biz-info-eyebrow">Correo</div>
                                    <div className="biz-info-value biz-ellipsis">{business.email}</div>
                                </div>
                            </div>
                        )}

                        {/* sitio web */}
                        {business.website && (
                            <div className="biz-info-row">
                                <div className="biz-info-icon"><Icon name="globe" size={15}/></div>
                                <div className="biz-info-main">
                                    <div className="eyebrow biz-info-eyebrow">Sitio web</div>
                                    <a href={`https://${business.website}`} target="_blank" rel="noreferrer" className="biz-web-link">
                                        {business.website} <Icon name="arrow_up_right" size={11}/>
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* descripcion */}
                        {business.description && (
                            <div className="biz-info-row">
                                <div className="biz-info-icon"><Icon name="flag" size={15}/></div>
                                <div className="biz-info-main">
                                    <div className="eyebrow biz-info-eyebrow">Sobre el local</div>
                                    <p className="biz-about">{business.description}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* horario de atencion */}
                <div className="biz-section biz-section-divided">
                    <div className="eyebrow biz-mb14">Horario de atención</div>
                    <table className="biz-hours-table">
                        <tbody>
                            {business.hours.map((h, i) => (
                                <tr key={h.day} className={i === todayIdx ? "today" : ""}>
                                    <td className="biz-hours-day">{h.day}</td>
                                    <td>
                                        {h.closed ? (
                                            <span className="biz-hours-chip biz-closed-chip">Cerrado</span>
                                        ) : (
                                            <span className="biz-hours-time">{h.open} – {h.close}</span>
                                        )}
                                    </td>
                                    {i === todayIdx && (
                                        <td className="biz-hours-now">
                                            <span className={`biz-hours-chip ${isOpenNow ? "biz-open-chip" : "biz-closed-chip"}`}>
                                                {isOpenNow ? "Abierto ahora" : "Cerrado ahora"}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ofertas activas */}
                {coupons.length > 0 && (
                    <div className="biz-section biz-section-divided">
                        <div className="biz-offers-head">
                            <div className="eyebrow">Ofertas activas</div>
                            <span className="biz-offers-count">{coupons.length} {coupons.length !== 1 ? "cupones" : "cupón"}</span>
                        </div>
                        <div className="biz-offers-list">
                            {coupons.map(c => (
                                <CouponCard
                                    key={c.id}
                                    c={c}
                                    isFav={favorites.has(c.id)}
                                    isReserved={reserved.has(c.id)}
                                    isSelected={false}
                                    onToggleFav={() => onToggleFav(c.id)}
                                    onClick={() => onViewCoupon?.(c)}
                                    hideBrand
                                    realDist={realDist?.(c)}
                                    realWalk={realWalk?.(c)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="biz-bottom-space"/>
            </div>

            {/* footer */}
            <div className="biz-footer">
                {business.phone && (
                    <button type="button" className="btn btn-lg biz-call-btn" onClick={handleCall}>
                        <Icon name="phone" size={16}/> Llamar
                    </button>
                )}
                <button type="button" className="btn btn-brand btn-lg biz-route-btn" onClick={handleRoute}>
                    <Icon name="map" size={16}/> Ver en Google Maps
                </button>
            </div>
        </div>
    );
}