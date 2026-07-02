/* dto de la suscripcion */
export interface SubscriptionResource {
    id: string;
    userId: string;
    stripePaymentIntentId?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

/* limites del plan, -1 = ilimitado */
export interface SubscriptionLimitsResource {
    maxEstablishments: number;
    maxActiveCampaigns: number;
    maxIndependentCoupons: number;
    maxCouponsPerCampaign: number;
}

/* suscripcion activa del usuario con sus limites */
export interface CurrentSubscriptionResource {
    userId: string;
    planName: string;
    status: string;
    activatedAt?: string | null;
    expiresAt?: string | null;
    limits: SubscriptionLimitsResource;
}