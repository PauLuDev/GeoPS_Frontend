import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Campaign } from "@/features/campaigns/domain/entities/Campaign.ts";
import { CampaignCoupon } from "@/features/campaigns/domain/entities/CampaignCoupon.ts";
import { promotionLabel } from "@/features/campaigns/domain/value-objects/PromotionType.ts";

interface CampaignCouponsEditorProps {
    campaign: Campaign;
    /* cupones del mismo establecimiento que no estan en ninguna campana */
    unassignedCoupons: CampaignCoupon[];
    /* agrega un cupon existente a esta campana (PATCH campaignId) */
    onAddToCampaign: (couponId: string) => Promise<boolean>;
    /* quita el cupon de la campana sin borrarlo (PATCH campaignId null) */
    onRemoveFromCampaign: (couponId: string) => Promise<boolean>;
    /* elimina el cupon de verdad (DELETE) */
    onDeleteCoupon: (couponId: string) => Promise<boolean>;
}

/*
 gestiona los cupones de una campana desde el modal de edicion (vista del dueno)
 - la equis quita el cupon de la campana (sigue existiendo, sin campana)
 - el tacho lo elimina del todo
 - abajo se listan los cupones sin campana para sumarlos a esta
*/
export function CampaignCouponsEditor({
    campaign, unassignedCoupons, onAddToCampaign, onRemoveFromCampaign, onDeleteCoupon,
}: CampaignCouponsEditorProps) {
    const { t } = useTranslation();
    const [busy, setBusy] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const act = async (fn: () => Promise<boolean>, failMsg: string) => {
        if (busy) return;
        setBusy(true);
        setError(null);
        const ok = await fn();
        setBusy(false);
        setConfirmDelete(null);
        if (!ok) setError(failMsg);
    };

    return (
        <div className="cce">
            <div className="cce-head">
                <span className="cce-label">
                    {t("campaigns.couponsEditor.title")} <span className="cce-count">{campaign.coupons.length}</span>
                </span>
            </div>

            {error && <div className="cce-err"><Icon name="close" size={12}/> {error}</div>}

            {/* cupones que estan en la campana */}
            <div className="cce-list">
                {campaign.coupons.length === 0 ? (
                    <div className="cce-empty">{t("campaigns.couponsEditor.emptyCampaign")}</div>
                ) : campaign.coupons.map(cp => (
                    <div key={cp.id} className="cce-row">
                        <div className="cce-row-info">
                            <span className="cce-row-title">{cp.title}</span>
                            <span className="cce-row-meta">
                                {promotionLabel(cp.promotionType, t)} · {cp.discount} · Stock: {cp.stock}
                            </span>
                        </div>
                        {confirmDelete === cp.id ? (
                            <div className="cce-confirm">
                                <span>{t("campaigns.couponsEditor.confirmDelete")}</span>
                                <button type="button" className="btn btn-sm est-del-confirm" disabled={busy}
                                        onClick={() => void act(() => onDeleteCoupon(cp.id), t("campaigns.couponsEditor.errorDelete"))}>{t("campaigns.couponsEditor.yes")}</button>
                                <button type="button" className="btn btn-sm" disabled={busy}
                                        onClick={() => setConfirmDelete(null)}>{t("campaigns.couponsEditor.no")}</button>
                            </div>
                        ) : (
                            <div className="cce-row-actions">
                                <button type="button" className="btn btn-icon btn-sm" title={t("campaigns.couponsEditor.removeFromCampaign")}
                                        aria-label={t("campaigns.couponsEditor.removeFromCampaign")} disabled={busy}
                                        onClick={() => void act(() => onRemoveFromCampaign(cp.id), t("campaigns.couponsEditor.errorRemove"))}>
                                    <Icon name="close" size={13}/>
                                </button>
                                <button type="button" className="btn btn-icon btn-sm est-del-btn" title={t("campaigns.couponsEditor.deleteCoupon")}
                                        aria-label={t("campaigns.couponsEditor.deleteCoupon")} disabled={busy}
                                        onClick={() => setConfirmDelete(cp.id)}>
                                    <Icon name="trash" size={13}/>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* cupones existentes sin campana -> se pueden sumar a esta campana */}
            <div className="cce-head cce-head-sub">
                <span className="cce-label">
                    {t("campaigns.couponsEditor.unassigned")} <span className="cce-count">{unassignedCoupons.length}</span>
                </span>
            </div>
            <div className="cce-list">
                {unassignedCoupons.length === 0 ? (
                    <div className="cce-empty">{t("campaigns.couponsEditor.emptyUnassigned")}</div>
                ) : unassignedCoupons.map(cp => (
                    <div key={cp.id} className="cce-row">
                        <div className="cce-row-info">
                            <span className="cce-row-title">{cp.title}</span>
                            <span className="cce-row-meta">
                                {promotionLabel(cp.promotionType, t)} · {cp.discount} · Stock: {cp.stock}
                            </span>
                        </div>
                        <button type="button" className="btn btn-sm cce-add" title={t("campaigns.couponsEditor.add")}
                                disabled={busy}
                                onClick={() => void act(() => onAddToCampaign(cp.id), t("campaigns.couponsEditor.errorAdd"))}>
                            <Icon name="plus" size={12}/> {t("campaigns.couponsEditor.add")}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
