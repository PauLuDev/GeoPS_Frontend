import { IAuthRepository } from "../../domain/repositories/IAuthRepository.ts";

/**
 * caso de uso: cerrar sesion
 */
export async function signOut(repo: IAuthRepository): Promise<void> {
    return repo.signOut();
}