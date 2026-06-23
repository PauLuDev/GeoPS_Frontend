import { useState } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Select } from "@/shared/ui/components/Select.tsx";
import { DatePicker } from "@/shared/ui/components/DatePicker.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { CampaignCoupon } from "@/features/campaigns/domain/entities/CampaignCoupon.ts";
import { Campaign } from "@/features/campaigns/domain/entities/Campaign.ts";
import { PromotionType, PROMOTION_TYPES } from "@/features/campaigns/domain/value-objects/PromotionType.ts";
import { useCoupons } from "@/features/coupons/presentation/hooks/useCoupons.ts";

interface EditCouponModalProps {
    coupon: CampaignCoupon;
    /* campanas del dueno para reasignar la campana del cupon (vacio = sin selector) */
    campaigns?: Campaign[];
    onSaved: () => void;
    onClose: () => void;
}

/* edita un cupon en el back (PUT /coupons/{id}); el stock no se edita.
   tambien permite reasignar la campana (PATCH /coupons/{id}/campaign), o dejarlo sin campana */
export function EditCouponModal({ coupon, campaigns = [], onSaved, onClose }: EditCouponModalProps) {
    const { update, changeCampaign, loading, error } = useCoupons();

    /* solo las campanas del mismo establecimiento que el cupon (si se conoce) */
    const assignable = coupon.establishmentId
        ? campaigns.filter(c => c.establishmentId === coupon.establishmentId)
        : campaigns;

    const [title, setTitle]               = useState(coupon.title);
    const [promotionType, setPromotionType] = useState<PromotionType>(coupon.promotionType);
    const [discountValue, setDiscountValue] = useState(coupon.discountValue != null ? String(coupon.discountValue) : "");
    const [minPurchase, setMinPurchase]   = useState(coupon.minPurchaseAmount != null ? String(coupon.minPurchaseAmount) : "");
    const [startDate, setStartDate]       = useState(coupon.startDate ?? "");
    const [endDate, setEndDate]           = useState(coupon.endDate ?? "");
    const [description, setDescription]   = useState(coupon.description ?? "");
    const [campaignId, setCampaignId]     = useState(coupon.campaignId ?? "");
    const [submitted, setSubmitted]       = useState(false);

    const needsDiscount = promotionType !== "BUY_X_GET_Y";
    const discountNum = parseFloat(discountValue);
    const errors = {
        title: !title.trim(),
        discount: needsDiscount && (isNaN(discountNum) || discountNum <= 0 || (promotionType === "PERCENTAGE" && discountNum > 100)),
        dates: !!startDate && !!endDate && endDate < startDate,
    };
    const isValid = !Object.values(errors).some(Boolean);
    const err = (f: keyof typeof errors) => submitted && errors[f];

    const save = async () => {
        setSubmitted(true);
        if (!isValid) return;
        const res = await update(coupon.id, {
            title: title.trim(),
            description: description.trim() || undefined,
            imageUrl: coupon.imageUrl,
            promotionType,
            discountValue: needsDiscount ? discountNum : 0,
            minPurchaseAmount: minPurchase.trim() ? parseFloat(minPurchase) : null,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        });
        if (!res) return;

        /* si cambio la campana asignada, la reasignamos (o la quitamos con null) */
        const desired = campaignId || null;
        const current = coupon.campaignId || null;
        if (desired !== current) {
            const moved = await changeCampaign(coupon.id, desired);
            if (!moved) return;   // el error ya quedo en el hook
        }
        onSaved();
    };

    const discountLabel = promotionType === "FIXED_AMOUNT" ? "Monto de descuento (S/)" : "Descuento (%)";

    return (
        <Modal onClose={onClose} ariaLabel="Editar cupón" className="cm-edit-modal">
            <div className="cm-edit-body">
                <h3 className="cm-edit-title">Editar cupón</h3>
                {error && <div className="nc-coupons-err"><Icon name="close" size={12}/> {error}</div>}

                <div className="cm-edit-fields">
                    <div className="field">
                        <label htmlFor="ec-title">Título</label>
                        <input id="ec-title" className={"input" + (err("title") ? " input-error" : "")}
                               value={title} onChange={e => setTitle(e.target.value)}/>
                    </div>

                    <div className="nc-row2">
                        <div className="field">
                            <label htmlFor="ec-promo">Tipo</label>
                            <Select id="ec-promo" value={promotionType}
                                    options={PROMOTION_TYPES.map(p => ({ value: p.id, label: p.label }))}
                                    onChange={v => setPromotionType(v as PromotionType)}/>
                        </div>
                        {needsDiscount && (
                            <div className="field">
                                <label htmlFor="ec-disc">{discountLabel}</label>
                                <input id="ec-disc" className={"input" + (err("discount") ? " input-error" : "")}
                                       type="number" min={0} step={promotionType === "PERCENTAGE" ? 1 : 0.5}
                                       value={discountValue} onChange={e => setDiscountValue(e.target.value)}/>
                            </div>
                        )}
                    </div>

                    <div className="nc-row2">
                        <div className="field">
                            <label htmlFor="ec-min">Compra mínima (S/) <span className="nc-optional">opcional</span></label>
                            <input id="ec-min" className="input" type="number" min={0} step={0.5}
                                   value={minPurchase} onChange={e => setMinPurchase(e.target.value)}/>
                        </div>
                    </div>

                    <div className="nc-row2">
                        <div className="field">
                            <label htmlFor="ec-start">Inicio <span className="nc-optional">opcional</span></label>
                            <DatePicker id="ec-start" value={startDate} onChange={setStartDate}/>
                        </div>
                        <div className="field">
                            <label htmlFor="ec-end">Fin <span className="nc-optional">opcional</span></label>
                            <DatePicker id="ec-end" value={endDate} onChange={setEndDate} min={startDate || undefined}/>
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="ec-desc">Descripción <span className="nc-optional">opcional</span></label>
                        <textarea id="ec-desc" className="input" rows={2} value={description}
                                  onChange={e => setDescription(e.target.value)}/>
                    </div>

                    {campaigns.length > 0 && (
                        <div className="field">
                            <label htmlFor="ec-campaign">Campaña <span className="nc-optional">opcional</span></label>
                            <Select id="ec-campaign" value={campaignId}
                                    options={[
                                        { value: "", label: "Sin campaña" },
                                        ...assignable.map(c => ({ value: c.uuid ?? "", label: c.name })),
                                    ]}
                                    onChange={setCampaignId}/>
                        </div>
                    )}
                </div>

                <div className="cm-edit-actions">
                    <button type="button" className="btn" onClick={onClose} disabled={loading}>Cancelar</button>
                    <button type="button" className="btn btn-brand" onClick={save} disabled={loading}>
                        <Icon name="check" size={14}/> {loading ? "Guardando…" : "Guardar cambios"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}