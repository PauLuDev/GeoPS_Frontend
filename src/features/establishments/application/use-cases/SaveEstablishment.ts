import { Business } from "@/shared/types.ts";
import { IEstablishmentRepository } from "../../domain/repositories/IEstablishmentRepository.ts";

/* caso de uso: registrar o actualizar un establecimiento (upsert por id) */
export function saveEstablishment(repo: IEstablishmentRepository, establishment: Business): Promise<Business> {
    return repo.save(establishment);
}