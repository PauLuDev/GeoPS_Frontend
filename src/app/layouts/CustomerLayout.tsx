import {useState} from "react";
import {AuthScreen} from "@/features/iam/presentation/views/AuthScreen.tsx";
import {Onboarding} from "@/features/iam/presentation/views/Onboarding.tsx";
import {CustomerMap} from "@/features/coupons/presentation/views/CustomerMap.tsx";

interface CustomerAppProps {
    onSwitchRole: () => void;
    mapEngine?: string;
    theme?: string;
    onThemeChange?: (t: string) => void;
}

export function CustomerLayout({ onSwitchRole, mapEngine = "osm", theme = "light", onThemeChange }: CustomerAppProps) {
    const [stage, setStage] = useState<"onboarding" | "login" | "app">("onboarding");
    const [authMode, setAuthMode] = useState("signin");

    if (stage === "onboarding") {
        return <Onboarding onContinue={() => setStage("login")} onSkip={() => setStage("app")}/>;
    }
    if (stage === "login") {
        return <AuthScreen mode={authMode} setMode={setAuthMode} onSuccess={() => setStage("app")} onBack={() => setStage("onboarding")} onSwitchRole={onSwitchRole}/>;
    }
    return <CustomerMap onSwitchRole={onSwitchRole} onSignOut={() => setStage("login")} mapEngine={mapEngine} theme={theme} onThemeChange={onThemeChange}/>;
}