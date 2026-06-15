import { apiClient } from "@/shared/api/apiClient.ts";
import { SubscriptionResource } from "../../application/dtos/SubscriptionResource.ts";

/* llama a planes y suscripciones del usuario */
const BASE = "/billing/api/v1/billing";

/* el plan tal cual llega, sin los limites que agrega el front */
export interface BackendPlan {
    id: string;
    name: string;
    price: { amount: number; currency: string };
    durationDays: number;
}

export const billingApi = {
    /* catalogo de planes */
    listPlans: () =>
        apiClient.get<BackendPlan[]>(`${BASE}/plans`),

    /* inicia el pago, devuelve el clientSecret para confirmar */
    createIntent: (planId: string) =>
        apiClient.post<{ clientSecret: string }>(`${BASE}/create-intent?planId=${planId}`),

    /* suscripciones del usuario, solo las propias */
    subscriptionsByUser: (userId: string) =>
        apiClient.get<SubscriptionResource[]>(`${BASE}/user/${userId}`),

    /* cancela la renovacion automatica; la suscripcion sigue activa hasta fin de periodo */
    cancelRenewal: (subscriptionId: string) =>
        apiClient.post<void>(`${BASE}/subscriptions/${subscriptionId}/cancel-renewal`),
};