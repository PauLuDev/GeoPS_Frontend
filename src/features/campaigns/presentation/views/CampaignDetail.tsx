import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Campaign } from "@/features/campaigns/domain/entities/Campaign.ts";
import { STATUS_COLOR, STATUS_BG, STATUS_LABEL } from "@/features/campaigns/domain/value-objects/CampaignStatus.ts";
import { ratePct, redemptionRate, bestCouponId } from "@/features/campaigns/domain/value-objects/Performance.ts";
import { promotionLabel } from "@/features/campaigns/domain/value-objects/PromotionType.ts";
import { useCampaignAnalytics } from "@/features/analytics/presentation/hooks/useCampaignAnalytics.ts";

interface CampaignDetailProps {
    campaign: Campaign;
    onBack: () => void;
}

export function CampaignDetail({ campaign: c, onBack }: CampaignDetailProps) {
    const { data: analytics, loading: analyticsLoading } = useCampaignAnalytics(c.uuid);
    const a = analytics?.analytics;

    const views      = a?.viewsCount      ?? c.views;
    const reserved   = a?.reservationsCount ?? c.reserved;
    const redeemed   = a?.redemptionsCount ?? c.redeemed;

    const bestId = bestCouponId(c.coupons);
    const best = c.coupons.find(cp => cp.id === bestId) ?? null;

    /* cupones ordenados por tasa de canje (mejor primero) */
    const ranked = [...c.coupons].sort(
        (a, b) => redemptionRate(b.views, b.redeemed) - redemptionRate(a.views, a.redeemed)
    );

    const fmt = (n: number) => analyticsLoading ? "—" : n.toLocaleString("es-PE");
    const kpis = [
        { label: "Cupones vistos", value: fmt(views) },
        { label: "Reservados",     value: fmt(reserved) },
        { label: "Redimidos",      value: fmt(redeemed) },
        { label: "Tasa de canje",  value: analyticsLoading ? "—" : ratePct(views, redeemed), highlight: true },
    ];

    return (
        <div className="md cd-detail">
            <header className="md-head">
                <div>
                    <button type="button" className="btn btn-sm back-btn" onClick={onBack}>
                        <Icon name="arrowLeft" size={14}/> Volver a campañas
                    </button>
                    <h1 className="page-title cd-detail-title">
                        {c.name}
                        <span className="badge" style={{ background: STATUS_BG[c.status], color: STATUS_COLOR[c.status] }}>
                            {c.status === "live" && <span className="status-dot"/>}
                            {STATUS_LABEL[c.status]}
                        </span>
                    </h1>
                    <p className="page-subtitle">
                        {c.category} · #GEO-{(1000 + c.id).toString()} · {c.coupons.length} cupón{c.coupons.length !== 1 ? "es" : ""}
                    </p>
                </div>
            </header>

            {/* rendimiento global de la campana */}
            <section className="cd-kpis">
                {kpis.map(k => (
                    <div key={k.label} className={"card cd-kpi" + (k.highlight ? " cd-kpi-hl" : "")}>
                        <div className="eyebrow">{k.label}</div>
                        <div className="mono tnum cd-kpi-value">{k.value}</div>
                    </div>
                ))}
            </section>

            {/* mejor cupon destacado automaticamente */}
            {best && (
                <div className="cd-best card">
                    <div className="cd-best-badge"><Icon name="star" size={14}/> Mejor cupón</div>
                    <div className="cd-best-main">
                        <div className="cd-best-name">{best.title}</div>
                        <div className="cd-best-sub">
                            Lidera con <strong>{ratePct(best.views, best.redeemed)}</strong> de canje
                            ({best.redeemed.toLocaleString("es-PE")} de {best.views.toLocaleString("es-PE")} vistos).
                            Considera replicar su estrategia.
                        </div>
                    </div>
                </div>
            )}

            {/* desglose por cupon */}
            <div className="card cd-table-card">
                <div className="eyebrow cd-table-eyebrow">Desglose por cupón</div>
                {ranked.length === 0 ? (
                    <div className="cl-empty">
                        <div className="cl-empty-icon"><Icon name="ticket" size={32}/></div>
                        <div className="cl-empty-title">Esta campaña aún no tiene cupones</div>
                    </div>
                ) : (
                    <div className="cd-table">
                        <div className="cd-thead">
                            <div>Cupón</div><div>Tipo</div><div>Vistos</div>
                            <div>Reservados</div><div>Redimidos</div><div>Canje</div>
                        </div>
                        {ranked.map(cp => {
                            const rate = redemptionRate(cp.views, cp.redeemed);
                            const isBest = cp.id === bestId;
                            return (
                                <div key={cp.id} className={"cd-trow" + (isBest ? " cd-trow-best" : "")}>
                                    <div className="cd-coupon-cell">
                                        {isBest && <Icon name="star" size={13}/>}
                                        <span className="cd-coupon-name">{cp.title}</span>
                                    </div>
                                    <div><span className="cd-cat-tag">{promotionLabel(cp.promotionType)}</span></div>
                                    <div className="mono tnum">{cp.views.toLocaleString("es-PE")}</div>
                                    <div className="mono tnum">{cp.reserved.toLocaleString("es-PE")}</div>
                                    <div className="mono tnum">{cp.redeemed.toLocaleString("es-PE")}</div>
                                    <div className="cd-rate-cell">
                                        <span className="mono cd-rate-val">{ratePct(cp.views, cp.redeemed)}</span>
                                        <div className="cd-rate-bar">
                                            <div className="cd-rate-fill" style={{ width: `${Math.min(rate * 100 * 3, 100)}%` }}/>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}