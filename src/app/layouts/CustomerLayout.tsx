import { useNavigate } from "react-router-dom";
import { CustomerMap } from "@/features/coupons/presentation/views/CustomerMap.tsx";

interface CustomerAppProps {
    onSwitchRole: () => void;
    mapEngine?: string;
    theme?: string;
    onThemeChange?: (t: string) => void;
}

export function CustomerLayout({ onSwitchRole, mapEngine = "osm", theme = "light", onThemeChange }: CustomerAppProps) {
    const navigate = useNavigate();

    return (
        <CustomerMap
            onSwitchRole={onSwitchRole}
            onSignOut={() => navigate("/")}
            mapEngine={mapEngine}
            theme={theme}
            onThemeChange={onThemeChange}
        />
    );
}