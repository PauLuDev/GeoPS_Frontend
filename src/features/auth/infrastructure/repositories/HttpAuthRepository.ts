import { User } from "../../domain/entities/User.ts";
import { Role } from "../../domain/value-objects/Role.ts";
import { SignUpData, SignInData, IAuthRepository } from "../../domain/repositories/IAuthRepository.ts";
import { toUser } from "../../application/mappers/UserMapper.ts";
import { TokenStorage } from "../TokenStorage.ts";
import { firebaseSignUp, firebaseSignIn, firebaseSignOut, isFirebaseConfigured } from "../firebaseAuth.ts";
import { authApi } from "../api/authApi.ts";

/*
 implementa el puerto de auth
 registro -> crea la cuenta en firebase y la registra
 login -> valida con firebase y guarda el token
*/
export class HttpAuthRepository implements IAuthRepository {

    async signUp(data: SignUpData): Promise<User> {
        if (!isFirebaseConfigured()) return this.devUser(data.username, data.roles, data.email);

        /* 1) crear la cuenta en firebase */
        const session = await firebaseSignUp(data.email, data.password);
        TokenStorage.setToken(session.idToken);

        /* 2) registrar el usuario */
        const resource = await authApi.signUp({
            username: data.username,
            firebaseUid: session.uid,
            roles: data.roles,
            name: data.name,
            lastname: data.lastname,
        });

        const user = toUser(resource);
        TokenStorage.setUser(JSON.stringify(user));
        return user;
    }

    async signIn(data: SignInData): Promise<User> {
        if (!isFirebaseConfigured()) return this.devUser(data.email.split("@")[0], data.roles, data.email);

        /* firebase valida las credenciales y entrega el id token */
        const session = await firebaseSignIn(data.email, data.password);
        TokenStorage.setToken(session.idToken);

        /* por ahora el usuario se arma desde firebase */
        const user: User = {
            id: session.uid,
            username: (session.email ?? data.email).split("@")[0],
            roles: data.roles as Role[],
        };
        TokenStorage.setUser(JSON.stringify(user));
        return user;
    }

    /* modo dev -> si no hay firebase, crea un usuario local falso para entrar y trabajar la ui sin backend */
    private devUser(username: string, roles: Role[], email?: string): User {
        const user: User = { id: `dev-${Date.now()}`, username, roles };
        TokenStorage.setToken("dev-token");
        /* guardamos tambien el email para que perfil/topbar lo muestren en modo dev */
        TokenStorage.setUser(JSON.stringify({ ...user, email }));
        return user;
    }

    async signOut(): Promise<void> {
        await firebaseSignOut();
        TokenStorage.clear();
    }

    currentUser(): User | null {
        const raw = TokenStorage.getUser();
        return raw ? (JSON.parse(raw) as User) : null;
    }
}