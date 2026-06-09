import { useState } from "react";
import { MerchantSidebar } from "@/features/campaigns/presentation/components/MerchantSidebar.tsx";
import { MerchantDashboard } from "@/features/analytics/presentation/views/MerchantDashboard.tsx";
import { CampaignsList } from "@/features/campaigns/presentation/views/CampaignsList.tsx";
import { NewCampaign } from "@/features/campaigns/presentation/views/NewCampaign.tsx";
import { useCampaigns } from "@/features/campaigns/presentation/hooks/useCampaigns.ts";
import { Campaign } from "@/features/campaigns/domain/entities/Campaign.ts";
import { EstablishmentsView } from "@/features/establishments/presentation/views/EstablishmentsView.tsx";
import { useEstablishments } from "@/features/establishments/presentation/hooks/useEstablishments.ts";

interface BusinessLayoutProps {
    onSwitchRole: () => void;
    mapEngine?: string;
    theme?: string;
}

export function BusinessLayout({ onSwitchRole, mapEngine = "osm", theme = "light" }: BusinessLayoutProps) {
    const [view, setView] = useState("dashboard");
    const { campaigns, addCampaign } = useCampaigns();
    const { establishments, save: saveEstablishment, remove: removeEstablishment } = useEstablishments();

    const handleDone = (campaign: Campaign) => {
        addCampaign(campaign);
        setView("campaigns");
    };

    return (
        <div className="merchant-app">
            <MerchantSidebar view={view} setView={setView} onSwitchRole={onSwitchRole}/>
            <main className="merchant-main">
                {view === "dashboard" && (
                    <MerchantDashboard onNew={() => setView("new")} mapEngine={mapEngine} theme={theme}/>
                )}
                {view === "campaigns" && (
                    <CampaignsList campaigns={campaigns} onNew={() => setView("new")}/>
                )}
                {view === "new" && (
                    <NewCampaign onDone={handleDone} onCancel={() => setView("campaigns")}/>
                )}
                {view === "establishments" && (
                    <EstablishmentsView
                        establishments={establishments}
                        onSave={saveEstablishment}
                        onDelete={removeEstablishment}
                    />
                )}
            </main>
        </div>
    );
}