import { Plan } from "../../domain/entities/Plan.ts";
import { IBillingRepository } from "../../domain/repositories/IBillingRepository.ts";

/* caso de uso: listar los planes de suscripcion disponibles */
export async function getPlans(repo: IBillingRepository): Promise<Plan[]> {
    return repo.getPlans();
}