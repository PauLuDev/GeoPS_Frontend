import { IBillingRepository } from "../../domain/repositories/IBillingRepository.ts";

/**
 * caso de uso: iniciar la suscripcion a un plan
 * devuelve el `clientSecret` de Stripe para confirmar el pago en el cliente
 */
export async function subscribeToPlan(repo: IBillingRepository, planId: string): Promise<string> {
    if (!planId) throw new Error("Plan inválido");
    return repo.createPaymentIntent(planId);
}