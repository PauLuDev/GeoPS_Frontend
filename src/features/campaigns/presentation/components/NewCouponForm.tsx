import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Select } from "@/shared/ui/components/Select.tsx";
import { DatePicker } from "@/shared/ui/components/DatePicker.tsx";
import { Business } from "@/shared/types.ts";
import { PromotionType, PROMOTION_TYPES } from "@/features/campaigns/domain/value-objects/PromotionType.ts";
import { useCoupons } from "@/features/coupons/presentation/hooks/useCoupons.ts";
import { uploadImage } from "@/shared/cloudinary.ts";
import { PRESET_RESTRICTIONS } from "@/features/campaigns/domain/value-objects/CouponRestrictions.ts";
import { calcDiscountPct, savings } from "@/features/campaigns/domain/value-objects/Discount.ts";
import { durationLabel, todayISO } from "@/features/campaigns/domain/value-objects/Duration.ts";

interface NewCouponFormProps {
    establishments: Business[];
    onCreated: () => void;
    onCancel: () => void;
}

/* form de cupon suelto -> se crea sin campana (campaignId null) con sus propias fechas */
export function NewCouponForm({ establishments, onCreated, onCancel }: NewCouponFormProps) {
    const { t } = useTranslation();
    const { create, loading, error } = useCoupons();

    const [establishmentId, setEstablishmentId] = useState(establishments[0]?.id ?? "");

    /* los establecimientos cargan async: si el id quedo vacio en el primer render
       (cuando aun no habian llegado), lo completamos al primero disponible. sin
       esto, con un unico establecimiento el select esta oculto y no hay forma de
       setearlo -> el form se queda en "completa los campos obligatorios" */
    useEffect(() => {
        if (!establishmentId && establishments.length > 0) {
            setEstablishmentId(establishments[0].id);
        }
    }, [establishments, establishmentId]);
    const fileRef = useRef<HTMLInputElement>(null);
    const [title, setTitle]                 = useState("");
    const [promotionType, setPromotionType] = useState<PromotionType>("PERCENTAGE");
    const [originalPrice, setOriginalPrice] = useState("");
    const [finalPrice, setFinalPrice]       = useState("");
    const [stock, setStock]                 = useState("");
    const [description, setDescription]     = useState("");
    const [startDate, setStartDate]         = useState("");
    const [endDate, setEndDate]             = useState("");
    const [imageUrl, setImageUrl]           = useState("");
    const [presetRestrictions, setPresetRestrictions] = useState<Set<string>>(new Set());
    const [customRestriction, setCustomRestriction]   = useState("");
    const [customList, setCustomList]                 = useState<string[]>([]);
    const [terms, setTerms]                           = useState("");
    const [submitted, setSubmitted]         = useState(false);
    const [uploading, setUploading]         = useState(false);
    const [uploadError, setUploadError]     = useState<string | null>(null);

    const origNum  = parseFloat(originalPrice);
    const finalNum = parseFloat(finalPrice);
    const stockNum = parseInt(stock);

    const needsDiscount = promotionType !== "BUY_X_GET_Y";
    const discountPct = calcDiscountPct(origNum, finalNum);
    const expiresLabel = durationLabel(startDate, endDate) || "—";
    const today = todayISO();
    const endMin = startDate && startDate >= today ? startDate : today;

    const errors = {
        establishment: !establishmentId,
        title: !title.trim(),
        original: needsDiscount && (!originalPrice || isNaN(origNum) || origNum <= 0),
        final: needsDiscount && (!finalPrice || isNaN(finalNum) || finalNum < 0 || finalNum >= origNum),
        stock: isNaN(stockNum) || stockNum < 1,
        start: !startDate,
        startPast: !!startDate && startDate < today,
        end: !endDate || (!!startDate && endDate < startDate),
        endPast: !!endDate && endDate < today,
        endBeforeStart: !!startDate && !!endDate && endDate < startDate,
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

    const submit = async () => {
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

        const created = await create({
            establishmentId,
            campaignId: null,
            title: title.trim(),
            description: description.trim() || undefined,
            imageUrl: imageUrl || undefined,
            stock: stockNum,
            promotionType,
            discountValue: derivedDiscount,
            minPurchaseAmount: null,
            startDate,
            endDate,
            restrictions: restrictionsStr || undefined,
            terms: terms.trim() || undefined,
            originalProductPrice: needsDiscount ? origNum : undefined,
        });
        if (created) onCreated();
    };

    if (establishments.length === 0) {
        return (
            <div className="card cl-empty">
                <div className="cl-empty-icon"><Icon name="store" size={30}/></div>
                <div className="cl-empty-title">Registra un establecimiento primero</div>
                <p className="page-subtitle">Un cupón siempre pertenece a un establecimiento tuyo.</p>
                <button type="button" className="btn" onClick={onCancel}>Volver</button>
            </div>
        );
    }

    const discountLabel = promotionType === "FIXED_AMOUNT" ? "Monto de descuento (S/)" : "Descuento (%)";

    return (
        <div className="card nc-card cl-new-coupon">
            <div className="eyebrow nc-eyebrow">Nuevo cupón</div>

            {submitted && !isValid && (
                <div className="nc-coupons-err"><Icon name="close" size={12}/> Completa los campos obligatorios</div>
            )}
            {error && <div className="nc-coupons-err"><Icon name="close" size={12}/> {error.message}</div>}

            <div className="nc-fields">
                {establishments.length > 1 && (
                    <div className="field">
                        <label htmlFor="ncf-est">Establecimiento</label>
                        <select id="ncf-est" className="input" value={establishmentId}
                                onChange={e => setEstablishmentId(e.target.value)} disabled={uploading}>
                            {establishments.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                )}

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
                    <label htmlFor="ncf-title">Nombre del cupón</label>
                    <input id="ncf-title" className={"input" + (err("title") ? " input-error" : "")}
                           placeholder='Ej. "2x1 en lomo saltado"'
                           value={title} onChange={e => setTitle(e.target.value)} disabled={uploading}/>
                </div>

                <div className="nc-row2">
                    <div className="field">
                        <label htmlFor="ncf-promo">Tipo de cupón</label>
                        <Select id="ncf-promo" value={promotionType}
                                options={PROMOTION_TYPES.map(p => ({ value: p.id, label: p.label }))}
                                onChange={v => setPromotionType(v as PromotionType)} disabled={uploading}/>
                    </div>
                </div>

                {needsDiscount && (
                    <div className="nc-prices">
                        <div className="field">
                            <label htmlFor="ncf-orig">Precio original (S/)</label>
                            <input id="ncf-orig" className={"input" + (err("original") ? " input-error" : "")} type="number" min="0" step="0.5" placeholder="48"
                                   value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} disabled={uploading}/>
                            {err("original") && <span className="field-error">Mayor a 0</span>}
                        </div>
                        <div className="field">
                            <label htmlFor="ncf-final">Precio final (S/)</label>
                            <input id="ncf-final" className={"input" + (err("final") ? " input-error" : "")} type="number" min="0" step="0.5" placeholder="24"
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
                        <label htmlFor="ncf-stock">Stock (unidades)</label>
                        <input id="ncf-stock" className={"input" + (err("stock") ? " input-error" : "")}
                               type="number" min={1} step={1}
                               value={stock} onChange={e => setStock(e.target.value)} disabled={uploading}/>
                    </div>
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
                        <label htmlFor="ncf-start">Inicio</label>
                        <DatePicker id="ncf-start" value={startDate} onChange={setStartDate} min={today} error={err("start") || errors.startPast} disabled={uploading}/>
                        {err("start") && !errors.startPast && <span className="field-error">Obligatorio</span>}
                        {err("startPast") && <span className="field-error">{t("campaign.errors.datePast")}</span>}
                    </div>
                    <div className="field">
                        <label htmlFor="ncf-end">Fin</label>
                        <DatePicker id="ncf-end" value={endDate} onChange={setEndDate} min={endMin} error={err("end") || errors.endPast} disabled={uploading}/>
                        {err("end") && !errors.endBeforeStart && !errors.endPast && <span className="field-error">Obligatorio</span>}
                        {err("endBeforeStart") && <span className="field-error">{t("campaign.errors.endBeforeStart")}</span>}
                        {err("endPast") && <span className="field-error">{t("campaign.errors.datePast")}</span>}
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="ncf-desc">Descripción <span className="nc-optional">opcional</span></label>
                    <textarea id="ncf-desc" className="input" rows={2}
                              placeholder="Condiciones o detalles del cupón..."
                              value={description} onChange={e => setDescription(e.target.value)} disabled={uploading}/>
                </div>

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

            <div className="nc-form-actions">
                <button type="button" className="btn" onClick={onCancel} disabled={loading || uploading}>Cancelar</button>
                <button type="button" className="btn btn-brand nc-grow" onClick={submit} disabled={loading || uploading}>
                    {loading ? "Guardando…" : (uploading ? "Subiendo imagen..." : <>Publicar cupón <Icon name="arrowRight" size={14}/></>)}
                </button>
            </div>
        </div>
    );
}