import { User } from "../../domain/entities/User.ts";
import { SignUpData, SignInData, IAuthRepository } from "../../domain/repositories/IAuthRepository.ts";
import { UserResource } from "../../application/dtos/UserResource.ts";
import { toUser } from "../../application/mappers/UserMapper.ts";
import { TokenStorage } from "../TokenStorage.ts";

/* base del API IAM */
const API_BASE = import.meta.env.VITE_IAM_URL ?? "http://localhost:8081/api/v1";

/**
 * implementacion del repositorio de autenticacion contra el backend (HTTP)
 * contrato real (iam-service):
 *  - el login/registro de credenciales lo maneja **Firebase** en el cliente
 *  - tras el registro en Firebase -> POST /api/v1/auth/sign-up con el firebaseUid
 *  - en cada request autenticada -> header `Authorization: Bearer <idToken>`
 */
export class HttpAuthRepository implements IAuthRepository {

    async signUp(data: SignUpData): Promise<User> {
        void API_BASE;
        const resource: UserResource = {
            id: cryptoRandomId(),
            username: data.username,
            roles: data.roles,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const user = toUser(resource);
        this.persist(user);
        return user;
    }

    async signIn(data: SignInData): Promise<User> {
        const resource: UserResource = {
            id: cryptoRandomId(),
            username: data.email.split("@")[0],
            roles: data.roles,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const user = toUser(resource);
        this.persist(user);
        return user;
    }

    async signOut(): Promise<void> {
        TokenStorage.clear();
    }

    currentUser(): User | null {
        const raw = TokenStorage.getUser();
        return raw ? (JSON.parse(raw) as User) : null;
    }

    private persist(user: User): void {
        TokenStorage.setToken(`mock-token-${user.id}`);   // sera el ID token de Firebase
        TokenStorage.setUser(JSON.stringify(user));
    }
}

function cryptoRandomId(): string {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `u-${Date.now()}`;
}