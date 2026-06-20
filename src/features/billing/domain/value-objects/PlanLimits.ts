/*
 limites de cada plan, espejo de lo que valida el back, por nombre de plan
 -1 = ilimitado
 freemium no permite campanas (0) y deja pocos cupones; premium y premium plus suben
*/
export interface PlanLimitValues {
    campaignLimit: number;
    couponLimit: number;
    establishmentLimit: number;
}

const PLAN_LIMITS: Record<string, PlanLimitValues> = {
    "Freemium":     { campaignLimit: 0,  couponLimit: 3, establishmentLimit: 1  },
    "Premium":      { campaignLimit: 2,  couponLimit: 5, establishmentLimit: 2  },
    "Premium Plus": { campaignLimit: -1, couponLimit: -1, establishmentLimit: -1 },
};

/* limites del plan por su nombre, por defecto los de freemium */
export function planLimitsFor(planName: string): PlanLimitValues {
    return PLAN_LIMITS[planName] ?? { campaignLimit: 0, couponLimit: 3, establishmentLimit: 1 };
}
