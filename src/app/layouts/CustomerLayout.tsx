import { useNavigate } from "react-router-dom";
import { CustomerMap } from "@/features/coupons/presentation/views/CustomerMap.tsx";
import { useAuth } from "@/features/auth/presentation/hooks/useAuth.ts";

interface CustomerAppProps {
    onSwitchRole: () => void;
    mapEngine?: string;
    theme?: string;
    onThemeChange?: (t: string) => void;
}

export function CustomerLayout({ onSwitchRole, mapEngine = "osm", theme = "light", onThemeChange }: CustomerAppProps) {
    const navigate = useNavigate();
    const { signOut } = useAuth();
    /* limpia el token (localStorage) y la sesion de firebase (indexeddb) antes de navegar */
    const handleSignOut = async () => { await signOut(); navigate("/"); };

    return (
        <CustomerMap
            onSwitchRole={onSwitchRole}
            onSignOut={handleSignOut}
            mapEngine={mapEngine}
            theme={theme}
            onThemeChange={onThemeChange}
        />
    );
}