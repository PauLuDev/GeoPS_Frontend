import {useTranslation} from "react-i18next";
import {Icon} from "@/shared/ui/components/Icon.tsx";
import {Coupon} from "@/shared/types.ts";

function VerifiedBadge({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L14.3 6.46L19.07 4.93L17.54 9.7L22 12L17.54 14.3L19.07 19.07L14.3 17.54L12 22L9.7 17.54L4.93 19.07L6.46 14.3L2 12L6.46 9.7L4.93 4.93L9.7 6.46Z" fill="#16a34a" stroke="none"/>
            <polyline points="8.5 12.5 10.5 15 15.5 9.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
    );
}

interface CouponCardProps {
    c: Coupon;
    isReserved: boolean;
    onToggleSaved?: () => void;
    onClick: () => void;
    isSelected: boolean;
    hideBrand?: boolean;
    realDist?: number;
    realWalk?: number;
}

export function CouponCard({ c, isReserved, onClick, isSelected, hideBrand = false, realDist, realWalk }: CouponCardProps) {
    const { t } = useTranslation();
    const dist = realDist ?? c.distance;
    const walk = realWalk ?? c.walking;
    const distLabel = dist >= 1000 ? `${(dist/1000).toFixed(1)}km` : `${dist}m`;
    return (
        <div className="coupon-card-wrap">
            <button type="button" className={"coupon-card" + (isSelected ? " selected" : "")} onClick={onClick}
                    aria-label={t("coupon.viewAria", { title: c.title })}>
                <div className={"cc-thumb" + (c.imageUrl ? " has-img" : "") + (c.featured ? " featured" : "")}
                     style={c.imageUrl ? { backgroundImage: `url(${c.imageUrl})` } : undefined}>
                    <span className="cc-discount">−{c.discount}</span>
                    {c.featured && <span className="cc-feat"><Icon name="flame" size={10}/> {t("coupon.top")}</span>}
                </div>
                <div className="cc-body">
                    <div className="cc-head">
                        <div className="cc-titles">
                            {!hideBrand && (
                                <div className="cc-brand-row">
                                    <span className="cc-brand">{c.brand}</span>
                                    {c.verified && (
                                        <span className="cc-verified" title="Negocio premium verificado" aria-label="Verificado">
                                            <VerifiedBadge size={13}/>
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="cc-title">{c.title}</div>
                        </div>
                    </div>
                    <div className="cc-meta">
                        <span className="cc-meta-item mono">
                            <Icon name="walking" size={11}/> {walk}min · {distLabel}
                        </span>
                        <span className="cc-meta-item mono">
                            <Icon name="clock" size={11}/> {c.expiresIn}
                        </span>
                        {isReserved && <span className="badge badge-ink cc-reserved"><Icon name="check" size={9}/> {t("coupon.reserved")}</span>}
                    </div>
                    <div className="stock-bar">
                        <div className="stock-fill" style={{ width: `${(c.stock / c.totalStock) * 100}%` }}/>
                    </div>
                    <div className="cc-stock-text">
                        {t("coupon.stockAvailable", { stock: c.stock, total: c.totalStock })}
                    </div>
                </div>
            </button>
        </div>
    );
}