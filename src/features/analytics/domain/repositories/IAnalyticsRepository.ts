import { DashboardStats } from "../value-objects/DashboardStats.ts";
import { CampaignAnalytics, AnalyticsCampaignStatus } from "../entities/CampaignAnalytics.ts";

/* ventanas de tiempo soportadas por el dashboard (dias) */
export type Timeframe = 0 | 7 | 30;   // 0 = Hoy

/**
 * puerto (interface) del repositorio de analytics
 */
export interface IAnalyticsRepository {
    getEstablishmentDashboard(establishmentId: string, timeframeDays: Timeframe): Promise<DashboardStats>;
    getCampaigns(establishmentId: string, status?: AnalyticsCampaignStatus): Promise<CampaignAnalytics[]>;
    getCampaignDetails(campaignId: string): Promise<CampaignAnalytics | null>;
}