import { Plan } from "../../domain/entities/Plan.ts";
import { Subscription } from "../../domain/entities/Subscription.ts";
import { CurrentSubscription } from "../../domain/entities/CurrentSubscription.ts";
import { IBillingRepository } from "../../domain/repositories/IBillingRepository.ts";
import { planLimitsFor } from "../../domain/value-objects/PlanLimits.ts";
import { toSubscription, toCurrentSubscription } from "../../application/mappers/SubscriptionMapper.ts";
import { billingApi } from "../api/billingApi.ts";

/*
 repositorio de billing -> planes, pago y suscripciones del usuario
 el pago devuelve un clientSecret que el front confirma con stripe
*/
export class HttpBillingRepository implements IBillingRepository {

    async getPlans(): Promise<Plan[]> {
        const plans = await billingApi.listPlans();
        /* los limites no llegan con el plan -> se completan por nombre con los del back */
        /* el precio viene en centavos -> se pasa a soles para mostrar */
        return plans.map(p => {
            const limits = planLimitsFor(p.name);
            return {
                id: p.id,
                name: p.name,
                price: { amount: p.price.amount / 100, currency: p.price.currency },
                durationDays: p.durationDays,
                couponLimit: limits.couponLimit,
                campaignLimit: limits.campaignLimit,
            };
        });
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

    async getCurrentSubscription(): Promise<CurrentSubscription> {
        return toCurrentSubscription(await billingApi.current());
    }
}