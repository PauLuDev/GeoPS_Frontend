/**
 * persistencia del token de sesion (localStorage)
 * aislado en infraestructura para poder cambiar el mecanismo
 * (cookie httpOnly, sessionStorage, etc.) sin tocar el resto
 */
const TOKEN_KEY = "geops.auth.token";
const USER_KEY  = "geops.auth.user";

export const TokenStorage = {
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },
    setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },
    getUser(): string | null {
        return localStorage.getItem(USER_KEY);
    },
    setUser(json: string): void {
        localStorage.setItem(USER_KEY, json);
    },
    clear(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};