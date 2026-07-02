import type { TFunction } from "i18next";
import { DashboardStats, KpiValue } from "../../domain/value-objects/DashboardStats.ts";
import {
    ReportSnapshot, ReportKpi, HourlyRange,
} from "../../domain/value-objects/reportData.ts";

/* deja la tendencia en el formato que usa la ui */
function trendOf(k: KpiValue): "up" | "down" {
    return k.trend === "down" ? "down" : "up";
}

function toKpi(labelKey: string, k: KpiValue): ReportKpi {
    /* sin datos (valor 0/0%) el delta del back sale "-100%" y se ve alarmante;
       lo ocultamos para que el dashboard vacio no parezca roto */
    const isZero = !k.value || /^0([.,]0+)?\s*%?$/.test(k.value.trim());
    return { label: labelKey, value: k.value, delta: isZero ? "" : k.delta, trend: isZero ? "up" : trendOf(k), spark: k.sparkline };
}

/* arma la foto del reporte que usan la vista y la exportacion */
export function toReportSnapshot(
    stats: DashboardStats,
    businessName: string,
    range: HourlyRange,
    t: TFunction<"translation", undefined>,
): ReportSnapshot {
    const { kpis, conversionFunnel: f, topCampaigns, performanceData } = stats;

    /* el ancho/porcentaje de cada paso del funnel se calcula relativo al paso
       mas grande -> las barras quedan proporcionales y coherentes, incluso si
       todavia no se registran vistas (no se "invierten") */
    const maxStep = Math.max(f.views.count, f.reservations.count, f.redemptions.count, 1);
    const stepPct = (n: number) => Math.round((n / maxStep) * 100);

    /* sparkline de redimidos a partir del detalle por hora/dia */
    const redeemedSpark = performanceData.map(p => p.redeemed);

    return {
        meta: { businessName, period: t(`dashboard.range.${range}`), range },
        kpis: [
            /* cupones vistos = "Abrieron el cupon" (ver el detalle del cupon) */
            { ...toKpi(t("dashboard.kpi.views"), kpis.views), value: String(f.views.count) },
            /* redimidos = "Canjearon en el local" (mismo dato del funnel) */
            {
                label: t("dashboard.kpi.redeemed"),
                value: String(f.redemptions.count),
                delta: "",
                trend: "up",
                spark: redeemedSpark.length ? redeemedSpark : [0, 0],
            },
            toKpi(t("dashboard.kpi.reserved"), kpis.reservations),
            toKpi(t("dashboard.kpi.conversion"), kpis.conversionRate),
        ],
        funnel: [
            { label: t("dashboard.funnel.views"), value: f.views.count, pct: stepPct(f.views.count) },
            { label: t("dashboard.funnel.reserved"), value: f.reservations.count, pct: stepPct(f.reservations.count) },
            { label: t("dashboard.funnel.redeemed"), value: f.redemptions.count, pct: stepPct(f.redemptions.count) },
        ],
        topCampaigns: topCampaigns.map(c => ({
            name: c.name,
            views: c.views,
            rate: `${Math.round(c.conversionRate)}%`,
            stock: `${c.stockUsed}/${c.stockTotal}`,
        })),
        hourly: performanceData.map(p => ({ hour: p.label, reserved: p.reserved, redeemed: p.redeemed })),
    };
}