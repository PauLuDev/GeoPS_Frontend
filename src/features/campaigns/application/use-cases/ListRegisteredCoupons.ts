import { CampaignCoupon } from "../../domain/entities/CampaignCoupon.ts";
import { campaignApi } from "../../infrastructure/api/campaignApi.ts";
import { couponApi } from "@/features/coupons/infrastructure/api/couponApi.ts";
import { ApiError } from "@/shared/api/apiClient.ts";
import { toCampaignCoupon } from "../mappers/RegisteredCouponMapper.ts";

/*
 lista los cupones ya registrados por el dueno -> el catalogo de "mis cupones"
 no hay una lista directa -> se juntan los cupones de todas sus campanas
 si todavia no se pueden traer las campanas del dueno, devuelve vacio
*/
export async function listRegisteredCoupons(): Promise<CampaignCoupon[]> {
    let campaigns;
    try {
        campaigns = await campaignApi.listMine();
    } catch (e) {
        if (e instanceof ApiError && (e.status === 404 || e.status === 501)) return [];
        throw e;
    }

    const lists = await Promise.all(
        campaigns.map(c => couponApi.listByCampaign(c.id).catch(() => [])),
    );

    /* saca repetidos por id -> un cupon puede estar en varias campanas */
    const byId = new Map<string, CampaignCoupon>();
    lists.flat().forEach(c => byId.set(c.id, toCampaignCoupon(c)));
    return [...byId.values()];
}