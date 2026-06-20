import { DashboardStats, KpiValue } from "../../domain/value-objects/DashboardStats.ts";
import {
    ReportSnapshot, ReportKpi, HourlyRange, periodLabel,
} from "../../domain/value-objects/reportData.ts";

/* deja la tendencia en el formato que usa la ui */
function trendOf(k: KpiValue): "up" | "down" {
    return k.trend === "down" ? "down" : "up";
}

function toKpi(label: string, k: KpiValue): ReportKpi {
    return { label, value: k.value, delta: k.delta, trend: trendOf(k), spark: k.sparkline };
}

/* arma la foto del reporte que usan la vista y la exportacion */
export function toReportSnapshot(stats: DashboardStats, businessName: string, range: HourlyRange): ReportSnapshot {
    const { kpis, conversionFunnel: f, topCampaigns, performanceData } = stats;

    return {
        meta: { businessName, period: periodLabel(range) },
        kpis: [
            toKpi("Cupones vistos", kpis.views),
            toKpi("Vistas unicas", kpis.uniqueViews),
            toKpi("Reservados", kpis.reservations),
            toKpi("Tasa conversion", kpis.conversionRate),
        ],
        funnel: [
            { label: "Abrieron el cupon", value: f.views.count, pct: f.views.percentage },
            { label: "Reservaron", value: f.reservations.count, pct: f.reservations.percentage },
            { label: "Canjearon en el local", value: f.redemptions.count, pct: f.redemptions.percentage },
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