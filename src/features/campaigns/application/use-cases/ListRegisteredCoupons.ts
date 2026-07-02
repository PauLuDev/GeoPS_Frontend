import { CampaignCoupon } from "../../domain/entities/CampaignCoupon.ts";
import { couponApi } from "@/features/coupons/infrastructure/api/couponApi.ts";
import { CouponResource } from "@/features/coupons/application/dtos/CouponResource.ts";
import { establishmentApi } from "@/features/establishments/infrastructure/api/establishmentApi.ts";
import { getCurrentUser } from "@/features/auth/application/session.ts";
import { ApiError } from "@/shared/api/apiClient.ts";
import { toCampaignCoupon } from "../mappers/RegisteredCouponMapper.ts";

/*
 lista los cupones ya registrados por el dueno -> el catalogo de "mis cupones"
 no hay una lista directa -> se traen los establecimientos del dueno y se juntan los cupones de cada uno
 si todavia no se puede traer, devuelve vacio
*/
export async function listRegisteredCoupons(): Promise<CampaignCoupon[]> {
    const me = getCurrentUser();
    if (!me?.id) return [];

    let establishments;
    try {
        establishments = await establishmentApi.byOwner(me.id);
    } catch (e) {
        if (e instanceof ApiError && (e.status === 404 || e.status === 501)) return [];
        throw e;
    }

    const lists = await Promise.all(
        establishments.map(e =>
            couponApi.listByEstablishment(e.id).catch((): CouponResource[] => []),
        ),
    );

    /* saca repetidos por id -> un cupon puede aparecer mas de una vez.
       cada cupon queda etiquetado con el establecimiento del que se trajo */
    const byId = new Map<string, CampaignCoupon>();
    establishments.forEach((est, i) => {
        lists[i].forEach(c => byId.set(c.id, { ...toCampaignCoupon(c), establishmentId: est.id }));
    });
    return [...byId.values()];
}