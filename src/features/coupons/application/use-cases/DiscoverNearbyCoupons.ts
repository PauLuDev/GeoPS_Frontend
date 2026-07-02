import { Coupon as UICoupon, Business } from "@/shared/types.ts";
import { establishmentApi } from "@/features/establishments/infrastructure/api/establishmentApi.ts";
import { toBusiness } from "@/features/establishments/application/mappers/EstablishmentMapper.ts";
import { HttpCommentRepository } from "@/features/comments/infrastructure/repositories/HttpCommentRepository.ts";
import { couponApi } from "../../infrastructure/api/couponApi.ts";
import { toUICoupon } from "../mappers/DiscoverCouponMapper.ts";
import { campaignApi } from "@/features/campaigns/infrastructure/api/campaignApi.ts";
import { CouponResource } from "../dtos/CouponResource.ts";

/* lo que devuelve la busqueda -> los cupones del mapa y el local de cada uno */
export interface Discovery {
    coupons: UICoupon[];
    businessByName: Record<string, Business>;
}

/* radio para "ver todo lima" cuando el usuario quita el limite */
const LIMA_RADIUS = 100000;

/* cache en memoria por (lat,lng,radio) con TTL corto -> cambiar de pestaña, el
   auto-refresh o re-renders no vuelven a descargar todo lima cada vez */
const CACHE_TTL = 20000;
const discoveryCache = new Map<string, { at: number; data: Discovery }>();
const cacheKey = (lat: number, lng: number, r: number) =>
    `${lat.toFixed(3)}|${lng.toFixed(3)}|${r}`;

/* normaliza un id para comparar sin tropezar con espacios o mayusculas */
const normId = (v: unknown): string => (v == null ? "" : String(v).trim().toLowerCase());

/* lo que junta cada local antes de armar los cupones finales */
interface RawEstablishment {
    business: Business;
    couponResources: CouponResource[];
    /* cruce campaignId (normalizado) -> nombre de la campana */
    campaignNameById: Record<string, string>;
}

/*
 descubre los cupones cerca del usuario juntando varias fuentes
 locales cercanos -> todos los cupones de cada local (sueltos + de campana), mas el rating real del local
 no hay una fuente unica de "cupones cerca de mi" -> por eso se arma aca en el front
*/
export async function discoverNearbyCoupons(lat: number, lng: number, radiusMeters: number): Promise<Discovery> {
    const radius = Number.isFinite(radiusMeters) ? radiusMeters : LIMA_RADIUS;

    const key = cacheKey(lat, lng, radius);
    const cached = discoveryCache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL) return cached.data;

    const establishments = await establishmentApi.nearby(lat, lng, radius);
    const commentRepo = new HttpCommentRepository();

    /* fase 1: por cada local -> rating real, cupones crudos y el cruce campaignId->nombre.
       las 3 llamadas van en paralelo (antes el rating bloqueaba a los cupones) */
    const raw: RawEstablishment[] = await Promise.all(establishments.map(async er => {
        const business = toBusiness(er);

        const [stats, cs, campaignsRaw] = await Promise.all([
            commentRepo.getAverageRating(er.id).catch(() => null),
            couponApi.listByEstablishment(er.id).catch(() => [] as CouponResource[]),
            campaignApi.listByEstablishment(er.id).catch(() => []),
        ]);

        /* rating real del local */
        if (stats) {
            business.rating = stats.averageRating;
            business.totalReviews = stats.totalReviews;
        }

        const couponResources: CouponResource[] = cs;
        const campaignNameById: Record<string, string> = {};

        /* tolera que el back devuelva un array directo o un objeto paginado { content: [...] } */
        const campaigns = Array.isArray(campaignsRaw)
            ? campaignsRaw
            : ((campaignsRaw as { content?: unknown[] })?.content ?? []);
        campaigns.forEach((camp: { id: string; name: string }) => {
            campaignNameById[normId(camp.id)] = camp.name;
        });

        return { business, couponResources, campaignNameById };
    }));

    /* fase 2: owners verificados -> cualquier cuenta con al menos un local con RUC valido
       hace que TODOS sus locales hereden la verificacion. se calcula antes de armar los cupones
       para que el badge sea consistente en mapa, lista y detalle */
    const verifiedOwners = new Set<string>(
        raw
            .filter(r => r.business.ownerId && r.business.ruc && r.business.ruc !== "No disponible" && r.business.ruc !== "")
            .map(r => r.business.ownerId!)
    );
    raw.forEach(r => {
        if (r.business.ownerId && verifiedOwners.has(r.business.ownerId)) {
            r.business.verified = true;
        }
    });

    /* fase 3: armar los cupones de UI con el business ya finalizado y el nombre de campana resuelto */
    const coupons = raw.flatMap(r =>
        r.couponResources.map(c =>
            toUICoupon(c, r.business, c.endDate, c.campaignId ? r.campaignNameById[normId(c.campaignId)] : undefined)
        )
    );

    const businessByName: Record<string, Business> = {};
    raw.forEach(r => { businessByName[r.business.name] = r.business; });

    const result: Discovery = { coupons, businessByName };
    discoveryCache.set(key, { at: Date.now(), data: result });
    return result;
}
