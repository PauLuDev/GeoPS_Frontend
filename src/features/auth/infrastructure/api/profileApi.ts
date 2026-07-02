import { apiClient } from "@/shared/api/apiClient.ts";

/* perfil del usuario (iam-service · contexto profiles), via gateway /auth/** */
export interface ProfileResource {
    profileId: string;
    userId: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
}

/* body de actualizacion (firstName/lastName obligatorios, avatarUrl opcional) */
export interface UpdateProfileBody {
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
}

export const profileApi = {
    /* perfil del usuario logueado */
    me: () => apiClient.get<ProfileResource>("/auth/api/v1/profiles/me"),

    /* actualiza nombre, apellido y foto */
    update: (profileId: string, body: UpdateProfileBody) =>
        apiClient.put<ProfileResource>(`/auth/api/v1/profiles/${profileId}`, body),
};

