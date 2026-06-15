import { Plan } from "../../domain/entities/Plan.ts";
import { Subscription } from "../../domain/entities/Subscription.ts";
import { IBillingRepository } from "../../domain/repositories/IBillingRepository.ts";
import { campaignLimitFor, couponLimitFor } from "../../domain/value-objects/PlanLimits.ts";
import { toSubscription } from "../../application/mappers/SubscriptionMapper.ts";
import { billingApi } from "../api/billingApi.ts";

/*
 repositorio de billing -> planes, pago y suscripciones del usuario
 el pago devuelve un clientSecret que el front confirma con stripe
*/
export class HttpBillingRepository implements IBillingRepository {

    async getPlans(): Promise<Plan[]> {
        const plans = await billingApi.listPlans();
        /* los limites del plan se completan aca porque no llegan con el plan */
        return plans.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            durationDays: p.durationDays,
            couponLimit: couponLimitFor(p.id),
            campaignLimit: campaignLimitFor(p.id),
        }));
    }

    async createPaymentIntent(planId: string): Promise<string> {
        const { clientSecret } = await billingApi.createIntent(planId);
        return clientSecret;
    }

    async cancelRenewal(subscriptionId: string): Promise<void> {
        await billingApi.cancelRenewal(subscriptionId);
    }

    async getMySubscriptions(userId: string): Promise<Subscription[]> {
        const subs = await billingApi.subscriptionsByUser(userId);
        return subs.map(toSubscription);
    }
}