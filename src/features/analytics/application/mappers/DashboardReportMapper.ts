import { DashboardStats, KpiValue } from "../../domain/value-objects/DashboardStats.ts";
import {
    ReportSnapshot, ReportKpi, HourlyRange, periodLabel,
} from "../../domain/value-objects/reportData.ts";

/* deja la tendencia en el formato que usa la ui */
function trendOf(k: KpiValue): "up" | "down" {
    return k.trend === "down" ? "down" : "up";
}

function toKpi(label: string, k: KpiValue): ReportKpi {
    /* sin datos (valor 0/0%) el delta del back sale "-100%" y se ve alarmante;
       lo ocultamos para que el dashboard vacio no parezca roto */
    const isZero = !k.value || /^0([.,]0+)?\s*%?$/.test(k.value.trim());
    return { label, value: k.value, delta: isZero ? "" : k.delta, trend: isZero ? "up" : trendOf(k), spark: k.sparkline };
}

/* arma la foto del reporte que usan la vista y la exportacion */
export function toReportSnapshot(stats: DashboardStats, businessName: string, range: HourlyRange): ReportSnapshot {
    const { kpis, conversionFunnel: f, topCampaigns, performanceData } = stats;

    /* el ancho/porcentaje de cada paso del funnel se calcula relativo al paso
       mas grande -> las barras quedan proporcionales y coherentes, incluso si
       todavia no se registran vistas (no se "invierten") */
    const maxStep = Math.max(f.views.count, f.reservations.count, f.redemptions.count, 1);
    const stepPct = (n: number) => Math.round((n / maxStep) * 100);

    /* sparkline de redimidos a partir del detalle por hora/dia */
    const redeemedSpark = performanceData.map(p => p.redeemed);

    return {
        meta: { businessName, period: periodLabel(range) },
        kpis: [
            /* cupones vistos = "Abrieron el cupon" (ver el detalle del cupon) */
            { ...toKpi("Cupones vistos", kpis.views), value: String(f.views.count) },
            /* redimidos = "Canjearon en el local" (mismo dato del funnel) */
            {
                label: "Redimidos",
                value: String(f.redemptions.count),
                delta: "",
                trend: "up",
                spark: redeemedSpark.length ? redeemedSpark : [0, 0],
            },
            toKpi("Reservados", kpis.reservations),
            toKpi("Tasa conversion", kpis.conversionRate),
        ],
        funnel: [
            { label: "Abrieron el cupon", value: f.views.count, pct: stepPct(f.views.count) },
            { label: "Reservaron", value: f.reservations.count, pct: stepPct(f.reservations.count) },
            { label: "Canjearon en el local", value: f.redemptions.count, pct: stepPct(f.redemptions.count) },
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