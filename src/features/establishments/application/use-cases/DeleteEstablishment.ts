import { IEstablishmentRepository } from "../../domain/repositories/IEstablishmentRepository.ts";

/* caso de uso: eliminar un establecimiento */
export function deleteEstablishment(repo: IEstablishmentRepository, id: string): Promise<void> {
    return repo.remove(id);
}