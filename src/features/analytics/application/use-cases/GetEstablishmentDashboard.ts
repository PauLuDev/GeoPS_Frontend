import { DashboardStats } from "../../domain/value-objects/DashboardStats.ts";
import { IAnalyticsRepository, Timeframe } from "../../domain/repositories/IAnalyticsRepository.ts";

/* caso de uso: obtener las metricas del dashboard de un establecimiento */
export async function getEstablishmentDashboard(
    repo: IAnalyticsRepository,
    establishmentId: string,
    timeframeDays: Timeframe,
): Promise<DashboardStats> {
    return repo.getEstablishmentDashboard(establishmentId, timeframeDays);
}