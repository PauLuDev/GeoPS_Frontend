import { CampaignAnalytics } from "../../domain/entities/CampaignAnalytics.ts";
import { analyticsApi } from "../../infrastructure/api/analyticsApi.ts";
import { campaignApi } from "@/features/campaigns/infrastructure/api/campaignApi.ts";

const EMPTY_STATS = { viewsCount: 0, uniqueViewsCount: 0, reservationsCount: 0, redemptionsCount: 0, conversionRate: 0 };

/*
 lista las campanas de un establecimiento con sus metricas para el dashboard.

 el LISTADO sale del marketing-service (fuente de verdad de las campanas del dueno),
 asi SIEMPRE aparecen todas sus campanas, con sus nombres reales. las METRICAS se
 superponen desde el analytics, que solo conoce las campanas que le llegaron por el
 pipeline de eventos; las que aun no tenga, salen con metricas en 0.
 si marketing falla, caemos a lo que diga el analytics para no quedar en blanco.
*/
export async function listCampaignAnalytics(establishmentId: string): Promise<CampaignAnalytics[]> {
    if (!establishmentId) return [];

    const [marketing, fromAnalytics] = await Promise.all([
        campaignApi.listByEstablishment(establishmentId).catch(() => []),
        analyticsApi.campaigns(establishmentId).catch(() => [] as CampaignAnalytics[]),
    ]);

    if (marketing.length === 0) return fromAnalytics;

    const metricsById = new Map(fromAnalytics.map(c => [c.id, c.analytics]));
    return marketing.map(c => ({
        id: c.id,
        name: c.name,
        startDate: c.startDate,
        endDate: c.endDate,
        status: c.status as CampaignAnalytics["status"],
        analytics: metricsById.get(c.id) ?? { ...EMPTY_STATS },
    }));
}
