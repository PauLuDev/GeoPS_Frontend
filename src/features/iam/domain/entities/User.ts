import { Role } from "../value-objects/Role.ts";

/**
 * usuario autenticado
 * solo datos de autenticacion y autorizacion. Los datos personales
 * (nombre, apellido) viven en el contexto Profiles del backend
 */
export interface User {
    id: string;            // UUID
    username: string;
    roles: Role[];
    createdAt?: string;
    updatedAt?: string;
}