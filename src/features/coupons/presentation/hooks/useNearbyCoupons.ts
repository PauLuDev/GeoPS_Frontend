import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Business } from "@/shared/types.ts";
import { useAutoRefresh } from "@/shared/hooks/useAutoRefresh.ts";
import { discoverNearbyCoupons, Discovery } from "../../application/use-cases/DiscoverNearbyCoupons.ts";
import { mapApiError, AppError } from "@/shared/api/errorMapper.ts";

const EMPTY: Discovery = { coupons: [], businessByName: {} };

/**
 * hook de presentacion: descubre los cupones cerca del usuario
 * recarga cuando cambia la ubicacion o el radio, y se auto-refresca cada cierto
 * tiempo para que aparezcan los cupones nuevos sin recargar la pagina
 */
export function useNearbyCoupons(lat: number, lng: number, radius: number) {
    const { t } = useTranslation();
    const [data, setData] = useState<Discovery>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AppError | null>(null);

    useEffect(() => {
        let alive = true;
        setData(EMPTY);
        setLoading(true);
        setError(null);
        discoverNearbyCoupons(lat, lng, radius)
            .then(d => { if (alive) setData(d); })
            .catch(e => { if (alive) setError(mapApiError(e, t)); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [lat, lng, radius, t]);

    /* refresco silencioso (sin spinner ni vaciar la lista) para el auto-refresh */
    const refresh = useCallback(() => {
        discoverNearbyCoupons(lat, lng, radius).then(setData).catch(() => { /* mantiene lo que ya hay */ });
    }, [lat, lng, radius]);
    useAutoRefresh(refresh, 30000);

    const resolveBusiness = (brand: string, fallback: Business): Business =>
        data.businessByName[brand] ?? fallback;

    return { coupons: data.coupons, resolveBusiness, loading, error };
}