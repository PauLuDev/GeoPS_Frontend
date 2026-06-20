import { useEffect, useState } from "react";
import { Business } from "@/shared/types.ts";
import { discoverNearbyCoupons, Discovery } from "../../application/use-cases/DiscoverNearbyCoupons.ts";

const EMPTY: Discovery = { coupons: [], businessByName: {} };

/**
 * hook de presentacion: descubre los cupones cerca del usuario
 * recarga cuando cambia la ubicacion o el radio
 */
export function useNearbyCoupons(lat: number, lng: number, radius: number) {
    const [data, setData] = useState<Discovery>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        setData(EMPTY);
        setLoading(true);
        setError(null);
        discoverNearbyCoupons(lat, lng, radius)
            .then(d => { if (alive) setData(d); })
            .catch(e => { if (alive) setError(e instanceof Error ? e.message : "no se pudieron cargar los cupones"); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [lat, lng, radius]);

    const resolveBusiness = (brand: string, fallback: Business): Business =>
        data.businessByName[brand] ?? fallback;

    return { coupons: data.coupons, resolveBusiness, loading, error };
}