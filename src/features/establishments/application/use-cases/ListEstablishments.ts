import { Business } from "@/shared/types.ts";
import { IEstablishmentRepository } from "../../domain/repositories/IEstablishmentRepository.ts";

/* caso de uso: listar los establecimientos del dueno */
export function listEstablishments(repo: IEstablishmentRepository): Promise<Business[]> {
    return repo.getAll();
}