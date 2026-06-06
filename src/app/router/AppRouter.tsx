import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CustomerLayout } from "@/app/layouts/CustomerLayout.tsx";
import { BusinessLayout } from "@/app/layouts/BusinessLayout.tsx";

interface AppRouterProps {
    theme?: string;
    onThemeChange?: (t: 'light' | 'dark') => void;
}

function AppRoutes({ theme, onThemeChange }: AppRouterProps) {
    const navigate = useNavigate();
    return (
        <Routes>
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
            <Route path="*" element={<Navigate to="/customer" replace />} />
        </Routes>
    );
}

export const AppRouter = (props: AppRouterProps) => (
    <BrowserRouter>
        <AppRoutes {...props} />
    </BrowserRouter>
);