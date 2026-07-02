import { useEffect, useState } from "react";
import { analyticsApi } from "@/features/analytics/infrastructure/api/analyticsApi.ts";
import { CouponAnalytics } from "@/features/analytics/domain/entities/CouponAnalytics.ts";

/**
 * hook de presentacion: carga las metricas de los cupones de uno o varios establecimientos.
 */
export function useCouponMetrics(establishmentId?: string | string[]) {
    const [metrics, setMetrics] = useState<CouponAnalytics[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const ids = establishmentId
            ? (Array.isArray(establishmentId) ? establishmentId : [establishmentId])
            : [];
        if (ids.length === 0) {
            setMetrics([]);
            return;
        }
        let alive = true;
        setLoading(true);
        Promise.all(ids.map(id => analyticsApi.couponMetrics(id).catch(() => [])))
            .then(lists => { if (alive) setMetrics(lists.flat()); })
            .catch(() => { if (alive) setMetrics([]); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [Array.isArray(establishmentId) ? establishmentId.join(",") : establishmentId]);

    return { metrics, loading };
}
