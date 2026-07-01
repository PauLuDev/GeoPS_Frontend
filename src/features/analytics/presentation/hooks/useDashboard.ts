import { useCallback, useEffect, useRef, useState } from "react";
import { DashboardStats } from "../../domain/value-objects/DashboardStats.ts";
import { IAnalyticsRepository, Timeframe } from "../../domain/repositories/IAnalyticsRepository.ts";
import { GraphQLAnalyticsRepository } from "../../infrastructure/repositories/GraphQLAnalyticsRepository.ts";
import { getEstablishmentDashboard } from "../../application/use-cases/GetEstablishmentDashboard.ts";
import { useAutoRefresh } from "@/shared/hooks/useAutoRefresh.ts";

/**
 * hook de presentacion: carga las metricas del dashboard de un establecimiento
 * como analytics es GraphQL (asincrono), expone loading/error y recarga al
 * cambiar el establecimiento o la ventana de tiempo
 */
export function useDashboard(
    establishmentId: string,
    timeframeDays: Timeframe,
    repository?: IAnalyticsRepository,
) {
    const repoRef = useRef<IAnalyticsRepository>(repository ?? new GraphQLAnalyticsRepository());
    const [stats, setStats]     = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    // resetea el estado en render cuando cambia el establecimiento o la ventana,
    // asi no hay un render intermedio mostrando datos viejos
    const key = `${establishmentId}|${timeframeDays}`;
    const [prevKey, setPrevKey] = useState(key);
    if (key !== prevKey) {
        setPrevKey(key);
        setStats(null);
        setLoading(true);
        setError(null);
    }

    useEffect(() => {
        let alive = true;
        getEstablishmentDashboard(repoRef.current, establishmentId, timeframeDays)
            .then(s => { if (alive) setStats(s); })
            .catch(e => { if (alive) setError(e instanceof Error ? e.message : "Error cargando el dashboard"); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [establishmentId, timeframeDays]);

    /* refresco silencioso (sin spinner) para mantener las metricas al dia sin recargar */
    const refresh = useCallback(() => {
        if (!establishmentId) return;
        getEstablishmentDashboard(repoRef.current, establishmentId, timeframeDays)
            .then(setStats).catch(() => { /* mantiene los datos actuales */ });
    }, [establishmentId, timeframeDays]);
    useAutoRefresh(refresh, 30000);

    return { stats, loading, error };
}