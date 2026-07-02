import type { TFunction } from "i18next";
import { ApiError } from "./apiClient.ts";

/* error amigable para mostrar al usuario */
export interface AppError {
    message: string;
    status?: number;
}

/* status donde preferimos el mensaje específico del backend (validación / conflicto) */
const TRUSTED_BACKEND_STATUSES = [400, 409, 422];

function extractBackendMessage(body: unknown): string | undefined {
    if (!body) return undefined;
    if (typeof body === "string") return body.trim() || undefined;
    if (typeof body === "object") {
        const b = body as Record<string, unknown>;
        const msg = b.message ?? b.error ?? b.detail;
        if (typeof msg === "string" && msg.trim()) return msg.trim();
    }
    return undefined;
}

function isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError) return true;
    if (error instanceof Error && /fetch|network|failed to fetch/i.test(error.message)) return true;
    return false;
}

/* convierte cualquier error de API/red en un mensaje traducido y seguro */
export function mapApiError(error: unknown, t: TFunction<"translation", undefined>): AppError {
    if (error instanceof ApiError) {
        const backendMsg = extractBackendMessage(error.body);
        if (backendMsg && TRUSTED_BACKEND_STATUSES.includes(error.status)) {
            return { message: backendMsg, status: error.status };
        }
        const key = `errors.${error.status}`;
        return {
            message: t(key as any, { defaultValue: t("errors.default") }),
            status: error.status,
        };
    }
    if (isNetworkError(error)) {
        return { message: t("errors.network") };
    }
    return { message: t("errors.default") };
}
