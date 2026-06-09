/**
 * metricas de una campana
 */
export type AnalyticsCampaignStatus = "SCHEDULED" | "ACTIVE" | "PAUSED" | "EXPIRED";

export interface CampaignStats {
    viewsCount: number;
    uniqueViewsCount: number;
    reservationsCount: number;
    redemptionsCount: number;
    conversionRate: number;
}

export interface CampaignAnalytics {
    id: string;
    name: string;
    startDate: string;
    endDate?: string;
    status: AnalyticsCampaignStatus;
    analytics: CampaignStats;
}