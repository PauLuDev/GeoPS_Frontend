import {useState} from "react";
import {MerchantSidebar} from "@/features/campaigns/presentation/components/MerchantSidebar.tsx";
import {MerchantDashboard} from "@/features/analytics/presentation/views/MerchantDashboard.tsx";
import {CampaignsList} from "@/features/campaigns/presentation/views/CampaignsList.tsx";
import {NewCampaign} from "@/features/campaigns/presentation/views/NewCampaign.tsx";

interface BusinessLayoutProps {
    onSwitchRole: () => void;
    mapEngine?: string;
    theme?: string;
}

export function BusinessLayout({ onSwitchRole, mapEngine = "osm", theme = "light" }: BusinessLayoutProps) {
    const [view, setView] = useState("dashboard");

    return (
        <div className="merchant-app">
            <MerchantSidebar view={view} setView={setView} onSwitchRole={onSwitchRole}/>
            <main className="merchant-main">
                {view === "dashboard" && <MerchantDashboard onNew={() => setView("new")} mapEngine={mapEngine} theme={theme}/>}
                {view === "campaigns" && <CampaignsList onNew={() => setView("new")}/>}
                {view === "new" && <NewCampaign onDone={() => setView("campaigns")} onCancel={() => setView("dashboard")}/>}
            </main>
        </div>
    );
}