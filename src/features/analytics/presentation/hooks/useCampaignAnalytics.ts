import { useEffect, useState } from "react";
import { analyticsApi } from "@/features/analytics/infrastructure/api/analyticsApi.ts";
import { CampaignAnalytics } from "@/features/analytics/domain/entities/CampaignAnalytics.ts";

/**
 * hook de presentacion: carga las metricas reales de una campaña desde analytics.
 */
export function useCampaignAnalytics(campaignId?: string) {
    const [data, setData] = useState<CampaignAnalytics | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!campaignId) {
            setData(null);
            return;
        }
        let alive = true;
        setLoading(true);
        analyticsApi.campaignDetails(campaignId)
            .then(d => { if (alive) setData(d); })
            .catch(() => { if (alive) setData(null); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [campaignId]);

    return { data, loading };
}
