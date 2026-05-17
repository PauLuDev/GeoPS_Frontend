import {Icon} from "@/app/ui/components/Icon.tsx";
import {Coupon} from "@/app/core/common/mockData.ts";

interface CouponCardProps {
    c: Coupon;
    isFav: boolean;
    isReserved: boolean;
    onToggleFav: () => void;
    onClick: () => void;
    isSelected: boolean;
    realDist?: number;
    realWalk?: number;
}

export function CouponCard({ c, isFav, isReserved, onToggleFav, onClick, isSelected, realDist, realWalk }: CouponCardProps) {
    const dist = realDist ?? c.distance;
    const walk = realWalk ?? c.walking;
    const distLabel = dist >= 1000 ? `${(dist/1000).toFixed(1)}km` : `${dist}m`;
    return (
        <div className={"coupon-card" + (isSelected ? " selected" : "")} onClick={onClick}>
            <div className={"cc-thumb" + (c.imageUrl ? " has-img" : "")} style={{
                backgroundImage: c.imageUrl
                    ? `url(${c.imageUrl})`
                    : `linear-gradient(135deg, color-mix(in oklab, var(--brand) ${c.featured ? 70 : 30}%, var(--bg-sunken)) 0%, color-mix(in oklab, var(--accent-2) ${c.featured ? 30 : 10}%, var(--bg-sunken)) 100%)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}>
                <span className="cc-discount">−{c.discount}</span>
                {c.featured && <span className="cc-feat"><Icon name="flame" size={10}/> Top</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{c.brand}</div>
                        <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                    </div>
                    <button style={{ appearance: "none", border: 0, background: "transparent", padding: 4, cursor: "pointer", color: isFav ? "var(--brand-strong)" : "var(--ink-3)" }}
                            onClick={e => { e.stopPropagation(); onToggleFav(); }}>
                        <Icon name="bookmark" size={16} filled={isFav}/>
                    </button>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8, fontSize: 11, color: "var(--ink-3)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }} className="mono">
            <Icon name="walking" size={11}/> {walk}min · {distLabel}
          </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }} className="mono">
            <Icon name="clock" size={11}/> {c.expiresIn}
          </span>
                    {isReserved && <span className="badge badge-ink" style={{ fontSize: 9 }}><Icon name="check" size={9}/> Reservado</span>}
                </div>
                <div className="stock-bar">
                    <div className="stock-fill" style={{ width: `${(c.stock / c.totalStock) * 100}%` }}/>
                </div>
                <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                    {c.stock} / {c.totalStock} disponibles
                </div>
            </div>
        </div>
    );
}