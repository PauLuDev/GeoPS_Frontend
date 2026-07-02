/*
 tipos del reporte que usan la vista del dashboard y la exportacion (pdf / csv / excel)
 los datos se arman con toReportSnapshot a partir de las metricas
*/

export interface ReportKpi {
    label: string;
    value: string;
    delta: string;
    trend: "up" | "down";
    spark: number[];
}

export interface ReportFunnelStep {
    label: string;
    value: number;
    pct: number;
}

export interface ReportTopCampaign {
    name: string;
    views: number;
    rate: string;
    stock: string;
}

export interface ReportHour {
    hour: string;
    reserved: number;
    redeemed: number;
}

export interface ReportMeta {
    businessName: string;
    period: string;
    range?: HourlyRange | "historic";
}

/* foto completa del reporte, lista para pintar o exportar */
export interface ReportSnapshot {
    meta: ReportMeta;
    kpis: ReportKpi[];
    funnel: ReportFunnelStep[];
    topCampaigns: ReportTopCampaign[];
    hourly: ReportHour[];
}

/* rangos del dashboard y a cuantos dias equivale cada uno */
export type HourlyRange = "today" | "7d" | "30d";

export const RANGE_TO_TIMEFRAME: Record<HourlyRange, 0 | 7 | 30> = {
    today: 0,
    "7d": 7,
    "30d": 30,
};

export function periodLabel(range: HourlyRange): string {
    if (range === "today") return "Hoy";
    if (range === "7d") return "Ultimos 7 dias";
    return "Ultimos 30 dias";
}