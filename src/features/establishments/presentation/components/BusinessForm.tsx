import { useEffect, useState, useRef, useId } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Business, BusinessHours } from "@/shared/types.ts";
import { establishmentApi } from "@/features/establishments/infrastructure/api/establishmentApi.ts";
import { CategoryResource } from "@/features/establishments/application/dtos/EstablishmentResource.ts";
import { AddressPicker, type AddressValue } from "./AddressPicker.tsx";
import { TimePicker } from "@/shared/ui/components/TimePicker.tsx";
import { uploadImage } from "@/shared/cloudinary.ts";
import { areaCodeForRegion } from "@/shared/constants.ts";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const blankHours = (): BusinessHours[] =>
    DAYS.map(day => ({ day, open: "09:00", close: "20:00", closed: false }));

const sanitizeRuc = (val: string) => val.replace(/\D/g, "").slice(0, 9);


const sanitizePhone = (val: string) => val.replace(/\D/g, "").slice(0, 9);

const translateDay = (day: string, t: any) => {
    switch (day.toLowerCase()) {
        case "lunes": return t("days.mon");
        case "martes": return t("days.tue");
        case "miércoles": case "miercoles": return t("days.wed");
        case "jueves": return t("days.thu");
        case "viernes": return t("days.fri");
        case "sábado": case "sabado": return t("days.sat");
        case "domingo": return t("days.sun");
        default: return day;
    }
};

interface BusinessFormProps {
    initial?: Business | null;
    submitLabel: string;
    onSubmit: (business: Business) => void;
    onCancel: () => void;
}

