import {useTranslation} from "react-i18next";
import {Icon} from "@/shared/ui/components/Icon.tsx";
import {Coupon} from "@/shared/types.ts";

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
                            {!hideBrand && <div className="cc-brand">{c.brand}</div>}
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