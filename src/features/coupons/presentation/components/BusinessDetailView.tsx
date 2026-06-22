import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Business, Coupon } from "@/shared/types.ts";
import { CouponCard } from "@/features/coupons/presentation/components/CouponCard.tsx";
import { ReviewsSection } from "@/features/comments/presentation/components/ReviewsSection.tsx";

function VerifiedBadge({ size = 15 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L14.3 6.46L19.07 4.93L17.54 9.7L22 12L17.54 14.3L19.07 19.07L14.3 17.54L12 22L9.7 17.54L4.93 19.07L6.46 14.3L2 12L6.46 9.7L4.93 4.93L9.7 6.46Z" fill="#16a34a" stroke="none"/>
            <polyline points="8.5 12.5 10.5 15 15.5 9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
    );
}

interface BusinessDetailViewProps {
    business: Business;
    coupons: Coupon[];
    reserved: Set<string>;
    onToggleSaved: (id: string) => void;
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

export function BusinessDetailView({ business, coupons, reserved, onToggleSaved, onBack, onViewCoupon, realDist, realWalk }: BusinessDetailViewProps) {
    const { t } = useTranslation();
    const now      = new Date();
    const todayIdx = jsToOurIdx(now.getDay());

    // calculo 
    const isOpenNow = (() => {
        const today = business.hours[todayIdx];
        if (!today || today.closed) return false;
        const cur   = now.getHours() * 60 + now.getMinutes();
        const open  = timeToMinutes(today.open);
        let   close = timeToMinutes(today.close);
        if (close < open) close += 24 * 60; // past midnight
        return cur >= open && cur < close;
    })();

    const catLabel = business.category || t("business.title");
    const catIcon  = "store";

    /* fotos del establecimiento (las que sube el dueño) para el carrusel */
    const photos = business.photos && business.photos.length > 0
        ? business.photos
        : (business.imageUrl ? [business.imageUrl] : []);
    const [slide, setSlide] = useState(0);

    /* carrusel automatico cuando hay mas de una foto */
    useEffect(() => {
        if (photos.length <= 1) return;
        const id = setInterval(() => setSlide(s => (s + 1) % photos.length), 3500);
        return () => clearInterval(id);
    }, [photos.length]);

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
                <button type="button" className="btn btn-icon btn-sm" onClick={onBack} title={t("common.back")} aria-label={t("common.back")}>
                    <Icon name="arrowLeft" size={16}/>
                </button>
                <span className="biz-detail-head-title">{t("business.title")}</span>
            </div>

            {/* scrollable body */}
            <div className="biz-detail-body">

                {/* hero -> carrusel automatico de fotos del establecimiento */}
                <div className="biz-hero">
                    {photos.map((src, i) => (
                        <img key={i} className={"biz-hero-img biz-hero-slide" + (i === slide ? " active" : "")}
                             src={src} alt={`${business.name} ${i + 1}`}/>
                    ))}
                    {photos.length > 1 && (
                        <div className="biz-hero-dots">
                            {photos.map((_, i) => (
                                <button type="button" key={i}
                                        className={"biz-hero-dot" + (i === slide ? " active" : "")}
                                        aria-label={`Foto ${i + 1}`} aria-current={i === slide}
                                        onClick={() => setSlide(i)}/>
                            ))}
                        </div>
                    )}
                    <div className="biz-hero-scrim"/>
                    <div className="biz-hero-content">
                        <div className="biz-hero-tags">
                            <span className="biz-cat">
                                <Icon name={catIcon} size={11}/>{catLabel}
                            </span>
                            <span className="biz-dot-sep">·</span>
                            <span className={`biz-status ${isOpenNow ? "biz-open" : "biz-closed"}`}>
                                <span className="biz-status-dot"/>
                                {isOpenNow ? t("business.open") : t("business.closed")}
                            </span>
                        </div>
                        <div className="biz-name-row">
                            <span className="biz-name">{business.name}</span>
                            {(business.verified ?? (business.ruc && business.ruc !== "No disponible")) && (
                                <span className="biz-verified-hero" title="Negocio premium verificado" aria-label="Verificado">
                                    <VerifiedBadge size={16}/>
                                </span>
                            )}
                        </div>
                        <div className="biz-rating">
                            <Icon name="star" size={11} filled/>
                            <span className="biz-rating-text">
                                {business.rating} <span className="biz-rating-reviews">({t("business.reviewsCount", { count: business.totalReviews })})</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* datos del establecimiento */}
                <div className="biz-section biz-section-top">
                    <div className="eyebrow biz-mb12">{t("business.data")}</div>
                    <div className="biz-info-list">

                        {/* RUC */}
                        <div className="biz-info-row">
                            <div className="biz-info-icon"><Icon name="shield" size={15}/></div>
                            <div className="biz-info-main">
                                <div className="eyebrow biz-info-eyebrow">{t("business.ruc")}</div>
                                <div className="biz-info-ruc">{business.ruc}</div>
                            </div>
                            {(business.verified ?? business.ruc !== "No disponible") && (
                                <span className="biz-verified">{t("business.verified")}</span>
                            )}
                        </div>

