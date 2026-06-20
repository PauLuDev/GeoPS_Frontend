import { Campaign } from "../entities/Campaign.ts";
import { CampaignCoupon } from "../entities/CampaignCoupon.ts";

/*
 rendimiento -> tasa de canje = redimidos / vistos
 es la metrica con la que se elige al mejor cupon o campana
*/

/* tasa de canje de 0 a 1, 0 si no hay vistas */
export function redemptionRate(views: number, redeemed: number): number {
    return views > 0 ? redeemed / views : 0;
}

/* etiqueta de porcentaje de canje, por ejemplo "23.3%" */
export function ratePct(views: number, redeemed: number): string {
    return `${(redemptionRate(views, redeemed) * 100).toFixed(1)}%`;
}

/*
 id de la mejor campana por tasa de canje -> solo cuenta campanas con vistas, null si ninguna aplica
*/
export function bestCampaignId(campaigns: Campaign[]): number | null {
    let bestId: number | null = null;
    let bestRate = -1;
    for (const c of campaigns) {
        if (c.views <= 0) continue;
        const r = redemptionRate(c.views, c.redeemed);
        if (r > bestRate) { bestRate = r; bestId = c.id; }
    }
    return bestId;
}

/*
 id del mejor cupon de una campana por tasa de canje -> null si ningun cupon tiene vistas
*/
export function bestCouponId(coupons: CampaignCoupon[]): string | null {
    let bestId: string | null = null;
    let bestRate = -1;
    for (const c of coupons) {
        if (c.views <= 0) continue;
        const r = redemptionRate(c.views, c.redeemed);
        if (r > bestRate) { bestRate = r; bestId = c.id; }
    }
    return bestId;
}