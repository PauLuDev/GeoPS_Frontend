import { TokenStorage } from "../infrastructure/TokenStorage.ts";

/* usuario logueado tal como se guarda en la sesion */
export interface SessionUser {
    id: string;
    username: string;
    email?: string;
    roles: string[];
}

/* devuelve el usuario de la sesion o null si no hay nadie logueado */
export function getCurrentUser(): SessionUser | null {
    const raw = TokenStorage.getUser();
    if (!raw) return null;
    try {
        const u = JSON.parse(raw);
        return {
            id: u.id,
            username: u.username,
            email: u.email,
            roles: u.roles ?? [],
        };
    } catch {
        return null;
    }
}