import { SubscriptionStatus } from "../value-objects/SubscriptionStatus.ts";

/**
 * suscripcion de un usuario a un plan
 */
export interface Subscription {
    id: string;                    // UUID
    userId: string;
    stripePaymentIntentId?: string;
    status: SubscriptionStatus;
    createdAt?: string;
    updatedAt?: string;
}