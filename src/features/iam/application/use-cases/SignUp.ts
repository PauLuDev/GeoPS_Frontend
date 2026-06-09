import { User } from "../../domain/entities/User.ts";
import { Role } from "../../domain/value-objects/Role.ts";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository.ts";
import { isValidEmail, normalizeEmail } from "../../domain/value-objects/Email.ts";

/**
 * caso de uso: registrar una cuenta nueva
 * valida los datos y delega en el repositorio
 *
 * `firebaseUid` lo entregara Firebase tras el registro real; por ahora es mock
 */
export async function signUp(
    repo: IAuthRepository,
    fullName: string,
    email: string,
    password: string,
    roles: Role[],
): Promise<User> {
    if (!fullName.trim()) throw new Error("El nombre es obligatorio");
    if (!isValidEmail(email)) throw new Error("Correo inválido");
    if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");

    const { name, lastname } = splitFullName(fullName);
    const username    = normalizeEmail(email).split("@")[0];
    const firebaseUid = `mock-${Date.now()}`;   // TODO: vendra de Firebase

    return repo.signUp({ username, firebaseUid, roles, name, lastname });
}

/* separa "Nombre Apellido" en sus partes */
function splitFullName(fullName: string): { name: string; lastname: string } {
    const parts = fullName.trim().split(/\s+/);
    return { name: parts[0], lastname: parts.slice(1).join(" ") || parts[0] };
}