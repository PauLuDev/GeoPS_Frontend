/**
 * DTO (iam-service)
 * es la forma cruda que devuelve la API; el mapper la convierte
 * a la entidad de dominio `User`
 */
export interface UserResource {
    id: string;            // UUID
    username: string;
    roles: string[];
    createdAt?: string;
    updatedAt?: string;
}