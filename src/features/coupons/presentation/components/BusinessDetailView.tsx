import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Business, Coupon } from "@/shared/types.ts";
import { CATEGORIES } from "@/shared/constants.ts";
import { CouponCard } from "@/features/coupons/presentation/components/CouponCard.tsx";
import { ReviewsSection } from "@/features/comments/presentation/components/ReviewsSection.tsx";

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

    const catLabel = t(`cat.${business.category}`);
    const catIcon  = CATEGORIES.find(c => c.id === business.category)?.icon  ?? "store";

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
                        <div className="biz-name">{business.name}</div>
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
                            {business.ruc !== "No disponible" && (
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

                {/* ofertas activas */}
                {coupons.length > 0 && (
                    <div className="biz-section biz-section-divided">
                        <div className="biz-offers-head">
                            <div className="eyebrow">{t("business.activeOffers")}</div>
                            <span className="biz-offers-count">{t("business.couponsCount", { count: coupons.length })}</span>
                        </div>
                        <div className="biz-offers-list">
                            {coupons.map(c => (
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
                )}

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