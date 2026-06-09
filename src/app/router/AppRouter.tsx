import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CustomerLayout } from "@/app/layouts/CustomerLayout.tsx";
import { BusinessLayout } from "@/app/layouts/BusinessLayout.tsx";
import { AuthScreen } from "@/features/iam/presentation/views/AuthScreen.tsx";
import { RegisterBusiness } from "@/features/establishments/presentation/views/RegisterBusiness.tsx";

interface AppRouterProps {
    theme?: string;
    onThemeChange?: (t: 'light' | 'dark') => void;
}

/* pantalla de autenticacion (landing) */
function AuthView() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("signin");

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

/* registro de negocio */
function RegisterBusinessView() {
    const navigate = useNavigate();
    return (
        <RegisterBusiness
            onDone={() => navigate('/business')}
            onBack={() => navigate('/')}
        />
    );
}

function AppRoutes({ theme, onThemeChange }: AppRouterProps) {
    const navigate = useNavigate();
    return (
        <Routes>
            <Route path="/" element={<AuthView />} />
            <Route path="/business/register" element={<RegisterBusinessView />} />

            <Route path="/customer/*" element={
                <CustomerLayout
                    onSwitchRole={() => navigate('/business')}
                    theme={theme}
                    onThemeChange={onThemeChange}
                />
            }/>
            <Route path="/business/*" element={
                <BusinessLayout
                    onSwitchRole={() => navigate('/customer')}
                    theme={theme}
                />
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