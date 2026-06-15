import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MerchantSidebar } from "@/features/campaigns/presentation/components/MerchantSidebar.tsx";
import { MerchantTopbar } from "@/features/campaigns/presentation/components/MerchantTopbar.tsx";
import { MerchantDashboard } from "@/features/analytics/presentation/views/MerchantDashboard.tsx";
import { CampaignsList } from "@/features/campaigns/presentation/views/CampaignsList.tsx";
import { CampaignDetail } from "@/features/campaigns/presentation/views/CampaignDetail.tsx";
import { NewCampaign } from "@/features/campaigns/presentation/views/NewCampaign.tsx";
import { CouponsManagement } from "@/features/campaigns/presentation/views/CouponsManagement.tsx";
import { RedeemView } from "@/features/coupons/presentation/views/RedeemView.tsx";
import { useCampaigns } from "@/features/campaigns/presentation/hooks/useCampaigns.ts";
import { Campaign } from "@/features/campaigns/domain/entities/Campaign.ts";
import { EstablishmentsView } from "@/features/establishments/presentation/views/EstablishmentsView.tsx";
import { useEstablishments } from "@/features/establishments/presentation/hooks/useEstablishments.ts";
import { AccountView } from "@/features/billing/presentation/views/AccountView.tsx";
import { MerchantProfileView } from "@/features/billing/presentation/views/MerchantProfileView.tsx";
import { canCreateCampaign, campaignLimitFor } from "@/features/billing/domain/value-objects/PlanLimits.ts";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { Icon } from "@/shared/ui/components/Icon.tsx";

interface BusinessLayoutProps {
    onSwitchRole: () => void;
    mapEngine?: string;
    theme?: string;
    onThemeChange?: (t: string) => void;
}

export function BusinessLayout({ onSwitchRole, mapEngine = "osm", theme = "light", onThemeChange }: BusinessLayoutProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [view, setView] = useState("dashboard");
    const [currentPlan, setCurrentPlan] = useState({ id: "plan-freemium", name: "Freemium" });
    const [limitReached, setLimitReached] = useState(false);
    const [confirmSignOut, setConfirmSignOut] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const { campaigns, addCampaign, removeCampaign } = useCampaigns();
    const { establishments, save: saveEstablishment, remove: removeEstablishment } = useEstablishments();

    /* restriccion del plan -> campanas activas (no finalizadas) */
    const activeCampaigns = campaigns.filter(c => c.status !== "ended").length;
    const planLimit = campaignLimitFor(currentPlan.id);
    const allowNewCampaign = canCreateCampaign(currentPlan.id, activeCampaigns);

    /* intento de crear campana -> respeta el limite del plan */
    const handleNew = () => {
        if (allowNewCampaign) setView("new");
        else setLimitReached(true);
    };

    const handleDone = (campaign: Campaign) => {
        void addCampaign(campaign);
        setView("campaigns");
    };

    /* desactivar -> marca la campana como expirada, no se puede reactivar */
    const handleDeactivate = (id: number) => {
        void removeCampaign(id);
    };

    return (
        <div className="merchant-app">
            <MerchantSidebar view={view} setView={setView} onSwitchRole={onSwitchRole} onSignOut={() => setConfirmSignOut(true)}/>
            <main className="merchant-main">
                <MerchantTopbar
                    onAccount={() => setView("account")}
                    onSwitchRole={onSwitchRole}
                    onSignOut={() => setConfirmSignOut(true)}
                />
                {view === "dashboard" && (
                    <MerchantDashboard
                        onNew={handleNew}
                        establishmentId={establishments[0]?.id ?? ""}
                        establishmentName={establishments[0]?.name ?? ""}
                    />
                )}
                {view === "campaigns" && (
                    <CampaignsList
                        campaigns={campaigns}
                        onNew={handleNew}
                        onOpen={(c) => { setSelectedCampaign(c); setView("campaign-detail"); }}
                        onDeactivate={handleDeactivate}
                        onDelete={removeCampaign}
                    />
                )}
                {view === "campaign-detail" && selectedCampaign && (
                    <CampaignDetail
                        campaign={selectedCampaign}
                        onBack={() => { setSelectedCampaign(null); setView("campaigns"); }}
                    />
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
                {view === "coupons" && (
                    <CouponsManagement/>
                )}
                {view === "redeem" && (
                    <RedeemView/>
                )}
                {view === "subscription" && (
                    <AccountView
                        establishmentCount={establishments.length}
                        currentPlanId={currentPlan.id}
                        onPlanChange={setCurrentPlan}
                    />
                )}
                {view === "account" && (
                    <MerchantProfileView
                        theme={theme}
                        onThemeChange={onThemeChange}
                        onSignOut={() => navigate("/")}
                    />
                )}
            </main>

            {/* confirmacion de cerrar sesion (sidebar / topbar) */}
            {confirmSignOut && (
                <Modal onClose={() => setConfirmSignOut(false)} ariaLabel={t("profile.signOutConfirmTitle")} className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon"><Icon name="arrowLeft" size={20}/></div>
                        <h3 className="est-modal-title">{t("profile.signOutConfirmTitle")}</h3>
                        <p className="est-modal-text">{t("profile.signOutConfirmText")}</p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setConfirmSignOut(false)}>{t("common.cancel")}</button>
                            <button type="button" className="btn est-del-confirm est-modal-btn" onClick={() => navigate("/")}>{t("profile.signOutConfirm")}</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* limite de campanas del plan freemium */}
            {limitReached && (
                <Modal onClose={() => setLimitReached(false)} ariaLabel="Límite del plan alcanzado" className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon"><Icon name="flag" size={20}/></div>
                        <h3 className="est-modal-title">Límite del plan {currentPlan.name}</h3>
                        <p className="est-modal-text">
                            Tu plan <strong>{currentPlan.name}</strong> permite hasta <strong>{planLimit}</strong> campañas
                            activas a la vez y ya tienes <strong>{activeCampaigns}</strong>. Mejora a <strong>Premium</strong> para
                            crear campañas ilimitadas, o finaliza/elimina una campaña activa.
                        </p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setLimitReached(false)}>
                                Entendido
                            </button>
                            <button type="button" className="btn btn-brand est-modal-btn"
                                    onClick={() => { setLimitReached(false); setView("subscription"); }}>
                                <Icon name="arrowRight" size={14}/> Ver planes
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}