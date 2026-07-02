import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Campaign } from "@/features/campaigns/domain/entities/Campaign.ts";
import { STATUS_COLOR, STATUS_BG, STATUS_LABEL } from "@/features/campaigns/domain/value-objects/CampaignStatus.ts";
import { ratePct, redemptionRate, bestCouponId } from "@/features/campaigns/domain/value-objects/Performance.ts";
import { promotionLabel } from "@/features/campaigns/domain/value-objects/PromotionType.ts";
import { useCampaignAnalytics } from "@/features/analytics/presentation/hooks/useCampaignAnalytics.ts";
import { useCouponMetrics } from "@/features/analytics/presentation/hooks/useCouponMetrics.ts";
import { CouponAnalytics } from "@/features/analytics/domain/entities/CouponAnalytics.ts";

interface CampaignDetailProps {
    campaign: Campaign;
    onBack: () => void;
}

export function CampaignDetail({ campaign: c, onBack }: CampaignDetailProps) {
    const { t } = useTranslation();
    const { data: analytics, loading: analyticsLoading } = useCampaignAnalytics(c.uuid);
    const a = analytics?.analytics;

    const views      = a?.viewsCount      ?? c.views;
    const reserved   = a?.reservationsCount ?? c.reserved;
    const redeemed   = a?.redemptionsCount ?? c.redeemed;

    /* metricas reales de cada cupon desde analytics */
    const { metrics: couponMetrics, loading: couponMetricsLoading } = useCouponMetrics(c.establishmentId);
    const metricsByCoupon = useMemo(() => {
        const map = new Map<string, CouponAnalytics>();
        couponMetrics.forEach(m => map.set(m.couponId, m));
        return map;
    }, [couponMetrics]);
    const getCouponMetrics = (cp: typeof c.coupons[0]) => metricsByCoupon.get(cp.uuid ?? cp.id) ?? null;

    const bestId = bestCouponId(c.coupons);
    const best = c.coupons.find(cp => cp.id === bestId) ?? null;

    /* cupones ordenados por tasa de canje real (mejor primero) */
    const ranked = [...c.coupons].sort((a, b) => {
        const ma = getCouponMetrics(a);
        const mb = getCouponMetrics(b);
        return redemptionRate(mb?.viewsCount ?? b.views, mb?.redemptionsCount ?? b.redeemed)
             - redemptionRate(ma?.viewsCount ?? a.views, ma?.redemptionsCount ?? a.redeemed);
    });

    const fmt = (n: number) => analyticsLoading ? "—" : n.toLocaleString("es-PE");
    const kpis = [
        { label: t("campaignDetail.kpi.views"), value: fmt(views) },
        { label: t("campaignDetail.kpi.reserved"), value: fmt(reserved) },
        { label: t("campaignDetail.kpi.redeemed"), value: fmt(redeemed) },
        { label: t("campaignDetail.kpi.conversion"), value: analyticsLoading ? "—" : ratePct(views, redeemed), highlight: true },
    ];

    return (
        <div className="md cd-detail">
            <header className="md-head">
                <div>
                    <button type="button" className="btn btn-sm back-btn" onClick={onBack}>
                        <Icon name="arrowLeft" size={14}/> {t("campaignDetail.back")}
                    </button>
                    <h1 className="page-title cd-detail-title">
                        {c.name}
                        <span className="badge" style={{ background: STATUS_BG[c.status], color: STATUS_COLOR[c.status] }}>
                            {c.status === "live" && <span className="status-dot"/>}
                            {STATUS_LABEL[c.status]}
                        </span>
                    </h1>
                    <p className="page-subtitle">
                        {c.category} · #GEO-{(1000 + c.id).toString()} · {t("campaignDetail.couponsCount", {
                            count: c.coupons.length,
                            label: c.coupons.length === 1 ? t("campaigns.coupon") : t("campaigns.coupons"),
                        })}
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
                    <div className="cd-best-badge"><Icon name="star" size={14}/> {t("campaignDetail.bestCoupon")}</div>
                    <div className="cd-best-main">
                        <div className="cd-best-name">{best.title}</div>
                        <div className="cd-best-sub">
                            {t("campaignDetail.bestCouponText", {
                                rate: ratePct(best.views, best.redeemed),
                                redeemed: best.redeemed.toLocaleString("es-PE"),
                                views: best.views.toLocaleString("es-PE"),
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* desglose por cupon */}
            <div className="card cd-table-card">
                <div className="eyebrow cd-table-eyebrow">{t("campaignDetail.breakdownTitle")}</div>
                {ranked.length === 0 ? (
                    <div className="cl-empty">
                        <div className="cl-empty-icon"><Icon name="ticket" size={32}/></div>
                        <div className="cl-empty-title">{t("campaignDetail.noCoupons")}</div>
                    </div>
                ) : (
                    <div className="cd-table">
                        <div className="cd-thead">
                            <div>{t("campaignDetail.table.coupon")}</div>
                            <div>{t("campaignDetail.table.type")}</div>
                            <div>{t("campaignDetail.table.views")}</div>
                            <div>{t("campaignDetail.table.reserved")}</div>
                            <div>{t("campaignDetail.table.redeemed")}</div>
                            <div>{t("campaignDetail.table.conversion")}</div>
                        </div>
                        {ranked.map(cp => {
                            const m = getCouponMetrics(cp);
                            const cpViews = m?.viewsCount ?? cp.views;
                            const cpReserved = m?.reservationsCount ?? cp.reserved;
                            const cpRedeemed = m?.redemptionsCount ?? cp.redeemed;
                            const rate = redemptionRate(cpViews, cpRedeemed);
                            const isBest = cp.id === bestId;
                            const fmt = (n: number) => couponMetricsLoading ? "—" : n.toLocaleString("es-PE");
                            return (
                                <div key={cp.id} className={"cd-trow" + (isBest ? " cd-trow-best" : "")}>
                                    <div className="cd-coupon-cell">
                                        {isBest && <Icon name="star" size={13}/>}
                                        <span className="cd-coupon-name">{cp.title}</span>
                                    </div>
                                    <div><span className="cd-cat-tag">{promotionLabel(cp.promotionType, t)}</span></div>
                                    <div className="mono tnum">{fmt(cpViews)}</div>
                                    <div className="mono tnum">{fmt(cpReserved)}</div>
                                    <div className="mono tnum">{fmt(cpRedeemed)}</div>
                                    <div className="cd-rate-cell">
                                        <span className="mono cd-rate-val">{couponMetricsLoading ? "—" : ratePct(cpViews, cpRedeemed)}</span>
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