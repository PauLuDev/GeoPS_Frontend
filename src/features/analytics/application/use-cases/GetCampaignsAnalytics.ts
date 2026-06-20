import { CampaignAnalytics, AnalyticsCampaignStatus } from "../../domain/entities/CampaignAnalytics.ts";
import { IAnalyticsRepository } from "../../domain/repositories/IAnalyticsRepository.ts";

/* caso de uso: metricas de las campanas de un establecimiento */
export async function getCampaignsAnalytics(
    repo: IAnalyticsRepository,
    establishmentId: string,
    status?: AnalyticsCampaignStatus,
): Promise<CampaignAnalytics[]> {
    return repo.getCampaigns(establishmentId, status);
}