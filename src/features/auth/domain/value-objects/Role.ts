/**
 * value object: roles del sistema
 */
export type Role =
    | "ROLE_CUSTOMER"
    | "ROLE_OWNER"
    | "ROLE_ADMIN"
    | "ROLE_FREEMIUM"
    | "ROLE_PREMIUM";

export const ROLES = {
    CUSTOMER: "ROLE_CUSTOMER",
    OWNER:    "ROLE_OWNER",
    ADMIN:    "ROLE_ADMIN",
    FREEMIUM: "ROLE_FREEMIUM",
    PREMIUM:  "ROLE_PREMIUM",
} as const;

export function hasRole(roles: Role[], role: Role): boolean {
    return roles.includes(role);
}

export function isOwner(roles: Role[]): boolean {
    return roles.includes("ROLE_OWNER");
}