/**
 * read-models del dashboard del establecimiento
 * al ser una proyeccion de solo lectura, la forma del DTO de la API y el
 * read-model de dominio coinciden (el mapeo seria identidad), por eso no se
 * duplica una capa de DTO aparte
 */

export interface KpiValue {
    value: string;
    delta: string;
    trend: string;
    sparkline: number[];
}

export interface DashboardKpis {
    views: KpiValue;
    uniqueViews: KpiValue;
    reservations: KpiValue;
    conversionRate: KpiValue;
}

export interface PerformanceMetric {
    label: string;
    reserved: number;
    redeemed: number;
}

export interface FunnelStep {
    count: number;
    percentage: number;
}

export interface FunnelStats {
    views: FunnelStep;
    reservations: FunnelStep;
    redemptions: FunnelStep;
}

export interface HeatmapPoint {
    latitude: number;
    longitude: number;
    weight: number;
    campaignId: string;
}

export interface TopCampaign {
    id: string;
    name: string;
    views: number;
    conversionRate: number;
    stockUsed: number;
    stockTotal: number;
    colorHex: string;
}

export interface DashboardStats {
    kpis: DashboardKpis;
    performanceData: PerformanceMetric[];
    conversionFunnel: FunnelStats;
    heatmapPoints: HeatmapPoint[];
    topCampaigns: TopCampaign[];
}