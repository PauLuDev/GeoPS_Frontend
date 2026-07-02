import { DashboardStats } from "../../domain/value-objects/DashboardStats.ts";
import { CampaignAnalytics, AnalyticsCampaignStatus } from "../../domain/entities/CampaignAnalytics.ts";
import { IAnalyticsRepository, Timeframe } from "../../domain/repositories/IAnalyticsRepository.ts";
import { analyticsApi } from "../api/analyticsApi.ts";

/* implementa el puerto de analytics usando el datasource */
export class GraphQLAnalyticsRepository implements IAnalyticsRepository {

    getEstablishmentDashboard(establishmentId: string, timeframeDays: Timeframe): Promise<DashboardStats> {
        return analyticsApi.dashboard(establishmentId, timeframeDays);
    }

    getCampaigns(establishmentId: string, status?: AnalyticsCampaignStatus): Promise<CampaignAnalytics[]> {
        return analyticsApi.campaigns(establishmentId, status);
    }

    async getCampaignDetails(campaignId: string): Promise<CampaignAnalytics | null> {
        return (await analyticsApi.campaignDetails(campaignId)) ?? null;
    }
}