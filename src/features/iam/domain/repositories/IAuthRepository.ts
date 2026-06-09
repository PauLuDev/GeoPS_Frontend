import { User } from "../entities/User.ts";
import { Role } from "../value-objects/Role.ts";

/* datos para registrar un usuario */
export interface SignUpData {
    username: string;
    firebaseUid: string;   // lo entrega Firebase tras el registro
    roles: Role[];
    name: string;
    lastname: string;
}

/* credenciales de inicio de sesion (el login real lo hara Firebase) */
export interface SignInData {
    email: string;
    password: string;
    roles: Role[];         // mock: rol deseado; con backend lo determina el servidor
}

/**
 * puerto (interface) del repositorio de autenticacion
 */
export interface IAuthRepository {
    signUp(data: SignUpData): Promise<User>;
    signIn(data: SignInData): Promise<User>;
    signOut(): Promise<void>;
    currentUser(): User | null;
}