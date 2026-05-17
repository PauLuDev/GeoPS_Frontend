import {useState} from "react";
import {MerchantSidebar} from "@/app/features/merchant/presentation/components/MerchantSidebar.tsx";
import {MerchantDashboard} from "@/app/features/merchant/presentation/views/MerchantDashboard.tsx";
import {CampaignsList} from "@/app/features/merchant/presentation/views/CampaignsList.tsx";
import {NewCampaign} from "@/app/features/merchant/presentation/views/NewCampaign.tsx";

interface MerchantAppProps {
    onSwitchRole: () => void;
    mapEngine?: string;
    theme?: string;
}

export function MerchantApp({ onSwitchRole, mapEngine = "osm", theme = "light" }: MerchantAppProps) {
    const [view, setView] = useState("dashboard");

    return (
        <div className="merchant-app">
            <MerchantSidebar view={view} setView={setView} onSwitchRole={onSwitchRole}/>
            <main className="merchant-main">
                {view === "dashboard" && <MerchantDashboard onNew={() => setView("new")} mapEngine={mapEngine} theme={theme}/>}
                {view === "campaigns" && <CampaignsList onNew={() => setView("new")}/>}
                {view === "new" && <NewCampaign onDone={() => setView("campaigns")} onCancel={() => setView("dashboard")}/>}
            </main>
            <style>{`
        .merchant-app { display: grid; grid-template-columns: 232px 1fr; min-height: 100vh; background: var(--bg-sunken); }
        @media (max-width: 880px) { .merchant-app { grid-template-columns: 1fr; } }
        .merchant-main { min-width: 0; min-height: 100vh; overflow-x: hidden; }
      `}</style>
        </div>
    );
}