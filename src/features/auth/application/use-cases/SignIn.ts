import { User } from "../../domain/entities/User.ts";
import { Role } from "../../domain/value-objects/Role.ts";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository.ts";
import { isValidEmail, normalizeEmail } from "../../domain/value-objects/Email.ts";

/**
 * caso de uso: iniciar sesion
 * valida las credenciales y delega en el repositorio
 */
export async function signIn(
    repo: IAuthRepository,
    email: string,
    password: string,
    roles: Role[],
): Promise<User> {
    if (!isValidEmail(email)) throw new Error("Correo inválido");
    if (!password) throw new Error("La contraseña es obligatoria");
    return repo.signIn({ email: normalizeEmail(email), password, roles });
}