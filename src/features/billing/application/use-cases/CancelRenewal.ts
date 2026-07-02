import { IBillingRepository } from "../../domain/repositories/IBillingRepository.ts";

/* cancela la renovacion automatica de una suscripcion */
export function cancelRenewal(repo: IBillingRepository, subscriptionId: string): Promise<void> {
    return repo.cancelRenewal(subscriptionId);
}