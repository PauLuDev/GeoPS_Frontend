import { useEffect, useState } from "react";
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
import { useCoupons } from "@/features/coupons/presentation/hooks/useCoupons.ts";
import { useRegisteredCoupons } from "@/features/campaigns/presentation/hooks/useRegisteredCoupons.ts";
import { useProfile } from "@/features/auth/presentation/hooks/useProfile.ts";
import { Campaign } from "@/features/campaigns/domain/entities/Campaign.ts";
import { EstablishmentsView } from "@/features/establishments/presentation/views/EstablishmentsView.tsx";
import { useEstablishments } from "@/features/establishments/presentation/hooks/useEstablishments.ts";
import { AccountView } from "@/features/billing/presentation/views/AccountView.tsx";
import { MerchantProfileView } from "@/features/billing/presentation/views/MerchantProfileView.tsx";
import { useBilling } from "@/features/billing/presentation/hooks/useBilling.ts";
import { CurrentSubscription, withinLimit } from "@/features/billing/domain/entities/CurrentSubscription.ts";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { BrandMark } from "@/shared/ui/components/BrandMark.tsx";
import { firebaseRefreshToken } from "@/features/auth/infrastructure/firebaseAuth.ts";
import { setToken } from "@/shared/api/tokenStore.ts";
import { useAuth } from "@/features/auth/presentation/hooks/useAuth.ts";

interface BusinessLayoutProps {
    onSwitchRole: () => void;
    mapEngine?: string;
    theme?: string;
    onThemeChange?: (t: string) => void;
}

