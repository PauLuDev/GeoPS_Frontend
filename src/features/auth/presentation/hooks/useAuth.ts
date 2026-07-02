import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { User } from "../../domain/entities/User.ts";
import { Role } from "../../domain/value-objects/Role.ts";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository.ts";
import { HttpAuthRepository } from "../../infrastructure/repositories/HttpAuthRepository.ts";
import { signIn as signInUseCase } from "../../application/use-cases/SignIn.ts";
import { signUp as signUpUseCase } from "../../application/use-cases/SignUp.ts";
import { signOut as signOutUseCase } from "../../application/use-cases/SignOut.ts";
import { mapApiError, AppError } from "@/shared/api/errorMapper.ts";

/**
 * hook de presentacion: expone el estado de sesion y las acciones de auth,
 * apoyandose en los use-cases y el repositorio
 */
export function useAuth(repository?: IAuthRepository) {
    const { t } = useTranslation();
    const repoRef = useRef<IAuthRepository>(repository ?? new HttpAuthRepository());
    const [user, setUser]       = useState<User | null>(() => repoRef.current.currentUser());
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<AppError | null>(null);

    const run = async (action: () => Promise<User>): Promise<User | null> => {
        setLoading(true);
        setError(null);
        try {
            const u = await action();
            setUser(u);
            return u;
        } catch (e) {
            setError(mapApiError(e, t));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const signIn = (email: string, password: string, roles: Role[]) =>
        run(() => signInUseCase(repoRef.current, email, password, roles));

    const signUp = (name: string, lastName: string, email: string, password: string, roles: Role[]) =>
        run(() => signUpUseCase(repoRef.current, name, lastName, email, password, roles));

    const signOut = async () => {
        await signOutUseCase(repoRef.current);
        setUser(null);
    };

    return { user, loading, error, signIn, signUp, signOut };
}