                        {/* direccion */}
                        <div className="biz-info-row">
                            <div className="biz-info-icon"><Icon name="location" size={15}/></div>
                            <div className="biz-info-main">
                                <div className="eyebrow biz-info-eyebrow">{t("business.address")}</div>
                                <div className="biz-info-value">{business.address}</div>
                                <div className="biz-info-sub">{business.district} · Lima</div>
                            </div>
                        </div>

                        {/* telefono */}
                        {business.phone && (
                            <div className="biz-info-row">
                                <div className="biz-info-icon"><Icon name="phone" size={15}/></div>
                                <div className="biz-info-main">
                                    <div className="eyebrow biz-info-eyebrow">{t("business.phone")}</div>
                                    <div className="biz-info-value">{business.phone}</div>
                                </div>
                                <button type="button" className="btn btn-sm biz-noshrink" onClick={handleCall}>
                                    {t("business.call")}
                                </button>
                            </div>
                        )}

                        {/* email */}
                        {business.email && (
                            <div className="biz-info-row">
                                <div className="biz-info-icon"><Icon name="mail" size={15}/></div>
                                <div className="biz-info-main">
                                    <div className="eyebrow biz-info-eyebrow">{t("business.email")}</div>
                                    <div className="biz-info-value biz-ellipsis">{business.email}</div>
                                </div>
                            </div>
                        )}

                        {/* sitio web */}
                        {business.website && (
                            <div className="biz-info-row">
                                <div className="biz-info-icon"><Icon name="globe" size={15}/></div>
                                <div className="biz-info-main">
                                    <div className="eyebrow biz-info-eyebrow">{t("business.website")}</div>
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
                                    <div className="eyebrow biz-info-eyebrow">{t("business.about")}</div>
                                    <p className="biz-about">{business.description}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* horario de atencion */}
                <div className="biz-section biz-section-divided">
                    <div className="eyebrow biz-mb14">{t("business.hours")}</div>
                    <table className="biz-hours-table">
                        <tbody>
                            {business.hours.map((h, i) => (
                                <tr key={h.day} className={i === todayIdx ? "today" : ""}>
                                    <td className="biz-hours-day">{h.day}</td>
                                    <td>
                                        {h.closed ? (
                                            <span className="biz-hours-chip biz-closed-chip">{t("business.closed")}</span>
                                        ) : (
                                            <span className="biz-hours-time">{h.open} – {h.close}</span>
                                        )}
                                    </td>
                                    {i === todayIdx && (
                                        <td className="biz-hours-now">
                                            <span className={`biz-hours-chip ${isOpenNow ? "biz-open-chip" : "biz-closed-chip"}`}>
                                                {isOpenNow ? t("business.openNow") : t("business.closedNow")}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ofertas agrupadas por campana -> cada campana es su propio bloque;
                    los cupones sin campana (o cuya campana no se reconocio) caen en "Ofertas activas" */}
                {coupons.length > 0 && (() => {
                    const byCampaign = new Map<string, { label: string; items: typeof coupons }>();
                    const general: typeof coupons = [];
                    coupons.forEach(c => {
                        if (c.campaignId && c.campaignName) {
                            if (!byCampaign.has(c.campaignId)) {
                                byCampaign.set(c.campaignId, { label: c.campaignName, items: [] });
                            }
                            byCampaign.get(c.campaignId)!.items.push(c);
                        } else {
                            general.push(c);
                        }
                    });

                    const groups: { key: string; label: string; items: typeof coupons }[] = [
                        ...Array.from(byCampaign.entries()).map(([key, g]) => ({ key, label: g.label, items: g.items })),
                    ];
                    if (general.length > 0) {
                        groups.push({ key: "__general__", label: t("business.activeOffers"), items: general });
                    }

                    return groups.map(group => (
                        <div key={group.key} className="biz-section biz-section-divided">
                            <div className="biz-offers-head">
                                <div className="eyebrow">{group.label}</div>
                                <span className="biz-offers-count">{t("business.couponsCount", { count: group.items.length })}</span>
                            </div>
                            <div className="biz-offers-list">
                                {group.items.map(c => (
                                    <CouponCard
                                        key={c.id}
                                        c={c}
                                        isReserved={reserved.has(c.id)}
                                        isSelected={false}
                                        onToggleSaved={() => onToggleSaved(c.id)}
                                        onClick={() => onViewCoupon?.(c)}
                                        hideBrand
                                        realDist={realDist?.(c)}
                                        realWalk={realWalk?.(c)}
                                    />
                                ))}
                            </div>
                        </div>
                    ));
                })()}

                {/* reseñas del establecimiento */}
                <div className="biz-section biz-section-divided">
                    <ReviewsSection
                        targetId={business.id}
                        targetType="business"
                        fallbackRating={business.rating}
                        fallbackCount={business.totalReviews}
                    />
                </div>

                <div className="biz-bottom-space"/>
            </div>

            {/* footer */}
            <div className="biz-footer">
                {business.phone && (
                    <button type="button" className="btn btn-lg biz-call-btn" onClick={handleCall}>
                        <Icon name="phone" size={16}/> {t("business.call")}
                    </button>
                )}
                <button type="button" className="btn btn-brand btn-lg biz-route-btn" onClick={handleRoute}>
                    <Icon name="location" size={16}/> {t("business.viewOnMaps")}
                </button>
            </div>
        </div>
    );
}