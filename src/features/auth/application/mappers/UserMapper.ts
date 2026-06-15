import { User } from "../../domain/entities/User.ts";
import { Role } from "../../domain/value-objects/Role.ts";
import { UserResource } from "../dtos/UserResource.ts";

/**
 * mapper: convierte el DTO de la API (UserResource) a la entidad de dominio User
 */
export function toUser(resource: UserResource): User {
    return {
        id: resource.id,
        username: resource.username,
        roles: resource.roles as Role[],
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
    };
}