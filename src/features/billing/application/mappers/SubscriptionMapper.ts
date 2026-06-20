import { Subscription } from "../../domain/entities/Subscription.ts";
import { CurrentSubscription } from "../../domain/entities/CurrentSubscription.ts";
import { SubscriptionStatus } from "../../domain/value-objects/SubscriptionStatus.ts";
import { SubscriptionResource, CurrentSubscriptionResource } from "../dtos/SubscriptionResource.ts";

/* DTO -> entidad de dominio */
export function toSubscription(r: SubscriptionResource): Subscription {
    return {
        id: r.id,
        userId: r.userId,
        stripePaymentIntentId: r.stripePaymentIntentId,
        status: r.status as SubscriptionStatus,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    };
}

/* DTO -> suscripcion activa con sus limites */
export function toCurrentSubscription(r: CurrentSubscriptionResource): CurrentSubscription {
    return {
        planName: r.planName,
        status: r.status,
        limits: {
            maxEstablishments: r.limits.maxEstablishments,
            maxActiveCampaigns: r.limits.maxActiveCampaigns,
            maxIndependentCoupons: r.limits.maxIndependentCoupons,
            maxCouponsPerCampaign: r.limits.maxCouponsPerCampaign,
        },
    };
}