export function BusinessLayout({ onSwitchRole, mapEngine = "osm", theme = "light", onThemeChange }: BusinessLayoutProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { signOut } = useAuth();
    /* limpia el token (localStorage) y la sesion de firebase (indexeddb) antes de navegar */
    const handleSignOut = async () => { await signOut(); navigate("/"); };
    const [view, setView] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    /* navegar desde el sidebar tambien cierra el drawer en mobile */
    const selectView = (v: string) => { setView(v); setSidebarOpen(false); };
    const [limitReached, setLimitReached] = useState(false);
    const [campaignError, setCampaignError] = useState(false);
    const [confirmSignOut, setConfirmSignOut] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const { campaigns, addCampaign, updateCampaign, removeCampaign, reload: reloadCampaigns } = useCampaigns();
    const { changeCampaign: changeCouponCampaign, remove: removeCoupon } = useCoupons();
    const { coupons: registeredCoupons, reload: reloadRegisteredCoupons } = useRegisteredCoupons();
    const { profile, setProfile } = useProfile();
    const { establishments, save: saveEstablishment, remove: removeEstablishment } = useEstablishments();

    /* refresca las dos vistas afectadas tras mover/eliminar un cupon */
    const reloadCoupons = async () => { await Promise.all([reloadCampaigns(), reloadRegisteredCoupons()]); };

    /* cupones del dueno que no estan en ninguna campana (para sumarlos a una) */
    const unassignedCoupons = registeredCoupons.filter(c => !c.campaignId);

    /* al entrar al panel, refresca el token para traer los claims actuales
       (ej. ROLE_PREMIUM recien asignado tras pagar). sin esto, el back rechaza
       crear campanas/cupones porque el token guardado tiene el rol viejo */
    useEffect(() => {
        firebaseRefreshToken().then(tk => { if (tk) setToken(tk); }).catch(() => {});
    }, []);

    /* suscripcion activa con sus limites reales */
    const { currentSubscription } = useBilling();
    const [sub, setSub] = useState<CurrentSubscription | null>(null);
    useEffect(() => {
        currentSubscription().then(s => { if (s) setSub(s); });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* restriccion del plan -> campanas activas (no finalizadas) vs el limite real */
    const activeCampaigns = campaigns.filter(c => c.status !== "ended").length;
    const planLimit = sub?.limits.maxActiveCampaigns ?? 0;
    const planName = sub?.planName ?? "Freemium";
    const allowNewCampaign = withinLimit(planLimit, activeCampaigns);

    /* intento de crear campana -> respeta el limite del plan.
       refresca la suscripcion primero por si recien se hizo upgrade (asi no usa
       el limite viejo cacheado y no obliga a recargar la pagina) */
    const handleNew = async () => {
        /* token fresco (rol actual) + suscripcion fresca antes de entrar al form */
        const freshToken = await firebaseRefreshToken().catch(() => null);
        if (freshToken) setToken(freshToken);
        const fresh = await currentSubscription().catch(() => null);
        if (fresh) setSub(fresh);
        const limit = (fresh ?? sub)?.limits.maxActiveCampaigns ?? 0;
        if (withinLimit(limit, activeCampaigns)) setView("new");
        else setLimitReached(true);
    };

    const handleDone = async (campaign: Campaign) => {
        const establishmentId = establishments[0]?.id;
        if (!establishmentId) { setView("establishments"); return; }
        const ok = await addCampaign({ ...campaign, establishmentId });
        if (ok) setView("campaigns");
        else setCampaignError(true);
    };

    /* desactivar -> marca la campana como expirada, no se puede reactivar */
    const handleDeactivate = (id: number) => {
        void removeCampaign(id);
    };

    /* agregar un cupon existente (sin campana) a esta campana -> PATCH campaignId */
    const handleAddCouponToCampaign = async (campaign: Campaign, couponId: string): Promise<boolean> => {
        if (!campaign.uuid) return false;
        const res = await changeCouponCampaign(couponId, campaign.uuid);
        if (res === null) return false;
        await reloadCoupons();
        return true;
    };

    /* quitar un cupon de la campana sin borrarlo -> PATCH campaignId null */
    const handleRemoveCouponFromCampaign = async (couponId: string): Promise<boolean> => {
        const res = await changeCouponCampaign(couponId, null);
        if (res === null) return false;
        await reloadCoupons();
        return true;
    };

    /* eliminar el cupon de verdad -> DELETE */
    const handleDeleteCoupon = async (couponId: string): Promise<boolean> => {
        const res = await removeCoupon(couponId);
        if (res === null) return false;
        await reloadCoupons();
        return true;
    };

    return (
        <div className="merchant-app">
            <MerchantSidebar view={view} setView={selectView} onSwitchRole={onSwitchRole} onSignOut={() => setConfirmSignOut(true)} campaignCount={campaigns.length}
                             open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
            <main className="merchant-main">
                {/* barra superior solo en mobile: hamburguesa para abrir el menu */}
                <div className="msb-mobile-bar">
                    <button type="button" className="msb-hamburger" aria-label="Abrir menú" onClick={() => setSidebarOpen(true)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                    </button>
                    <div className="brand"><BrandMark/><span>GeoPS</span></div>
                </div>
                <MerchantTopbar
                    onAccount={() => setView("account")}
                    onSwitchRole={onSwitchRole}
                    onSignOut={() => setConfirmSignOut(true)}
                    profile={profile}
                />
                {view === "dashboard" && (
                    <MerchantDashboard
                        onNew={handleNew}
                        establishments={establishments.map(e => ({ id: e.id, name: e.name }))}
                    />
                )}
                {view === "campaigns" && (
                    <CampaignsList
                        campaigns={campaigns}
                        onNew={handleNew}
                        onOpen={(c) => { setSelectedCampaign(c); setView("campaign-detail"); }}
                        onDeactivate={handleDeactivate}
                        onDelete={removeCampaign}
                        onEdit={(id, data) => void updateCampaign(id, data)}
                        establishments={establishments.map(e => ({ id: e.id, name: e.name }))}
                        unassignedCoupons={unassignedCoupons}
                        onAddCouponToCampaign={handleAddCouponToCampaign}
                        onRemoveCouponFromCampaign={handleRemoveCouponFromCampaign}
                        onDeleteCoupon={handleDeleteCoupon}
                    />
                )}
                {view === "campaign-detail" && selectedCampaign && (
                    <CampaignDetail
                        campaign={selectedCampaign}
                        onBack={() => { setSelectedCampaign(null); setView("campaigns"); }}
                    />
                )}
                {view === "new" && (
                    <NewCampaign onDone={handleDone}/>
                )}
                {view === "establishments" && (
                    <EstablishmentsView
                        establishments={establishments}
                        onSave={saveEstablishment}
                        onDelete={removeEstablishment}
                        maxEstablishments={sub?.limits.maxEstablishments}
                        onUpgrade={() => setView("subscription")}
                    />
                )}
                {view === "coupons" && (
                    <CouponsManagement
                        registeredCoupons={registeredCoupons}
                        campaigns={campaigns}
                        onReload={reloadCoupons}
                    />
                )}
                {view === "redeem" && (
                    <RedeemView/>
                )}
                {view === "subscription" && (
                    <AccountView establishmentCount={establishments.length}/>
                )}
                {view === "account" && (
                    <MerchantProfileView
                        theme={theme}
                        onThemeChange={onThemeChange}
                        onSignOut={handleSignOut}
                        profileData={profile}
                        onProfileSaved={setProfile}
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
                            <button type="button" className="btn est-del-confirm est-modal-btn" onClick={handleSignOut}>{t("profile.signOutConfirm")}</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* error al crear campana (rechazo del backend) */}
            {campaignError && (
                <Modal onClose={() => setCampaignError(false)} ariaLabel="Error al crear campaña" className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon"><Icon name="close" size={20}/></div>
                        <h3 className="est-modal-title">No se pudo crear la campaña</h3>
                        <p className="est-modal-text">
                            No fue posible crear la campaña. Verifica que no hayas alcanzado el límite de tu plan o intenta de nuevo.
                        </p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setCampaignError(false)}>
                                Entendido
                            </button>
                            <button type="button" className="btn btn-brand est-modal-btn"
                                    onClick={() => { setCampaignError(false); setView("subscription"); }}>
                                <Icon name="arrowRight" size={14}/> Ver planes
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* limite de campanas del plan freemium */}
            {limitReached && (
                <Modal onClose={() => setLimitReached(false)} ariaLabel="Límite del plan alcanzado" className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon"><Icon name="flag" size={20}/></div>
                        <h3 className="est-modal-title">Límite del plan {planName}</h3>
                        <p className="est-modal-text">
                            Tu plan <strong>{planName}</strong> permite hasta <strong>{planLimit}</strong> campañas
                            activas a la vez y ya tienes <strong>{activeCampaigns}</strong>. Mejora tu plan para
                            crear más campañas, o finaliza/elimina una campaña activa.
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