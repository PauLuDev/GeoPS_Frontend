import { apiClient } from "@/shared/api/apiClient.ts";
import { normalizeAvatarUrl } from "@/shared/utils/avatar.ts";

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

/* quita la foto de stock que el back asigna al crear el perfil para que la UI
   muestre el placeholder con la inicial en su lugar */
const stripDefaultAvatar = (p: ProfileResource): ProfileResource =>
    ({ ...p, avatarUrl: normalizeAvatarUrl(p.avatarUrl) });

export const profileApi = {
    /* perfil del usuario logueado */
    me: () => apiClient.get<ProfileResource>("/auth/api/v1/profiles/me").then(stripDefaultAvatar),

    /* actualiza nombre, apellido y foto */
    update: (profileId: string, body: UpdateProfileBody) =>
        apiClient.put<ProfileResource>(`/auth/api/v1/profiles/${profileId}`, body).then(stripDefaultAvatar),
};
