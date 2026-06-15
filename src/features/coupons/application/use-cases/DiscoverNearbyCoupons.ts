import { Coupon as UICoupon, Business } from "@/shared/types.ts";
import { establishmentApi } from "@/features/establishments/infrastructure/api/establishmentApi.ts";
import { toBusiness } from "@/features/establishments/application/mappers/EstablishmentMapper.ts";
import { campaignApi } from "@/features/campaigns/infrastructure/api/campaignApi.ts";
import { CampaignResource } from "@/features/campaigns/application/dtos/CampaignResource.ts";
import { HttpCommentRepository } from "@/features/comments/infrastructure/repositories/HttpCommentRepository.ts";
import { couponApi } from "../../infrastructure/api/couponApi.ts";
import { toUICoupon } from "../mappers/DiscoverCouponMapper.ts";

/* lo que devuelve la busqueda -> los cupones del mapa y el local de cada uno */
export interface Discovery {
    coupons: UICoupon[];
    businessByName: Record<string, Business>;
}

/* radio para "ver todo lima" cuando el usuario quita el limite */
const LIMA_RADIUS = 100000;

/*
 descubre los cupones cerca del usuario juntando varias fuentes
 locales cercanos -> campanas activas de cada uno -> cupones de cada campana, mas el rating real del local
 no hay una fuente unica de "cupones cerca de mi" -> por eso se arma aca en el front
*/
export async function discoverNearbyCoupons(lat: number, lng: number, radiusMeters: number): Promise<Discovery> {
    const radius = Number.isFinite(radiusMeters) ? radiusMeters : LIMA_RADIUS;
    const establishments = await establishmentApi.nearby(lat, lng, radius);
    const commentRepo = new HttpCommentRepository();

    const perEstablishment = await Promise.all(establishments.map(async er => {
        const business = toBusiness(er);

        /* rating real del local */
        try {
            const stats = await commentRepo.getAverageRating(er.id);
            business.rating = stats.averageRating;
            business.totalReviews = stats.totalReviews;
        } catch { /* sin reseñas todavia */ }

        /* campanas activas del local */
        let campaigns: CampaignResource[] = [];
        try {
            campaigns = await campaignApi.listByEstablishment(er.id);
        } catch { /* el local aun no tiene campanas */ }
        const active = campaigns.filter(c => c.status === "ACTIVE");

        /* cupones de cada campana activa */
        const couponLists = await Promise.all(active.map(async camp => {
            try {
                const cs = await couponApi.listByCampaign(camp.id);
                return cs.map(c => toUICoupon(c, business, camp.endDate));
            } catch {
                return [];
            }
        }));

        return { business, coupons: couponLists.flat() };
    }));

    const coupons = perEstablishment.flatMap(p => p.coupons);
    const businessByName: Record<string, Business> = {};
    perEstablishment.forEach(p => { businessByName[p.business.name] = p.business; });

    return { coupons, businessByName };
}