import { Navigate } from "react-router-dom";
import { getToken } from "@/shared/api/tokenStore.ts";
import { getCurrentUser } from "@/features/auth/application/session.ts";

/* redirige a "/" si no hay token de sesion, evitando que /business y /customer
   se rendericen sin estar logueado (el back igual rechaza, pero sin esto el
   usuario ve la pantalla vacia con errores 401 en vez del login) */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = getToken();
    const user = getCurrentUser();
    if (!token || !user) return <Navigate to="/" replace />;
    return <>{children}</>;
}
