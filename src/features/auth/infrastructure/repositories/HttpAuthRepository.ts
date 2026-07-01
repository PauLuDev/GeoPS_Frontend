import { User } from "../../domain/entities/User.ts";
import { Role } from "../../domain/value-objects/Role.ts";
import { SignUpData, SignInData, IAuthRepository } from "../../domain/repositories/IAuthRepository.ts";
import { toUser } from "../../application/mappers/UserMapper.ts";
import { TokenStorage } from "../TokenStorage.ts";
import { firebaseSignUp, firebaseSignIn, firebaseSignOut, firebaseRefreshToken, isFirebaseConfigured } from "../firebaseAuth.ts";
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
        await authApi.signUp({
            username: data.username,
            firebaseUid: session.uid,
            roles: data.roles,
            name: data.name,
            lastname: data.lastname,
        });

        /* 3) Hacer auto-login: iniciamos sesión con las credenciales registradas
           para obtener un token fresco con todos los custom claims (userId y roles) */
        return this.signIn({ email: data.email, password: data.password, roles: data.roles });
    }

    async signIn(data: SignInData): Promise<User> {
        if (!isFirebaseConfigured()) return this.devUser(data.email.split("@")[0], data.roles, data.email);

        /* firebase valida las credenciales y entrega el id token */
        const session = await firebaseSignIn(data.email, data.password);
        TokenStorage.setToken(session.idToken);

        /* el usuario se arma desde los custom claims del token: userId es el UUID
           del IAM (el mismo con que se guardan establecimientos/campanas), no el
           uid de firebase. los roles tambien salen del claim */
        const user: User = {
            id: session.userId,
            username: (session.email ?? data.email).split("@")[0],
            roles: (session.roles.length ? session.roles : data.roles) as Role[],
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