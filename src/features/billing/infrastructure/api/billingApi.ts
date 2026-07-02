import { getToken } from "@/shared/api/tokenStore.ts";
import { ApiError } from "@/shared/api/apiClient.ts";
import { SubscriptionResource, CurrentSubscriptionResource } from "../../application/dtos/SubscriptionResource.ts";

/*
 llama a planes y suscripciones del usuario
 todo pasa por el api-gateway: la ruta /billing/** se reenvia al subscription-service
 (el gateway hace StripPrefix=1, asi que /billing/api/v1/billing/... llega como /api/v1/billing/...)
*/
const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
const BASE = "/billing/api/v1/billing";

/* el plan tal cual llega, sin los limites que agrega el front */
export interface BackendPlan {
    id: string;
    name: string;
    price: { amount: number; currency: string };
    durationDays: number;
}

/* request directo con el token firebase, mismo manejo de error que apiClient */
async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = getToken();
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        let errBody: unknown;
        try { errBody = await res.json(); } catch { /* respuesta sin cuerpo json */ }
        throw new ApiError(res.status, `${method} ${path} -> ${res.status}`, errBody);
    }
    if (res.status === 204) return undefined as T;
    const contentType = res.headers.get("content-type") ?? "";
    return (contentType.includes("application/json") ? await res.json() : await res.text()) as T;
}

export const billingApi = {
    /* catalogo de planes */
    listPlans: () =>
        request<BackendPlan[]>("GET", `${BASE}/plans`),

    /* inicia el pago, devuelve el clientSecret para confirmar */
    createIntent: (planId: string) =>
        request<{ clientSecret: string }>("POST", `${BASE}/create-intent?planId=${planId}`),

    /* suscripciones del usuario, solo las propias */
    subscriptionsByUser: (userId: string) =>
        request<SubscriptionResource[]>("GET", `${BASE}/user/${userId}`),

    /* suscripcion activa del usuario logueado con sus limites reales */
    current: () =>
        request<CurrentSubscriptionResource>("GET", `${BASE}/user/current`),

    /* cancela la renovacion automatica; la suscripcion sigue activa hasta fin de periodo */
    cancelRenewal: (subscriptionId: string) =>
        request<void>("POST", `${BASE}/subscriptions/${subscriptionId}/cancel-renewal`),
};
