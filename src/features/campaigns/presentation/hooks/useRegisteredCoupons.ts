import { useCallback, useEffect, useState } from "react";
import { CampaignCoupon } from "../../domain/entities/CampaignCoupon.ts";
import { listRegisteredCoupons } from "../../application/use-cases/ListRegisteredCoupons.ts";

/* hook de presentacion: catalogo de cupones ya registrados por el dueno */
export function useRegisteredCoupons() {
    const [coupons, setCoupons] = useState<CampaignCoupon[]>([]);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        setLoading(true);
        try {
            setCoupons(await listRegisteredCoupons());
        } catch {
            setCoupons([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void reload(); }, [reload]);

    return { coupons, loading, reload };
}
