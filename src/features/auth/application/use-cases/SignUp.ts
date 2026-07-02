import { User } from "../../domain/entities/User.ts";
import { Role } from "../../domain/value-objects/Role.ts";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository.ts";
import { isValidEmail, normalizeEmail } from "../../domain/value-objects/Email.ts";

/*
 caso de uso -> registrar una cuenta nueva
 valida los datos y delega en el repositorio
*/
export async function signUp(
    repo: IAuthRepository,
    firstName: string,
    lastNameInput: string,
    email: string,
    password: string,
    roles: Role[],
): Promise<User> {
    if (!firstName.trim()) throw new Error("El nombre es obligatorio");
    if (!lastNameInput.trim()) throw new Error("El apellido es obligatorio");
    if (!isValidEmail(email)) throw new Error("Correo inválido");
    if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");

    const name            = firstName.trim();
    const lastname        = lastNameInput.trim();
    const normalizedEmail = normalizeEmail(email);
    const username        = normalizedEmail.split("@")[0];

    /* el repo crea la cuenta en firebase y registra al usuario */
    return repo.signUp({ email: normalizedEmail, password, username, roles, name, lastname });
}