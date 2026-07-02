import { Subscription } from "../../domain/entities/Subscription.ts";
import { IBillingRepository } from "../../domain/repositories/IBillingRepository.ts";

/* caso de uso: suscripciones del usuario autenticado */
export async function getMySubscriptions(repo: IBillingRepository, userId: string): Promise<Subscription[]> {
    return repo.getMySubscriptions(userId);
}