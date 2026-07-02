import { useState, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon";
import { Select } from "@/shared/ui/components/Select.tsx";
import { DatePicker } from "@/shared/ui/components/DatePicker.tsx";
import { Coupon } from "@/shared/types.ts";
import { CouponCard } from "@/features/coupons/presentation/components/CouponCard.tsx";
import { Campaign } from "@/features/campaigns/domain/entities/Campaign.ts";
import { CampaignCoupon } from "@/features/campaigns/domain/entities/CampaignCoupon.ts";
import { useRegisteredCoupons } from "@/features/campaigns/presentation/hooks/useRegisteredCoupons.ts";
import { PromotionType, PROMOTION_TYPES, DEFAULT_PROMOTION_TYPE, promotionLabel } from "@/features/campaigns/domain/value-objects/PromotionType.ts";
import { CAMPAIGN_TYPES } from "@/features/campaigns/domain/value-objects/CampaignType.ts";
import { PRESET_RESTRICTIONS } from "@/features/campaigns/domain/value-objects/CouponRestrictions.ts";
import { calcDiscountPct, savings } from "@/features/campaigns/domain/value-objects/Discount.ts";
import { durationLabel, isRangeValid, todayISO } from "@/features/campaigns/domain/value-objects/Duration.ts";
import { validateCampaign, isCampaignValid, buildCampaign } from "@/features/campaigns/application/use-cases/CreateCampaign.ts";
import { validateCoupon, isCouponValid, buildCoupon } from "@/features/campaigns/application/use-cases/AddCoupon.ts";
import { CouponDraftInput } from "@/features/campaigns/application/dtos/CampaignDraft.ts";
import { uploadImage } from "@/shared/cloudinary.ts";

/* coupon draft (estado local del formulario) */
interface CouponDraft {
    title: string;
    promotionType: PromotionType;
    originalPrice: string;
    finalPrice: string;
    stock: string;
    description: string;
    imageUrl: string;
    presetRestrictions: Set<string>;
    customRestriction: string;
    customList: string[];
    terms: string;
}

const EMPTY_DRAFT: CouponDraft = {
    title: "", promotionType: DEFAULT_PROMOTION_TYPE, originalPrice: "", finalPrice: "", stock: "", description: "",
    imageUrl: "", presetRestrictions: new Set(), customRestriction: "",
    customList: [], terms: "",
};

/* mapea el estado del formulario al DTO de aplicacion (puro, fuera del componente) */
const toCouponInput = (d: CouponDraft): CouponDraftInput => ({
    title: d.title, promotionType: d.promotionType, originalPrice: d.originalPrice, finalPrice: d.finalPrice,
    stock: d.stock, description: d.description, imageUrl: d.imageUrl,
    restrictions: [...PRESET_RESTRICTIONS.filter(p => d.presetRestrictions.has(p)), ...d.customList],
    terms: d.terms,
});

const fieldCls = (bad: boolean) => "input" + (bad ? " input-error" : "");

interface NewCampaignProps {
    onDone: (campaign: Campaign) => void;
}

export function NewCampaign({ onDone }: NewCampaignProps) {
    const { t } = useTranslation();
    const uid = useId();
    const fileRef = useRef<HTMLInputElement>(null);

    /* catalogo de cupones ya registrados por el dueno */
    const { coupons: registeredCoupons, loading: registeredLoading } = useRegisteredCoupons();

    /* campaign fields */
    const [name,        setName]        = useState("");
    const [description, setDescription] = useState("");
    const [category,    setCategory]    = useState("");     // tipo de campana (preset o manual)
    const [customType,  setCustomType]  = useState("");     // texto manual
    const [usingCustom, setUsingCustom] = useState(false);  // modo manual activo
    const [startDate,   setStartDate]   = useState("");
    const [endDate,     setEndDate]     = useState("");

    /* coupon list */
    const [coupons, setCoupons] = useState<CampaignCoupon[]>([]);

    /* inline coupon form */
    const [addingCoupon, setAddingCoupon] = useState(false);
    const [couponDraft,  setCouponDraft]  = useState<CouponDraft>(EMPTY_DRAFT);
    const [couponSubmit, setCouponSubmit] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    /* campaign submit */
    const [submitted, setSubmitted] = useState(false);

    /* el tipo final (preset o manual) - decision de UI */
    const finalType = usingCustom ? customType.trim() : category;

    /* validacion (delegada a los use-cases) */
    const campaignDraft = { name, description, category: finalType, startDate, endDate, coupons };
    const errors = validateCampaign(campaignDraft);
    const isValid = isCampaignValid(errors);
    const endInvalid = !!endDate && !!startDate && !isRangeValid(startDate, endDate);

    const couponErrors = validateCoupon(toCouponInput(couponDraft));
    const couponValid  = isCouponValid(couponErrors);

    /* descuento (value-object) */
    const origNum  = parseFloat(couponDraft.originalPrice);
    const finalNum = parseFloat(couponDraft.finalPrice);
    const discountPct = calcDiscountPct(origNum, finalNum);

    /* vigencia derivada de las fechas de campana (value-object) */
    const expiresLabel = durationLabel(startDate, endDate);
    const today = todayISO();
    const endMin = startDate && startDate >= today ? startDate : today;

    /* subida de imagen */
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadError(null);
        try {
            const url = await uploadImage(file);
            setCouponDraft(d => ({ ...d, imageUrl: url }));
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "No se pudo subir la imagen");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    /* restricciones */
    const togglePreset = (label: string) => {
        setCouponDraft(d => {
            const s = new Set(d.presetRestrictions);
            s.has(label) ? s.delete(label) : s.add(label);
            return { ...d, presetRestrictions: s };
        });
    };
    const addCustomRestriction = () => {
        const val = couponDraft.customRestriction.trim();
        if (!val) return;
        setCouponDraft(d => ({ ...d, customList: [...d.customList, val], customRestriction: "" }));
    };
    const removeCustom = (i: number) =>
        setCouponDraft(d => ({ ...d, customList: d.customList.filter((_, j) => j !== i) }));

    /* agregar cupon (construccion delegada al use-case) */
    const addCoupon = () => {
        setCouponSubmit(true);
        if (!couponValid) return;
        const c = buildCoupon(toCouponInput(couponDraft), expiresLabel);
        setCoupons(prev => [...prev, c]);
        setCouponDraft(EMPTY_DRAFT);
        setCouponSubmit(false);
        setAddingCoupon(false);
    };

    const removeCoupon = (id: string) => setCoupons(prev => prev.filter(c => c.id !== id));

    /* asocia un cupon ya registrado (catalogo) a la campana; hereda su vigencia */
    const addFromCatalog = (rc: CampaignCoupon) =>
        setCoupons(prev => prev.some(c => c.id === rc.id) ? prev : [...prev, { ...rc, expiresIn: expiresLabel }]);

    /* la lista de abajo solo muestra los cupones creados nuevos: los del catalogo
       ya se ven (y se quitan) en su propia tarjeta, asi no se duplican */
    const newCoupons = coupons.filter(c => !registeredCoupons.some(rc => rc.id === c.id));

    /* publicar (construccion delegada al use-case) */
    const handlePublish = () => {
        setSubmitted(true);
        if (!isValid) return;
        onDone(buildCampaign(campaignDraft));
    };

    const cerr = (f: keyof typeof errors)       => submitted    && errors[f];
    const derr = (f: keyof typeof couponErrors) => couponSubmit && couponErrors[f];

    const totalRestrictions = couponDraft.presetRestrictions.size + couponDraft.customList.length;

    return (
        <div className="md nc-page">
            <header className="md-head">
                <div>
                    <h1 className="page-title">Nueva campaña</h1>
                    <p className="page-subtitle">Completa los datos y agrega al menos un cupón para publicar.</p>
                </div>
                <div className="btn-row">
                    <button type="button" className="btn btn-brand" onClick={handlePublish}
                            disabled={coupons.length === 0}
                            title={coupons.length === 0 ? "Agrega al menos un cupón para publicar" : undefined}>
                        Publicar campaña <Icon name="arrowRight" size={14}/>
                    </button>
                </div>
            </header>

            {submitted && !isValid && (
                <div className="nc-error-box">
                    <Icon name="close" size={15}/>
                    <div className="nc-error-text">
                        <strong>Campos obligatorios sin completar:</strong>
                        <ul className="nc-error-list">
                            {errors.name     && <li>Nombre de la campaña</li>}
                            {errors.category && <li>Tipo de campaña</li>}
                            {errors.start    && <li>Fecha de inicio</li>}
                            {errors.end      && <li>{errors.endBeforeStart ? t("campaign.errors.endBeforeStart") : errors.endPast ? t("campaign.errors.datePast") : "Fecha de fin"}</li>}
                            {errors.coupons  && <li>Agrega al menos un cupón</li>}
                        </ul>
                    </div>
                </div>
            )}

            <div className="nc-grid">
                {/* izquierda */}
                <div className="nc-col">

                    {/* 1. info basica */}
                    <div className="card nc-card">
                        <div className="eyebrow nc-eyebrow">1. Información básica</div>
                        <div className="nc-fields">
                            <div className="field">
                                <label htmlFor={`${uid}-name`}>Nombre de la campaña <Req/></label>
                                <input id={`${uid}-name`} className={fieldCls(cerr("name"))}
                                       placeholder='Ej. "Día de la Madre", "Navidad 2026"'
                                       value={name} onChange={e => setName(e.target.value)}/>
                                {cerr("name") && <ErrMsg>Campo obligatorio</ErrMsg>}
                            </div>
                            <div className="field">
                                <label htmlFor={`${uid}-desc`}>Descripción de la campaña</label>
                                <textarea id={`${uid}-desc`} className="input" rows={2}
                                          placeholder="Describe brevemente de qué trata esta campaña..."
                                          value={description} onChange={e => setDescription(e.target.value)}/>
                            </div>
                            <div className="field">
                                <span className="nc-group-label">Tipo de campaña <Req/></span>
                                <div className="nc-chips">
                                    {CAMPAIGN_TYPES.map(c => (
                                        <button type="button" key={c.id}
                                                className={"chip " + (!usingCustom && category === c.id ? "active" : "")}
                                                onClick={() => { setCategory(c.id); setUsingCustom(false); }}>
                                            <Icon name={c.icon} size={13}/> {c.id}
                                        </button>
                                    ))}
                                    <button type="button"
                                            className={"chip " + (usingCustom ? "active" : "")}
                                            onClick={() => { setUsingCustom(true); setCategory(""); }}>
                                        <Icon name="plus" size={13}/> Otra ocasión
                                    </button>
                                </div>
                                {usingCustom && (
                                    <input className="input nc-custom-type"
                                           placeholder="Escribe el tipo de campaña..."
                                           aria-label="Tipo de campaña personalizado"
                                           value={customType}
                                           onChange={e => setCustomType(e.target.value)}/>
                                )}
                                {cerr("category") && <ErrMsg>Selecciona o escribe un tipo de campaña</ErrMsg>}
                            </div>
                        </div>
                    </div>

                    {/* 2. vigencia */}
                    <div className="card nc-card">
                        <div className="eyebrow nc-eyebrow">2. Vigencia</div>
                        <div className="nc-row2">
                            <div className="field">
                                <label htmlFor={`${uid}-start`}>Fecha de inicio <Req/></label>
                                <DatePicker id={`${uid}-start`} value={startDate} onChange={setStartDate} min={today} error={cerr("start") || errors.startPast}/>
                                {cerr("start") && !errors.startPast && <ErrMsg>Obligatorio</ErrMsg>}
                                {errors.startPast && <ErrMsg>{t("campaign.errors.datePast")}</ErrMsg>}
                            </div>
                            <div className="field">
                                <label htmlFor={`${uid}-end`}>Fecha de fin <Req/></label>
                                <DatePicker id={`${uid}-end`} value={endDate} onChange={setEndDate} min={endMin} error={cerr("end") || errors.endPast}/>
                                {cerr("end") && !errors.endBeforeStart && !errors.endPast && <ErrMsg>Obligatorio</ErrMsg>}
                                {errors.endBeforeStart && <ErrMsg>{t("campaign.errors.endBeforeStart")}</ErrMsg>}
                                {errors.endPast && <ErrMsg>{t("campaign.errors.datePast")}</ErrMsg>}
                            </div>
                        </div>
                        {startDate && endDate && !endInvalid && (
                            <div className="nc-duration">
                                <Icon name="clock" size={12}/>
                                Duración: <strong className="nc-duration-val">{expiresLabel}</strong>
                            </div>
                        )}
                    </div>

                    {/* 3. cupones */}
                    <div className="card nc-card">
                        <div className="nc-cupones-head">
                            <div className="eyebrow">3. Cupones</div>
                            {coupons.length > 0 && (
                                <span className="nc-count">
                                    {coupons.length} {coupons.length > 1 ? "cupones" : "cupón"}
                                </span>
                            )}
                        </div>
                        <p className="nc-cupones-hint">
                            Selecciona de tus cupones registrados o crea uno nuevo. Puedes agregar varios.
                        </p>

                        {/* mis cupones registrados (catalogo seleccionable) */}
                        <div className="nc-catalog-head">
                            <span className="nc-group-label">Mis cupones registrados</span>
                        </div>
                        <div className="nc-catalog">
                            {registeredLoading && (
                                <div className="nc-catalog-empty">Cargando tus cupones…</div>
                            )}
                            {!registeredLoading && registeredCoupons.length === 0 && (
                                <div className="nc-catalog-empty">Aún no tienes cupones registrados. Crea uno nuevo abajo.</div>
                            )}
                            {registeredCoupons.map(rc => {
                                const added = coupons.some(c => c.id === rc.id);
                                return (
                                    <div key={rc.id} className={"nc-coupon-item nc-catalog-item" + (added ? " added" : "")}>
                                        <div className="nc-coupon-thumb"
                                             style={rc.imageUrl ? { backgroundImage: `url(${rc.imageUrl})` } : undefined}>
                                            {!rc.imageUrl && <span className="nc-coupon-thumb-disc">−{rc.discount}</span>}
                                        </div>
                                        <div className="nc-coupon-info">
                                            <div className="nc-coupon-title">{rc.title}</div>
                                            <div className="nc-coupon-meta">
                                                <span className="nc-cat-tag">{promotionLabel(rc.promotionType)}</span>
                                                <span className="nc-sep">·</span>
                                                −{rc.discount}
                                                <span className="nc-sep">·</span>
                                                S/{rc.finalPrice}
                                                <span className="nc-strike">S/{rc.originalPrice}</span>
                                                <span className="nc-sep">·</span>
                                                {rc.stock} uds.
                                            </div>
                                        </div>
                                        {added ? (
                                            <button type="button" className="btn btn-sm nc-catalog-btn added"
                                                    title="Quitar de la campaña" aria-label="Quitar de la campaña"
                                                    onClick={() => removeCoupon(rc.id)}>
                                                <Icon name="check" size={13}/> Agregado <Icon name="close" size={12}/>
                                            </button>
                                        ) : (
                                            <button type="button" className="btn btn-brand btn-sm nc-catalog-btn" onClick={() => addFromCatalog(rc)}>
                                                <Icon name="plus" size={13}/> Agregar
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* lista de cupones nuevos creados (los del catalogo se gestionan arriba) */}
                        {newCoupons.length > 0 && (
                            <div className="nc-coupon-list">
                                {newCoupons.map(c => (
                                    <div key={c.id} className="nc-coupon-item">
                                        <div className="nc-coupon-thumb"
                                             style={c.imageUrl ? { backgroundImage: `url(${c.imageUrl})` } : undefined}>
                                            {!c.imageUrl && <span className="nc-coupon-thumb-disc">−{c.discount}</span>}
                                        </div>
                                        <div className="nc-coupon-info">
                                            <div className="nc-coupon-title">{c.title}</div>
                                            <div className="nc-coupon-meta">
                                                −{c.discount}
                                                <span className="nc-sep">·</span>
                                                S/{c.finalPrice}
                                                <span className="nc-strike">S/{c.originalPrice}</span>
                                                <span className="nc-sep">·</span>
                                                {c.stock} uds.
                                            </div>
                                        </div>
                                        <button type="button" className="btn btn-icon btn-sm nc-coupon-remove" title="Eliminar cupón"
                                                aria-label="Eliminar cupón" onClick={() => removeCoupon(c.id)}>
                                            <Icon name="close" size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="nc-catalog-divider"><span>o crea uno nuevo</span></div>

                        {/* formulario inline de nuevo cupon */}
                        {addingCoupon ? (
                            <div className="nc-coupon-form">
                                <div className="nc-form-title">Datos del cupón</div>

                                {/* a) imagen */}
                                <div className="field nc-mb12">
                                    <span className="nc-group-label">Imagen del cupón</span>
                                    <input ref={fileRef} type="file" accept="image/*" aria-label="Imagen del cupón" className="nc-hidden-input" onChange={handleImageUpload} disabled={uploading}/>
                                    {couponDraft.imageUrl ? (
                                        <div className="nc-img-preview">
                                            <img src={couponDraft.imageUrl} alt="Cupón"/>
                                            <button type="button" className="nc-img-remove" disabled={uploading}
                                                    onClick={() => { setCouponDraft(d => ({ ...d, imageUrl: "" })); if (fileRef.current) fileRef.current.value = ""; }}>
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

                                {/* b) nombre */}
                                <div className="field nc-mb12">
                                    <label htmlFor={`${uid}-c-title`}>Nombre del cupón <Req/></label>
                                    <input id={`${uid}-c-title`} className={fieldCls(derr("title"))} placeholder='Ej. "Sushi rolls al mediodía"'
                                           value={couponDraft.title}
                                           onChange={e => setCouponDraft(d => ({ ...d, title: e.target.value }))}/>
                                    {derr("title") && <ErrMsg>Obligatorio</ErrMsg>}
                                </div>

                                {/* b.2) tipo de promocion */}
                                <div className="field nc-mb12">
                                    <label htmlFor={`${uid}-c-promo`}>Tipo de cupón</label>
                                    <Select id={`${uid}-c-promo`}
                                            value={couponDraft.promotionType}
                                            options={PROMOTION_TYPES.map(p => ({ value: p.id, label: p.label }))}
                                            onChange={v => setCouponDraft(d => ({ ...d, promotionType: v as PromotionType }))}/>
                                </div>

                                {/* c) precios -> descuento auto */}
                                <div className="nc-prices">
                                    <div className="field">
                                        <label htmlFor={`${uid}-c-orig`}>Precio original (S/) <Req/></label>
                                        <input id={`${uid}-c-orig`} className={fieldCls(derr("original"))} type="number" min="0" step="0.5" placeholder="48"
                                               value={couponDraft.originalPrice}
                                               onChange={e => setCouponDraft(d => ({ ...d, originalPrice: e.target.value }))}/>
                                        {derr("original") && <ErrMsg>Mayor a 0</ErrMsg>}
                                    </div>
                                    <div className="field">
                                        <label htmlFor={`${uid}-c-final`}>Precio final (S/) <Req/></label>
                                        <input id={`${uid}-c-final`} className={fieldCls(derr("final"))} type="number" min="0" step="0.5" placeholder="24"
                                               value={couponDraft.finalPrice}
                                               onChange={e => setCouponDraft(d => ({ ...d, finalPrice: e.target.value }))}/>
                                        {derr("final") && <ErrMsg>Menor al original</ErrMsg>}
                                    </div>
                                    <div className="field">
                                        <span className="nc-group-label">Descuento</span>
                                        <div className={"nc-discount-box" + (discountPct ? " active" : "")}>
                                            {couponDraft.promotionType === "FIXED_AMOUNT"
                                                ? (savings(origNum, finalNum) > 0 ? `−S/${savings(origNum, finalNum)}` : "—")
                                                : (discountPct !== null ? `−${discountPct}%` : "—")}
                                        </div>
                                        {discountPct !== null && (
                                            <span className="nc-discount-save">
                                                {couponDraft.promotionType === "FIXED_AMOUNT"
                                                    ? `Equivale a ${discountPct}%`
                                                    : `Ahorro S/${savings(origNum, finalNum)}`}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* d) stock + vigencia */}
                                <div className="nc-row2-sm">
                                    <div className="field">
                                        <label htmlFor={`${uid}-c-stock`}>Stock (unidades) <Req/></label>
                                        <input id={`${uid}-c-stock`} className={fieldCls(derr("stock"))} type="number" min="1" step="1" placeholder="30"
                                               value={couponDraft.stock}
                                               onChange={e => setCouponDraft(d => ({ ...d, stock: e.target.value }))}/>
                                        {derr("stock") && <ErrMsg>Mínimo 1 unidad</ErrMsg>}
                                    </div>
                                    <div className="field">
                                        <span className="nc-group-label">Vigencia</span>
                                        <div className="nc-vigencia-box">
                                            <Icon name="clock" size={13}/>
                                            <span className="nc-vigencia-val">{expiresLabel}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* e) descripcion */}
                                <div className="field nc-mb16">
                                    <label htmlFor={`${uid}-c-desc`}>Descripción</label>
                                    <textarea id={`${uid}-c-desc`} className="input" rows={2}
                                              placeholder="Contexto adicional del cupón..."
                                              value={couponDraft.description}
                                              onChange={e => setCouponDraft(d => ({ ...d, description: e.target.value }))}/>
                                </div>

                                {/* f) restricciones */}
                                <div className="nc-restr">
                                    <div className="nc-restr-head">
                                        <div className="nc-restr-title">Restricciones de uso</div>
                                        {totalRestrictions > 0 && (
                                            <span className="nc-count">
                                                {totalRestrictions} seleccionada{totalRestrictions > 1 ? "s" : ""}
                                            </span>
                                        )}
                                    </div>
                                    <div className="nc-restr-chips">
                                        {PRESET_RESTRICTIONS.map(p => {
                                            const on = couponDraft.presetRestrictions.has(p);
                                            return (
                                                <button type="button" key={p} className="nc-restr-chip" aria-pressed={on}
                                                        onClick={() => togglePreset(p)}>
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
                                               value={couponDraft.customRestriction}
                                               onChange={e => setCouponDraft(d => ({ ...d, customRestriction: e.target.value }))}
                                               onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomRestriction())}/>
                                        <button type="button" className="btn btn-sm nc-noshrink"
                                                disabled={!couponDraft.customRestriction.trim()}
                                                onClick={addCustomRestriction}>
                                            <Icon name="plus" size={13}/> Añadir
                                        </button>
                                    </div>
                                    {couponDraft.customList.length > 0 && (
                                        <div className="nc-restr-list">
                                            {couponDraft.customList.map((r, i) => (
                                                <div key={r} className="nc-restr-item">
                                                    <Icon name="check" size={12}/>
                                                    <span className="nc-restr-item-text">{r}</span>
                                                    <button type="button" className="nc-restr-remove" aria-label="Quitar restricción" onClick={() => removeCustom(i)}>
                                                        <Icon name="close" size={11}/>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* g) terminos */}
                                <div className="nc-terms">
                                    <div className="nc-terms-title">Términos y condiciones</div>
                                    <textarea className="input" rows={3}
                                              aria-label="Términos y condiciones"
                                              placeholder="El cupón es válido únicamente durante el período indicado. Solo puede ser canjeado una vez por cliente. El establecimiento se reserva el derecho de modificar o cancelar la oferta sin previo aviso..."
                                              value={couponDraft.terms}
                                              onChange={e => setCouponDraft(d => ({ ...d, terms: e.target.value }))}/>
                                </div>

                                <div className="nc-form-actions">
                                    <button type="button" className="btn" disabled={uploading}
                                            onClick={() => { setAddingCoupon(false); setCouponDraft(EMPTY_DRAFT); setCouponSubmit(false); }}>
                                        Cancelar
                                    </button>
                                    <button type="button" className="btn btn-brand nc-grow" onClick={addCoupon} disabled={uploading}>
                                        {uploading ? "Subiendo..." : "Agregar cupón"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button type="button" className={"nc-add-coupon" + (cerr("coupons") ? " error" : "")}
                                    onClick={() => { setAddingCoupon(true); setCouponSubmit(false); }}>
                                <Icon name="plus" size={14}/> Agregar cupón
                            </button>
                        )}

                        {cerr("coupons") && !addingCoupon && (
                            <div className="nc-coupons-err">
                                <Icon name="close" size={12}/> Agrega al menos un cupón para publicar
                            </div>
                        )}
                    </div>
                </div>

                {/* derecha: sidebar */}
                <div className="nc-side">

                    {/* vista previa cliente, usa la CouponCard real */}
                    <div className="card nc-preview-card">
                        <div className="nc-preview-head">
                            <div className="eyebrow">Vista previa — cliente</div>
                            <span className="badge badge-line">mapa</span>
                        </div>
                        <div className="nc-preview-body">
                            {coupons.length === 0 ? (
                                <div className="nc-preview-empty">
                                    <div className="nc-preview-empty-icon"><Icon name="ticket" size={28}/></div>
                                    <div>Los cupones aparecerán aquí</div>
                                </div>
                            ) : (
                                <div className="nc-preview-list">
                                    {coupons.map(c => (
                                        <CouponCard
                                            key={c.id}
                                            c={toCouponPreview(c)}
                                            isReserved={false}
                                            isSelected={false}
                                            onToggleSaved={() => {}}
                                            onClick={() => {}}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* resumen */}
                    <div className="card nc-summary">
                        <div className="eyebrow nc-summary-eyebrow">Resumen</div>
                        <div className="nc-summary-rows">
                            {[
                                { label: "Nombre",   value: name.trim() || "—" },
                                { label: "Tipo",     value: finalType || "—" },
                                { label: "Inicio",   value: startDate ? fmtDate(startDate) : "—" },
                                { label: "Fin",      value: endDate   ? fmtDate(endDate)   : "—" },
                                { label: "Vigencia", value: endDate ? expiresLabel : "—" },
                                { label: "Cupones",  value: coupons.length > 0 ? `${coupons.length} ${coupons.length > 1 ? "cupones" : "cupón"}` : "—" },
                            ].map(row => (
                                <div key={row.label} className="nc-summary-row">
                                    <span className="nc-summary-label">{row.label}</span>
                                    <span className="nc-summary-value">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/*
   convierte un CampaignCoupon en un Coupon
   para reusar la CouponCard real en el preview
   distancia/metros = 0 (dependen del cliente)
*/
function toCouponPreview(c: CampaignCoupon): Coupon {
    return {
        id: c.id,
        brand: "Tu establecimiento",
        category: "food",
        x: 0, y: 0, lat: 0, lng: 0,
        title: c.title,
        discount: c.discount,
        originalPrice: c.originalPrice,
        finalPrice: c.finalPrice,
        distance: 0,
        walking: 0,
        address: "",
        stock: c.stock,
        totalStock: c.stock,
        expiresIn: c.expiresIn,
        rating: 0,
        reviews: 0,
        description: c.description ?? "",
        imageUrl: c.imageUrl,
    };
}

/* small helpers */
function Req() {
    return <span className="req-mark">*</span>;
}
function ErrMsg({ children }: { children: React.ReactNode }) {
    return <span className="field-error">{children}</span>;
}

/* formateo de fecha para la UI (presentacion) */
function fmtDate(dt: string): string {
    if (!dt) return "—";
    return new Date(dt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}