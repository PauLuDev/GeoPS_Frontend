import { apiClient } from "@/shared/api/apiClient.ts";
import { UserResource } from "../../application/dtos/UserResource.ts";

/* llama al registro de auth y devuelve la forma cruda */

/* datos para crear el usuario */
export interface SignUpBody {
    username: string;
    firebaseUid: string;
    roles: string[];
    name: string;
    lastname: string;
}

export const authApi = {
    /* registra el usuario despues del alta en firebase */
    signUp: (body: SignUpBody) =>
        apiClient.post<UserResource>("/auth/api/v1/auth/sign-up", body),
};