export function BusinessForm({ initial, submitLabel, onSubmit, onCancel }: BusinessFormProps) {
    const { t } = useTranslation();
    const fid = useId();
    const logoRef   = useRef<HTMLInputElement>(null);
    const photosRef = useRef<HTMLInputElement>(null);

    const [logo,        setLogo]        = useState(initial?.imageUrl && !initial.photos?.length ? initial.imageUrl : initial?.logo ?? "");
    const [photos,      setPhotos]      = useState<string[]>(initial?.photos ?? (initial?.imageUrl ? [initial.imageUrl] : []));
    const [name,        setName]        = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [categoryId,  setCategoryId]  = useState<number | null>(initial?.categoryId ?? null);
    const [categories,  setCategories]  = useState<CategoryResource[]>([]);

    /* categorias reales del back para elegir la del establecimiento */
    useEffect(() => {
        establishmentApi.listCategories().then(setCategories).catch(() => setCategories([]));
    }, []);
    const [ruc,         setRuc]         = useState(initial?.ruc && initial.ruc !== "No disponible" ? initial.ruc : "");
    const [addrValue,   setAddrValue]   = useState<AddressValue>({
        address:  initial?.address  ?? "",
        district: initial?.district ?? "",
        lat:      initial?.lat      ?? -12.05,
        lng:      initial?.lng      ?? -77.05,
    });
    const [phone,       setPhone]       = useState(initial?.phone ?? "");

    const areaCode = areaCodeForRegion(addrValue.region);
    const phonePlaceholder = `${areaCode} 4442323`;
    const [email,       setEmail]       = useState(initial?.email ?? "");
    const [website,     setWebsite]     = useState(initial?.website ?? "");
    const [hours,       setHours]       = useState<BusinessHours[]>(
        initial?.hours?.length
            ? initial.hours.map(h => ({ ...h, closed: h.closed ?? false, open: h.closed ? "09:00" : h.open, close: h.closed ? "20:00" : h.close }))
            : blankHours()
    );

    const [submitted, setSubmitted] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const errors = {
        name:        !name.trim(),
        category:    categories.length > 0 && categoryId == null,
        description: !description.trim(),
        address:     !addrValue.address.trim(),
        district:    !addrValue.district.trim(),
        phone:       phone.trim() ? phone.replace(/\D/g, "").length !== 9 : false,
    };
    const isValid = !Object.values(errors).some(Boolean);
    const err = (f: keyof typeof errors) => submitted && errors[f];
    const inputCls = (f: keyof typeof errors) => "input" + (err(f) ? " input-error" : "");

    const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setUploading(true); setUploadError(null);
        try {
            setLogo(await uploadImage(f));
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "No se pudo subir el logo");
        } finally {
            setUploading(false);
            if (logoRef.current) logoRef.current.value = "";
        }
    };
    const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setUploading(true); setUploadError(null);
        try {
            const urls = await Promise.all(files.map(uploadImage));
            setPhotos(prev => [...prev, ...urls]);
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "No se pudieron subir las fotos");
        } finally {
            setUploading(false);
            if (photosRef.current) photosRef.current.value = "";
        }
    };
    const removePhoto = (i: number) => setPhotos(prev => prev.filter((_, j) => j !== i));

    const setHour = (i: number, field: "open" | "close", val: string) =>
        setHours(prev => prev.map((h, j) => j === i ? { ...h, [field]: val } : h));
    const toggleClosed = (i: number) =>
        setHours(prev => prev.map((h, j) => j === i ? { ...h, closed: !h.closed } : h));

    const handleSubmit = () => {
        setSubmitted(true);
        if (!isValid) return;
        onSubmit({
            id: initial?.id ?? `b-${Date.now()}`,
            ruc: ruc.trim() || "No disponible",
            name: name.trim(),
            address: addrValue.address.trim(),
            district: addrValue.district.trim(),
            phone: phone.trim() || undefined,
            email: email.trim() || undefined,
            website: website.trim() || undefined,
            category: categories.find(c => c.id === categoryId)?.name ?? initial?.category ?? "",
            categoryId: categoryId ?? undefined,
            description: description.trim(),
            rating: initial?.rating ?? 0,
            totalReviews: initial?.totalReviews ?? 0,
            hours: hours.map(h => h.closed ? { ...h, open: "—", close: "—" } : h),
            imageUrl: photos[0] || logo || undefined,
            logo: logo || undefined,
            photos,
            lat: addrValue.lat,
            lng: addrValue.lng,
        });
    };

    return (
        <>
            {submitted && !isValid && (
                <div className="bf-error-box">
                    <Icon name="close" size={15}/>
                    <div className="bf-error-text">
                        <strong>{t("businessForm.requiredFields")}</strong>
                        <ul className="bf-error-list">
                            {errors.name        && <li>{t("businessForm.name")}</li>}
                            {errors.category    && <li>{t("businessForm.category")}</li>}
                            {errors.description && <li>{t("businessForm.description")}</li>}
                            {errors.address     && <li>{t("businessForm.address")}</li>}
                            {errors.district    && <li>Distrito</li>}
                        </ul>
                    </div>
                </div>
            )}

            <div className="bf-grid">
                {/* izquierda: informacion + horarios */}
                <div className="bf-col">
                    <div className="card bf-card">
                        <div className="eyebrow bf-eyebrow">{t("businessForm.businessInfo")}</div>
                        <div className="bf-fields">
                            <div className="field">
                                <label htmlFor={`${fid}-name`}>{t("businessForm.name")} <Req/></label>
                                <input id={`${fid}-name`} className={inputCls("name")} placeholder="Ej. Tanta Miraflores"
                                       value={name} onChange={e => setName(e.target.value)}/>
                                {err("name") && <ErrMsg>{t("campaigns.newForm.required")}</ErrMsg>}
                            </div>
                            <div className="field">
                                <label htmlFor={`${fid}-desc`}>{t("businessForm.description")} <Req/></label>
                                <textarea id={`${fid}-desc`} className={inputCls("description")} rows={3} placeholder={t("businessForm.descPlaceholder")}
                                          value={description} onChange={e => setDescription(e.target.value)}/>
                                {err("description") && <ErrMsg>{t("campaigns.newForm.required")}</ErrMsg>}
                            </div>
                            <div className="field">
                                <span className="bf-group-label">{t("businessForm.category")} <Req/></span>
                                <div className="bf-chips">
                                    {categories.length === 0 ? (
                                        <span className="bf-hint">{t("businessForm.loadingCategories")}</span>
                                    ) : categories.map(c => (
                                        <button type="button" key={c.id}
                                                className={"chip " + (categoryId === c.id ? "active" : "")}
                                                onClick={() => setCategoryId(c.id)}>
                                            <Icon name="store" size={13}/> {c.name}
                                        </button>
                                    ))}
                                </div>
                                {err("category") && <ErrMsg>{t("businessForm.categoryRequired")}</ErrMsg>}
                            </div>
                            <div className="field">
                                <label>{t("businessForm.address")} <Req/></label>
                                <AddressPicker
                                    value={addrValue}
                                    onChange={setAddrValue}
                                    error={submitted && (errors.address || errors.district)}
                                />
                                {submitted && errors.address && <ErrMsg>{t("businessForm.addressRequired")}</ErrMsg>}
                                {submitted && !errors.address && errors.district && <ErrMsg>{t("businessForm.districtRequired")}</ErrMsg>}
                            </div>
                            <div className="bf-row2">
                                <div className="field">
                                    <label htmlFor={`${fid}-ruc`}>{t("businessForm.ruc")}</label>
                                    <input id={`${fid}-ruc`} className="input" placeholder="20123456789"
                                           inputMode="numeric" maxLength={9}
                                           value={ruc} onChange={e => setRuc(sanitizeRuc(e.target.value))}/>
                                </div>
                                <div className="field">
                                    <label htmlFor={`${fid}-phone`}>{t("businessForm.phone")}</label>
                                    <input id={`${fid}-phone`} className={inputCls("phone")} placeholder="999888777"
                                           inputMode="tel" maxLength={9}
                                           value={phone} onChange={e => setPhone(sanitizePhone(e.target.value))}/>
                                    <span className="bf-hint">{t("businessForm.phoneHint")}</span>
                                    {err("phone") && <span className="field-error">{t("businessForm.phoneError")}</span>}
                                </div>
                            </div>
                            <div className="bf-row2">
                                <div className="field">
                                    <label htmlFor={`${fid}-email`}>{t("businessForm.email")}</label>
                                    <input id={`${fid}-email`} className="input" type="email" placeholder="contacto@negocio.com"
                                           value={email} onChange={e => setEmail(e.target.value)}/>
                                </div>
                                <div className="field">
                                    <label htmlFor={`${fid}-web`}>{t("businessForm.website")}</label>
                                    <input id={`${fid}-web`} className="input" placeholder="negocio.com"
                                           value={website} onChange={e => setWebsite(e.target.value)}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* horarios */}
                    <div className="card bf-card">
                        <div className="eyebrow bf-eyebrow">{t("businessForm.hours")}</div>
                        <div className="bf-hours">
                            {hours.map((h, i) => (
                                <div key={h.day} className={"bf-hours-row" + (h.closed ? " closed" : "") + (i < hours.length - 1 ? " divided" : "")}>
                                    <span className="bf-day">{translateDay(h.day, t)}</span>
                                    {h.closed ? (
                                        <span className="bf-closed-text">{t("businessForm.closed")}</span>
                                    ) : (
                                        <div className="bf-time-range">
                                            <TimePicker className="bf-time" aria-label={`${h.day} apertura`}
                                                        value={h.open} onChange={v => setHour(i, "open", v)}/>
                                            <span className="bf-dash">—</span>
                                            <TimePicker className="bf-time" aria-label={`${h.day} cierre`}
                                                        value={h.close} onChange={v => setHour(i, "close", v)}/>
                                        </div>
                                    )}
                                    <button type="button" onClick={() => toggleClosed(i)}
                                            className={"chip bf-hours-toggle " + (h.closed ? "active" : "")}>
                                        {h.closed ? t("businessForm.open") : t("businessForm.closed")}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* derecha: identidad visual */}
                <div className="bf-side">
                    <div className="card bf-card">
                        <div className="eyebrow bf-eyebrow">{t("businessForm.visualIdentity")}</div>
 
                        {/* logo */}
                        <input ref={logoRef} type="file" accept="image/*" aria-label={t("businessForm.logoUploadAria")} className="bf-hidden-input" onChange={handleLogo}/>
                        <div className="bf-logo-row">
                            <button type="button" onClick={() => logoRef.current?.click()} aria-label={t("businessForm.logoUploadAria")} className="bf-logo-btn">
                                {logo
                                    ? <img src={logo} alt="Logo"/>
                                    : <div className="bf-logo-placeholder"><Icon name="image" size={20}/><div>{t("businessForm.logoText")}</div></div>}
                            </button>
                            <div className="bf-logo-info">
                                <div className="bf-logo-name">{t("businessForm.logoLabel")}</div>
                                <div className="bf-logo-hint">{t("businessForm.logoHint")}</div>
                                <button type="button" className="btn btn-sm" onClick={() => logoRef.current?.click()}>
                                    <Icon name="image" size={12}/> {logo ? t("businessForm.changeLogo") : t("businessForm.uploadLogo")}
                                </button>
                            </div>
                        </div>                          {/* fotos */}
                        <input ref={photosRef} type="file" accept="image/*" multiple aria-label={t("businessForm.photosUploadAria")} className="bf-hidden-input" onChange={handlePhotos}/>
                        <div className="field">
                            <span className="bf-group-label">{t("businessForm.photosLabel")}</span>
                            <div className="bf-photos-grid">
                                {photos.map((p, i) => (
                                    <div key={p} className="bf-photo">
                                        <img src={p} alt={`Foto ${i + 1}`}/>
                                        <button type="button" onClick={() => removePhoto(i)} aria-label={`Quitar foto ${i + 1}`} className="bf-photo-remove">
                                            <Icon name="close" size={11}/>
                                        </button>
                                        {i === 0 && <span className="bf-photo-cover">{t("businessForm.photoCover")}</span>}
                                    </div>
                                ))}
                                <button type="button" onClick={() => photosRef.current?.click()} className="bf-photo-add">
                                    <Icon name="plus" size={16}/>
                                    <span>{t("businessForm.photoAdd")}</span>
                                </button>
                            </div>
                            <span className="bf-hint">{t("businessForm.photosHint")}</span>
                            {uploading && <span className="bf-hint"><Icon name="image" size={11}/> {t("businessForm.uploading")}</span>}
                            {uploadError && <ErrMsg>{uploadError}</ErrMsg>}
                        </div>
                    </div>
 
                    {/* acciones */}
                    <div className="card bf-actions">
                        <button type="button" className="btn btn-brand btn-lg bf-fullbtn" onClick={handleSubmit} disabled={uploading}>
                            {uploading ? t("businessForm.uploading") : submitLabel} <Icon name="arrowRight" size={15}/>
                        </button>
                        <button type="button" className="btn bf-fullbtn" onClick={onCancel}>
                            {t("common.cancel")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function Req() { return <span className="req-mark">*</span>; }
function ErrMsg({ children }: { children: React.ReactNode }) {
    return <span className="field-error">{children}</span>;
}