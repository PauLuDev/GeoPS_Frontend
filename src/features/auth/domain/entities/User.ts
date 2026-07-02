import { Role } from "../value-objects/Role.ts";

/**
 * usuario autenticado
 * solo datos de autenticacion y autorizacion
 */
export interface User {
    id: string;            // UUID
    username: string;
    roles: Role[];
    createdAt?: string;
    updatedAt?: string;
}