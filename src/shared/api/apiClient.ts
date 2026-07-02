import { getToken } from "./tokenStore";

/* cliente http hacia el api-gateway, mete el token y maneja errores */
const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

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

export class ApiError extends Error {
    constructor(public status: number, message: string, public body?: unknown) {
        super(message);
        this.name = "ApiError";
    }
}

interface RequestOptions {
    headers?: Record<string, string>;
    signal?: AbortSignal;
    /** no adjuntar el token (ej. login/registro) */
    skipAuth?: boolean;
}

async function request<T>(method: string, path: string, body?: unknown, opts: RequestOptions = {}): Promise<T> {
    const token = opts.skipAuth ? null : getToken();
    const headers: Record<string, string> = {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers ?? {}),
    };

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: opts.signal,
    });

    if (!res.ok) {
        let errBody: unknown;
        try { errBody = await res.json(); } catch { /* respuesta sin cuerpo JSON */ }
        const backendMsg = extractBackendMessage(errBody);
        throw new ApiError(res.status, backendMsg ?? `${method} ${path} -> ${res.status}`, errBody);
    }

    if (res.status === 204) return undefined as T;
    const contentType = res.headers.get("content-type") ?? "";
    return (contentType.includes("application/json") ? await res.json() : await res.text()) as T;
}

export const apiClient = {
    get:    <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, undefined, opts),
    post:   <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("POST", path, body, opts),
    put:    <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PUT", path, body, opts),
    patch:  <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PATCH", path, body, opts),
    delete: <T>(path: string, opts?: RequestOptions) => request<T>("DELETE", path, undefined, opts),
};