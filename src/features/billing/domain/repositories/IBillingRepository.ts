import { Plan } from "../entities/Plan.ts";
import { Subscription } from "../entities/Subscription.ts";

/**
 * puerto (interface) del repositorio de billing
 * flujo Stripe: createPaymentIntent devuelve un `clientSecret` que el
 * frontend confirma con Stripe.js
 * al pagar, el backend recibe el webhook
 * y emite SubscriptionPaidEvent -> iam otorga ROLE_PREMIUM
 */
export interface IBillingRepository {
    getPlans(): Promise<Plan[]>;
    /* devuelve el clientSecret de Stripe para confirmar el pago */
    createPaymentIntent(planId: string): Promise<string>;
    getMySubscriptions(userId: string): Promise<Subscription[]>;
}