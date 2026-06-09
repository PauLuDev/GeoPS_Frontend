import { Subscription } from "../../domain/entities/Subscription.ts";
import { SubscriptionStatus } from "../../domain/value-objects/SubscriptionStatus.ts";
import { SubscriptionResource } from "../dtos/SubscriptionResource.ts";

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