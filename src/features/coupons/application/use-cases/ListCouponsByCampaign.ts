import { Coupon } from "../../domain/entities/Coupon.ts";
import { ICouponRepository } from "../../domain/repositories/ICouponRepository.ts";

/* caso de uso: listar los cupones de una campana */
export async function listCouponsByCampaign(repo: ICouponRepository, campaignId: string): Promise<Coupon[]> {
    return repo.getByCampaign(campaignId);
}