import { getToken, setToken, clearToken } from "@/shared/api/tokenStore.ts";

/*
 guarda la sesion
 el token va al store compartido para que el apiClient lo use
 el user se guarda aparte
*/
const USER_KEY = "geops.auth.user";

export const TokenStorage = {
    getToken,
    setToken,
    getUser(): string | null {
        return localStorage.getItem(USER_KEY);
    },
    setUser(json: string): void {
        localStorage.setItem(USER_KEY, json);
    },
    clear(): void {
        clearToken();
        localStorage.removeItem(USER_KEY);
    },
};