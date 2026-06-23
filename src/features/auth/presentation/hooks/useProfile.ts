import { useCallback, useEffect, useState } from "react";
import { profileApi, ProfileResource } from "@/features/auth/infrastructure/api/profileApi.ts";

/* perfil del usuario logueado (nombre, apellido, foto), compartido por el topbar
   y la vista de perfil para que queden en sync al editar */
export function useProfile() {
    const [profile, setProfile] = useState<ProfileResource | null>(null);

    const reload = useCallback(() => {
        profileApi.me().then(setProfile).catch(() => { /* sin perfil */ });
    }, []);

    useEffect(() => { reload(); }, [reload]);

    return { profile, setProfile, reload };
}
