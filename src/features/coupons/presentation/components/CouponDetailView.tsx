import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Icon} from "@/shared/ui/components/Icon.tsx";
import {Coupon} from "@/shared/types.ts";
import {reservationCode} from "@/shared/utils/reservationCode.ts";
import {PaymentModal} from "@/features/coupons/presentation/components/PaymentModal.tsx";
import {ReviewsSection} from "@/features/comments/presentation/components/ReviewsSection.tsx";

interface CouponDetailViewProps {
    c: Coupon;
    isReserved: boolean;
    onReserve: () => void;
    onBack: () => void;
    onViewBusiness?: () => void;
    realDist?: number;
    realWalk?: number;
}

export function CouponDetailView({ c, isReserved, onReserve, onBack, onViewBusiness, realDist, realWalk }: CouponDetailViewProps) {
    const { t } = useTranslation();
    const dist     = realDist ?? c.distance;
    const walk     = realWalk ?? c.walking;
    const distLabel = dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist} m`;
    const [showPayment, setShowPayment] = useState(false);
    const [copied, setCopied]    = useState(false);
    const [tcOpen, setTcOpen]    = useState(false);

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

    /* contenido por categoria desde i18n (con fallback a "food") */
    const restrictionsAll = t("couponContent.restrictions", { returnObjects: true }) as Record<string, string[]>;
    const scheduleAll     = t("couponContent.schedule", { returnObjects: true }) as Record<string, string>;
    const restrictions = restrictionsAll[c.category] ?? restrictionsAll.food;
    const schedule     = scheduleAll[c.category]     ?? scheduleAll.food;

    return (
        <div className="cd-root">
            <div className="cd-head">
                <button type="button" className="btn btn-icon btn-sm" onClick={onBack} title={t("common.back")} aria-label={t("common.back")}>
                    <Icon name="arrowLeft" size={16}/>
                </button>
                <span className="cd-head-title">{t("couponDetail.title")}</span>
                <button type="button" className={"btn btn-icon btn-sm cd-headbtn" + (copied ? " on" : "")} onClick={handleShare} title={t("couponDetail.copyLink")} aria-label={t("couponDetail.copyLink")}>
                    <Icon name={copied ? "check" : "share"} size={16}/>
                </button>
            </div>
            {copied && (
                <div className="cd-copied">
                    {t("couponDetail.linkCopied")}
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
                        <div className="cd-hero-vence-label">{t("couponDetail.expires")}</div>
                        <div className="cd-hero-vence">{c.expiresIn}</div>
                    </div>
                    {c.featured && (
                        <div className="cd-hero-feat">
                            <Icon name="flame" size={10}/> {t("couponDetail.featured")}
                        </div>
                    )}
                </div>

                <div className="cd-content">
                    <h2 className="cd-title">{c.title}</h2>
                    <div className="cd-meta-row">
                        <span className="cd-meta-item">
                            <Icon name="star" size={12} filled/> <strong>{c.rating}</strong> ({t("couponDetail.reviewsCount", { count: c.reviews })})
                        </span>
                        <span>·</span>
                        <span className="cd-meta-item"><Icon name="location" size={11}/>{c.address}</span>
                    </div>

                    <div className="cd-stats">
                        {[
                            { label: t("couponDetail.priceFinal"), value: `S/${c.finalPrice}`, sub: t("couponDetail.priceBefore", { price: c.originalPrice }) },
                            { label: t("couponDetail.distance"), value: distLabel, sub: t("couponDetail.walkMin", { min: walk }) },
                            { label: t("couponDetail.stock"), value: `${c.stock}`, sub: t("couponDetail.stockOf", { total: c.totalStock }) },
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
                        <div className="eyebrow cd-block-eyebrow">{t("couponDetail.aboutOffer")}</div>
                        <p className="cd-desc">{c.description}</p>
                    </div>

                    <div className="cd-sched">
                        <div className="cd-sched-icon">
                            <Icon name="clock" size={14}/>
                        </div>
                        <div>
                            <div className="cd-sched-title">{t("couponDetail.validSchedule")}</div>
                            <div className="cd-sched-text">{schedule}</div>
                        </div>
                    </div>

                    <div className="cd-actions">
                        <button type="button" className="btn btn-lg cd-action-btn" onClick={handleRoute}>
                            <Icon name="location" size={16}/> {t("couponDetail.route")}
                        </button>
                        <button type="button" className="btn btn-lg cd-action-btn" onClick={onViewBusiness}>
                            <Icon name="store" size={16}/> {t("couponDetail.viewBusiness")}
                        </button>
                    </div>

                    {isReserved && (
                        <div className="cd-reserved scale-in cd-mt16">
                            <div className="cd-reserved-row">
                                <div className="cd-check"><Icon name="check" size={16}/></div>
                                <div>
                                    <div className="cd-reserved-title">{t("couponDetail.reservedTitle")}</div>
                                    <div className="cd-reserved-sub">{t("couponDetail.reservedSub")}</div>
                                </div>
                            </div>
                            <div className="cd-code">
                                <div className="cd-code-pattern">
                                    <div className="cd-code-id mono">GEOPS · {c.id.toUpperCase()} · {reservationCode(c.id)}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="cd-section cd-mt24">
                        <div className="eyebrow cd-section-eyebrow">{t("couponDetail.restrictions")}</div>
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
                            <span className="eyebrow">{t("couponDetail.terms")}</span>
                            <Icon name={tcOpen ? "chevronDown" : "chevron"} size={14}/>
                        </button>
                        {tcOpen && (
                            <p className="cd-tc-text">{t("couponContent.tnc")}</p>
                        )}
                    </div>

                    <div className="cd-section">
                        <ReviewsSection
                            targetId={c.id}
                            targetType="campaign"
                            fallbackRating={c.rating}
                            fallbackCount={c.reviews}
                        />
                    </div>

                    <div className="cd-spacer16"/>
                </div>
            </div>

            <div className="cd-footer">
                {isReserved ? (
                    <button type="button" className="btn btn-primary btn-lg cd-footer-btn" onClick={onBack}>
                        {t("couponDetail.done")} <Icon name="walking" size={16}/>
                    </button>
                ) : (
                    <button type="button" className="btn btn-brand btn-lg cd-footer-btn" onClick={() => setShowPayment(true)}>
                        {c.finalPrice === 0 ? t("couponDetail.reserveFree") : t("couponDetail.reserve", { price: c.finalPrice })}
                        <Icon name="arrowRight" size={16}/>
                    </button>
                )}
            </div>

            {showPayment && (
                <PaymentModal coupon={c} onSuccess={onReserve} onClose={() => setShowPayment(false)}/>
            )}
        </div>
    );
}