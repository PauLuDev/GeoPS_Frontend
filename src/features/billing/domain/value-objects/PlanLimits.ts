/*
 limites de cada plan para los duenos de establecimientos
 campanas activas a la vez -> freemium hasta 2, premium ilimitadas (0 = sin limite)
 lo usan el repositorio de planes para mostrarlo y el layout del dueno para frenar la creacion
*/
export const CAMPAIGN_LIMITS: Record<string, number> = {
    "plan-freemium": 2,
    "plan-premium": 0,
};

/*
 limite de cupones activos por plan (0 = ilimitado)
 regla del front -> el plan no trae este dato, el repositorio lo agrega igual que CAMPAIGN_LIMITS
*/
export const COUPON_LIMITS: Record<string, number> = {
    "plan-freemium": 5,
    "plan-premium": 0,
};

/* limite de cupones del plan (0 = ilimitado), por defecto el mas restrictivo */
export function couponLimitFor(planId: string): number {
    return COUPON_LIMITS[planId] ?? 5;
}

/* limite de campanas del plan (0 = ilimitado), por defecto el mas restrictivo */
export function campaignLimitFor(planId: string): number {
    return CAMPAIGN_LIMITS[planId] ?? 2;
}

/* dice si el plan deja crear otra campana segun cuantas activas hay */
export function canCreateCampaign(planId: string, activeCount: number): boolean {
    const limit = campaignLimitFor(planId);
    return limit === 0 || activeCount < limit;
}