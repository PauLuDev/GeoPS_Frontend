import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CustomerLayout } from "@/app/layouts/CustomerLayout.tsx";
import { BusinessLayout } from "@/app/layouts/BusinessLayout.tsx";
import { ProtectedRoute } from "@/app/router/ProtectedRoute.tsx";
import { AuthScreen } from "@/features/auth/presentation/views/AuthScreen.tsx";
import { RegisterBusiness } from "@/features/establishments/presentation/views/RegisterBusiness.tsx";
import { ChoosePlanView } from "@/features/billing/presentation/views/ChoosePlanView.tsx";
import { useEstablishments } from "@/features/establishments/presentation/hooks/useEstablishments.ts";
import { Business } from "@/shared/types.ts";
import { getToken } from "@/shared/api/tokenStore.ts";
import { getCurrentUser } from "@/features/auth/application/session.ts";

interface AppRouterProps {
    theme?: string;
    onThemeChange?: (t: 'light' | 'dark') => void;
}

/* pantalla de autenticacion (landing) */
function AuthView() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("signin");

    useEffect(() => {
        if (!getToken()) return;
        const user = getCurrentUser();
        const roles = user?.roles ?? [];
        const asOwner = roles.includes("ROLE_OWNER") || roles.includes("ROLE_BUSINESS");
        navigate(asOwner ? "/business" : "/customer", { replace: true });
    }, [navigate]);

    const handleSuccess = (asOwner: boolean) => {
        if (!asOwner) {
            navigate('/customer');                 // cliente
        } else if (mode === 'signup') {
            navigate('/business/register');        // dueno nuevo -> registra su negocio
        } else {
            navigate('/business');                 // dueno existente -> panel
        }
    };

    return (
        <AuthScreen mode={mode} setMode={setMode} onSuccess={handleSuccess} />
    );
}

function RegisterBusinessView() {
    const navigate = useNavigate();
    const { save } = useEstablishments();
    /* guarda el establecimiento nuevo y luego pasa a elegir plan */
    const handleDone = (b: Business) => {
        save(b)
            .then(() => navigate('/business/plan'))
            .catch(err => {
                console.error("Error al guardar el establecimiento:", err);
                alert("Hubo un error al guardar el negocio. Por favor, inténtelo de nuevo.");
            });
    };
    return (
        <RegisterBusiness
            onDone={handleDone}
            onBack={() => navigate('/')}
        />
    );
}

/* paso de plan tras el registro -> al elegir entra al panel */
function ChoosePlanRouteView() {
    const navigate = useNavigate();
    return <ChoosePlanView onDone={() => navigate('/business')} />;
}

function AppRoutes({ theme, onThemeChange }: AppRouterProps) {
    const navigate = useNavigate();
    return (
        <Routes>
            <Route path="/" element={<AuthView />} />
            <Route path="/business/register" element={<RegisterBusinessView />} />
            <Route path="/business/plan" element={<ChoosePlanRouteView />} />

            <Route path="/customer/*" element={
                <ProtectedRoute>
                    <CustomerLayout
                        onSwitchRole={() => navigate('/business')}
                        theme={theme}
                        onThemeChange={onThemeChange}
                    />
                </ProtectedRoute>
            }/>
            <Route path="/business/*" element={
                <ProtectedRoute>
                    <BusinessLayout
                        onSwitchRole={() => navigate('/customer')}
                        theme={theme}
                        onThemeChange={onThemeChange}
                    />
                </ProtectedRoute>
            }/>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export const AppRouter = (props: AppRouterProps) => (
    <BrowserRouter>
        <AppRoutes {...props} />
    </BrowserRouter>
);