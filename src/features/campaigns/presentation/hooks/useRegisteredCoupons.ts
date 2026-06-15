import { useEffect, useState } from "react";
import { CampaignCoupon } from "../../domain/entities/CampaignCoupon.ts";
import { listRegisteredCoupons } from "../../application/use-cases/ListRegisteredCoupons.ts";

/**
 * hook de presentacion: catalogo de cupones ya registrados por el dueno
 */
export function useRegisteredCoupons() {
    const [coupons, setCoupons] = useState<CampaignCoupon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        listRegisteredCoupons()
            .then(cs => { if (alive) setCoupons(cs); })
            .catch(() => { if (alive) setCoupons([]); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, []);

    return { coupons, loading };
}