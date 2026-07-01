import { useState, useRef } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Select } from "@/shared/ui/components/Select.tsx";
import { DatePicker } from "@/shared/ui/components/DatePicker.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { CampaignCoupon } from "@/features/campaigns/domain/entities/CampaignCoupon.ts";
import { Campaign } from "@/features/campaigns/domain/entities/Campaign.ts";
import { PromotionType, PROMOTION_TYPES } from "@/features/campaigns/domain/value-objects/PromotionType.ts";
import { useCoupons } from "@/features/coupons/presentation/hooks/useCoupons.ts";
import { uploadImage } from "@/shared/cloudinary.ts";
import { PRESET_RESTRICTIONS } from "@/features/campaigns/domain/value-objects/CouponRestrictions.ts";
import { calcDiscountPct, savings } from "@/features/campaigns/domain/value-objects/Discount.ts";
import { durationLabel } from "@/features/campaigns/domain/value-objects/Duration.ts";

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

    const fileRef = useRef<HTMLInputElement>(null);
    const [title, setTitle]                 = useState(coupon.title);
    const [promotionType, setPromotionType] = useState<PromotionType>(coupon.promotionType);
    const [originalPrice, setOriginalPrice] = useState(coupon.originalPrice != null ? String(coupon.originalPrice) : "");
    const [finalPrice, setFinalPrice]       = useState(coupon.finalPrice != null ? String(coupon.finalPrice) : "");
    const [startDate, setStartDate]         = useState(coupon.startDate ?? "");
    const [endDate, setEndDate]             = useState(coupon.endDate ?? "");
    const [description, setDescription]     = useState(coupon.description ?? "");
    const [campaignId, setCampaignId]       = useState(coupon.campaignId ?? "");
    const [imageUrl, setImageUrl]           = useState(coupon.imageUrl ?? "");
    const [presetRestrictions, setPresetRestrictions] = useState<Set<string>>(
        new Set(coupon.restrictions?.filter(r => PRESET_RESTRICTIONS.includes(r)) ?? [])
    );
    const [customList, setCustomList]                 = useState<string[]>(
        coupon.restrictions?.filter(r => !PRESET_RESTRICTIONS.includes(r)) ?? []
    );
    const [customRestriction, setCustomRestriction]   = useState("");
    const [terms, setTerms]                           = useState(coupon.terms ?? "");
    const [submitted, setSubmitted]         = useState(false);
    const [uploading, setUploading]         = useState(false);
    const [uploadError, setUploadError]     = useState<string | null>(null);

    const origNum  = parseFloat(originalPrice);
    const finalNum = parseFloat(finalPrice);

    const needsDiscount = promotionType !== "BUY_X_GET_Y";
    const discountPct = calcDiscountPct(origNum, finalNum);

    const errors = {
        title: !title.trim(),
        original: needsDiscount && (!originalPrice || isNaN(origNum) || origNum <= 0),
        final: needsDiscount && (!finalPrice || isNaN(finalNum) || finalNum < 0 || finalNum >= origNum),
        dates: !!startDate && !!endDate && endDate < startDate,
    };
    const isValid = !Object.values(errors).some(Boolean);
    const err = (f: keyof typeof errors) => submitted && errors[f];

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadError(null);
        try {
            setImageUrl(await uploadImage(file));
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "No se pudo subir la imagen");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const togglePreset = (label: string) => {
        setPresetRestrictions(prev => {
            const next = new Set(prev);
            next.has(label) ? next.delete(label) : next.add(label);
            return next;
        });
    };
    const addCustomRestriction = () => {
        const val = customRestriction.trim();
        if (!val) return;
        setCustomList(prev => [...prev, val]);
        setCustomRestriction("");
    };
    const removeCustom = (i: number) => setCustomList(prev => prev.filter((_, j) => j !== i));

    const save = async () => {
        setSubmitted(true);
        if (!isValid || uploading) return;

        let derivedDiscount = 0;
        if (needsDiscount) {
            if (promotionType === "PERCENTAGE") {
                derivedDiscount = discountPct ?? 0;
            } else if (promotionType === "FIXED_AMOUNT") {
                derivedDiscount = Math.max(0, origNum - finalNum);
            }
        }

        const restrictionsStr = [...PRESET_RESTRICTIONS.filter(p => presetRestrictions.has(p)), ...customList].join(", ");

        const res = await update(coupon.id, {
            title: title.trim(),
            description: description.trim() || undefined,
            imageUrl: imageUrl || undefined,
            promotionType,
            discountValue: derivedDiscount,
            minPurchaseAmount: null,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            restrictions: restrictionsStr || undefined,
            terms: terms.trim() || undefined,
            originalProductPrice: needsDiscount ? origNum : undefined,
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

    const selectedCampaign = campaigns.find(c => c.uuid === campaignId || String(c.id) === campaignId);
    const expiresLabel = selectedCampaign
        ? durationLabel(selectedCampaign.startDate, selectedCampaign.endDate)
        : (durationLabel(startDate, endDate) || "—");

    return (
        <Modal onClose={onClose} ariaLabel="Editar cupón" className="cm-edit-modal">
            <div className="cm-edit-body">
                <h3 className="cm-edit-title">Editar cupón</h3>
                {error && <div className="nc-coupons-err"><Icon name="close" size={12}/> {error}</div>}

                <div className="cm-edit-fields">
                    {/* Imagen del cupón */}
                    <div className="field nc-mb12">
                        <span className="nc-group-label">Imagen del cupón</span>
                        <input ref={fileRef} type="file" accept="image/*" aria-label="Imagen del cupón" className="nc-hidden-input" onChange={handleImageUpload} disabled={uploading}/>
                        {imageUrl ? (
                            <div className="nc-img-preview">
                                <img src={imageUrl} alt="Cupón"/>
                                <button type="button" className="nc-img-remove" disabled={uploading}
                                        onClick={() => { setImageUrl(""); if (fileRef.current) fileRef.current.value = ""; }}>
                                    <Icon name="close" size={12}/> Quitar
                                </button>
                            </div>
                        ) : (
                            <button type="button" className="nc-img-upload" onClick={() => fileRef.current?.click()} disabled={uploading}>
                                <Icon name="image" size={22}/>
                                {uploading ? "Subiendo..." : "Subir imagen desde tu dispositivo"}
                                <span className="nc-img-hint">JPG, PNG · máx. recomendado 1 MB</span>
                            </button>
                        )}
                        {uploading && <span className="nc-img-hint"><Icon name="image" size={11}/> Subiendo imagen…</span>}
                        {uploadError && <span className="field-error"><Icon name="close" size={11}/> {uploadError}</span>}
                    </div>

                    <div className="field">
                        <label htmlFor="ec-title">Título</label>
                        <input id="ec-title" className={"input" + (err("title") ? " input-error" : "")}
                               value={title} onChange={e => setTitle(e.target.value)} disabled={uploading}/>
                    </div>

                    <div className="nc-row2">
                        <div className="field">
                            <label htmlFor="ec-promo">Tipo</label>
                            <Select id="ec-promo" value={promotionType}
                                    options={PROMOTION_TYPES.map(p => ({ value: p.id, label: p.label }))}
                                    onChange={v => setPromotionType(v as PromotionType)} disabled={uploading}/>
                        </div>
                    </div>

                    {needsDiscount && (
                        <div className="nc-prices">
                            <div className="field">
                                <label htmlFor="ec-orig">Precio original (S/)</label>
                                <input id="ec-orig" className={"input" + (err("original") ? " input-error" : "")} type="number" min="0" step="0.5" placeholder="48"
                                       value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} disabled={uploading}/>
                                {err("original") && <span className="field-error">Mayor a 0</span>}
                            </div>
                            <div className="field">
                                <label htmlFor="ec-final">Precio final (S/)</label>
                                <input id="ec-final" className={"input" + (err("final") ? " input-error" : "")} type="number" min="0" step="0.5" placeholder="24"
                                       value={finalPrice} onChange={e => setFinalPrice(e.target.value)} disabled={uploading}/>
                                {err("final") && <span className="field-error">Menor al original</span>}
                            </div>
                            <div className="field">
                                <span className="nc-group-label">Descuento</span>
                                <div className={"nc-discount-box" + (discountPct ? " active" : "")}>
                                    {promotionType === "FIXED_AMOUNT"
                                        ? (savings(origNum, finalNum) > 0 ? `−S/${savings(origNum, finalNum)}` : "—")
                                        : (discountPct !== null ? `−${discountPct}%` : "—")}
                                </div>
                                {discountPct !== null && (
                                    <span className="nc-discount-save">
                                        {promotionType === "FIXED_AMOUNT"
                                            ? `Equivale a ${discountPct}%`
                                            : `Ahorro S/${savings(origNum, finalNum)}`}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="nc-row2">
                        <div className="field">
                            <span className="nc-group-label">Vigencia</span>
                            <div className="nc-vigencia-box">
                                <Icon name="clock" size={13}/>
                                <span className="nc-vigencia-val">{expiresLabel}</span>
                            </div>
                        </div>
                    </div>

                    <div className="nc-row2">
                        <div className="field">
                            <label htmlFor="ec-start">Inicio {campaignId ? <span className="nc-optional">(Heredado de la campaña)</span> : <span className="nc-optional">opcional</span>}</label>
                            <DatePicker id="ec-start" value={campaignId ? "" : startDate} onChange={setStartDate} disabled={!!campaignId || uploading}/>
                        </div>
                        <div className="field">
                            <label htmlFor="ec-end">Fin {campaignId ? <span className="nc-optional">(Heredado de la campaña)</span> : <span className="nc-optional">opcional</span>}</label>
                            <DatePicker id="ec-end" value={campaignId ? "" : endDate} onChange={setEndDate} min={startDate || undefined} disabled={!!campaignId || uploading}/>
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="ec-desc">Descripción <span className="nc-optional">opcional</span></label>
                        <textarea id="ec-desc" className="input" rows={2} value={description}
                                  onChange={e => setDescription(e.target.value)} disabled={uploading}/>
                    </div>

                    {campaigns.length > 0 && (
                        <div className="field">
                            <label htmlFor="ec-campaign">Campaña <span className="nc-optional">opcional</span></label>
                            <Select id="ec-campaign" value={campaignId}
                                    options={[
                                        { value: "", label: "Sin campaña" },
                                        ...assignable.map(c => ({ value: c.uuid ?? "", label: c.name })),
                                    ]}
                                    onChange={setCampaignId} disabled={uploading}/>
                        </div>
                    )}

                    {/* Restricciones */}
                    <div className="nc-restr">
                        <div className="nc-restr-head">
                            <div className="nc-restr-title">Restricciones de uso</div>
                        </div>
                        <div className="nc-restr-chips">
                            {PRESET_RESTRICTIONS.map(p => {
                                const on = presetRestrictions.has(p);
                                return (
                                    <button type="button" key={p} className="nc-restr-chip" aria-pressed={on}
                                            onClick={() => togglePreset(p)} disabled={uploading}>
                                        {on && <Icon name="check" size={10}/>}
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="nc-restr-add-row">
                            <input className="input nc-restr-input"
                                   placeholder="Agrega una restricción personalizada..."
                                   aria-label="Restricción personalizada"
                                   value={customRestriction}
                                   onChange={e => setCustomRestriction(e.target.value)}
                                   onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomRestriction())}
                                   disabled={uploading}/>
                            <button type="button" className="btn btn-sm nc-noshrink"
                                    disabled={!customRestriction.trim() || uploading}
                                    onClick={addCustomRestriction}>
                                <Icon name="plus" size={13}/> Añadir
                            </button>
                        </div>
                        {customList.length > 0 && (
                            <div className="nc-restr-list">
                                {customList.map((r, i) => (
                                    <div key={r} className="nc-restr-item">
                                        <Icon name="check" size={12}/>
                                        <span className="nc-restr-item-text">{r}</span>
                                        <button type="button" className="nc-restr-remove" aria-label="Quitar restricción" onClick={() => removeCustom(i)} disabled={uploading}>
                                            <Icon name="close" size={11}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Términos y condiciones */}
                    <div className="nc-terms">
                        <div className="nc-terms-title">Términos y condiciones</div>
                        <textarea className="input" rows={3}
                                  aria-label="Términos y condiciones"
                                  placeholder="El cupón es válido únicamente durante el período indicado. Solo puede ser canjeado una vez por cliente. El establecimiento se reserva el derecho de modificar o cancelar la oferta sin previo aviso..."
                                  value={terms}
                                  onChange={e => setTerms(e.target.value)} disabled={uploading}/>
                    </div>
                </div>

                <div className="cm-edit-actions">
                    <button type="button" className="btn" onClick={onClose} disabled={loading || uploading}>Cancelar</button>
                    <button type="button" className="btn btn-brand" onClick={save} disabled={loading || uploading}>
                        <Icon name="check" size={14}/> {loading ? "Guardando…" : (uploading ? "Subiendo..." : "Guardar cambios")}
                    </button>
                </div>
            </div>
        </Modal>
    );
}