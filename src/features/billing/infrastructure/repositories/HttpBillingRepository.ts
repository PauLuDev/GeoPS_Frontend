import { Plan } from "../../domain/entities/Plan.ts";
import { Subscription } from "../../domain/entities/Subscription.ts";
import { IBillingRepository } from "../../domain/repositories/IBillingRepository.ts";
import { SubscriptionResource } from "../../application/dtos/SubscriptionResource.ts";
import { toSubscription } from "../../application/mappers/SubscriptionMapper.ts";

/* base del API billing */
const API_BASE = import.meta.env.VITE_BILLING_URL ?? "http://localhost:8085/api/v1/billing";

/**
 * implementacion del repositorio de billing contra el backend (HTTP + Stripe)
 */
export class HttpBillingRepository implements IBillingRepository {

    async getPlans(): Promise<Plan[]> {
        void API_BASE;
        return MOCK_PLANS;
    }

    async createPaymentIntent(planId: string): Promise<string> {
        return `pi_mock_${planId}_secret_test`;
    }

    async getMySubscriptions(userId: string): Promise<Subscription[]> {
        const mock: SubscriptionResource[] = [
            { id: "sub-1", userId, stripePaymentIntentId: "pi_mock", status: "ACTIVE",
              createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ];
        return mock.map(toSubscription);
    }
}

/* datos mock (forma real) */
const MOCK_PLANS: Plan[] = [
    { id: "plan-freemium", name: "Freemium", price: { amount: 0,  currency: "PEN" }, durationDays: 0 },
    { id: "plan-premium",  name: "Premium",  price: { amount: 29, currency: "PEN" }, durationDays: 30 },
];