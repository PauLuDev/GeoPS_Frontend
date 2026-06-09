/**
 * dto de `SubscriptionResource` (subscription-service)
 */
export interface SubscriptionResource {
    id: string;
    userId: string;
    stripePaymentIntentId?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}