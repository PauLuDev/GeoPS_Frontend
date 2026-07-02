/* limites del plan activo, -1 = ilimitado */
export interface PlanLimits {
    maxEstablishments: number;
    maxActiveCampaigns: number;
    maxIndependentCoupons: number;
    maxCouponsPerCampaign: number;
}

/* suscripcion activa del usuario con su plan y limites reales */
export interface CurrentSubscription {
    planName: string;
    status: string;
    limits: PlanLimits;
}

/* dice si el limite permite otra mas (-1 = ilimitado) */
export function withinLimit(limit: number, current: number): boolean {
    return limit < 0 || current < limit;
}