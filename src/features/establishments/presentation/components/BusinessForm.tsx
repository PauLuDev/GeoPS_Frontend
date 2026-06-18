import { useEffect, useState, useRef, useId } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Business, BusinessHours } from "@/shared/types.ts";
import { establishmentApi } from "@/features/establishments/infrastructure/api/establishmentApi.ts";
import { CategoryResource } from "@/features/establishments/application/dtos/EstablishmentResource.ts";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const blankHours = (): BusinessHours[] =>
    DAYS.map(day => ({ day, open: "09:00", close: "20:00", closed: false }));

const readFile = (file: File): Promise<string> =>
    new Promise(res => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); });

interface BusinessFormProps {
    initial?: Business | null;
    submitLabel: string;
    onSubmit: (business: Business) => void;
    onCancel: () => void;
}

export function BusinessForm({ initial, submitLabel, onSubmit, onCancel }: BusinessFormProps) {
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
    const [address,     setAddress]     = useState(initial?.address ?? "");
    const [district,    setDistrict]    = useState(initial?.district ?? "");
    const [phone,       setPhone]       = useState(initial?.phone ?? "");
    const [email,       setEmail]       = useState(initial?.email ?? "");
    const [website,     setWebsite]     = useState(initial?.website ?? "");
    const [hours,       setHours]       = useState<BusinessHours[]>(
        initial?.hours?.length
            ? initial.hours.map(h => ({ ...h, closed: h.closed ?? false, open: h.closed ? "09:00" : h.open, close: h.closed ? "20:00" : h.close }))
            : blankHours()
    );

    const [submitted, setSubmitted] = useState(false);

    const errors = {
        name:        !name.trim(),
        category:    categories.length > 0 && categoryId == null,
        description: !description.trim(),
        address:     !address.trim(),
        district:    !district.trim(),
    };
    const isValid = !Object.values(errors).some(Boolean);
    const err = (f: keyof typeof errors) => submitted && errors[f];
    const inputCls = (f: keyof typeof errors) => "input" + (err(f) ? " input-error" : "");

    const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) setLogo(await readFile(f));
    };
    const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const urls = await Promise.all(files.map(readFile));
        setPhotos(prev => [...prev, ...urls]);
        if (photosRef.current) photosRef.current.value = "";
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
            address: address.trim(),
            district: district.trim(),
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
            lat: initial?.lat ?? -12.1,
            lng: initial?.lng ?? -77.03,
        });
    };

    return (
        <>
            {submitted && !isValid && (
                <div className="bf-error-box">
                    <Icon name="close" size={15}/>
                    <div className="bf-error-text">
                        <strong>Completa los campos obligatorios:</strong>
                        <ul className="bf-error-list">
                            {errors.name        && <li>Nombre del establecimiento</li>}
                            {errors.category    && <li>Categoría</li>}
                            {errors.description && <li>Descripción</li>}
                            {errors.address     && <li>Dirección</li>}
                            {errors.district    && <li>Distrito</li>}
                        </ul>
                    </div>
                </div>
            )}

            <div className="bf-grid">
                {/* izquierda: informacion + horarios */}
                <div className="bf-col">
                    <div className="card bf-card">
                        <div className="eyebrow bf-eyebrow">Información del negocio</div>
                        <div className="bf-fields">
                            <div className="field">
                                <label htmlFor={`${fid}-name`}>Nombre del establecimiento <Req/></label>
                                <input id={`${fid}-name`} className={inputCls("name")} placeholder="Ej. Tanta Miraflores"
                                       value={name} onChange={e => setName(e.target.value)}/>
                                {err("name") && <ErrMsg>Campo obligatorio</ErrMsg>}
                            </div>
                            <div className="field">
                                <label htmlFor={`${fid}-desc`}>Descripción <Req/></label>
                                <textarea id={`${fid}-desc`} className={inputCls("description")} rows={3} placeholder="Describe tu negocio, especialidades, ambiente..."
                                          value={description} onChange={e => setDescription(e.target.value)}/>
                                {err("description") && <ErrMsg>Campo obligatorio</ErrMsg>}
                            </div>
                            <div className="field">
                                <span className="bf-group-label">Categoría <Req/></span>
                                <div className="bf-chips">
                                    {categories.length === 0 ? (
                                        <span className="bf-hint">Cargando categorías…</span>
                                    ) : categories.map(c => (
                                        <button type="button" key={c.id}
                                                className={"chip " + (categoryId === c.id ? "active" : "")}
                                                onClick={() => setCategoryId(c.id)}>
                                            <Icon name="store" size={13}/> {c.name}
                                        </button>
                                    ))}
                                </div>
                                {err("category") && <ErrMsg>Selecciona una categoría</ErrMsg>}
                            </div>
                            <div className="bf-row2">
                                <div className="field">
                                    <label htmlFor={`${fid}-address`}>Dirección <Req/></label>
                                    <input id={`${fid}-address`} className={inputCls("address")} placeholder="Av. Pardo 1145"
                                           value={address} onChange={e => setAddress(e.target.value)}/>
                                    {err("address") && <ErrMsg>Obligatorio</ErrMsg>}
                                </div>
                                <div className="field">
                                    <label htmlFor={`${fid}-district`}>Distrito <Req/></label>
                                    <input id={`${fid}-district`} className={inputCls("district")} placeholder="Miraflores"
                                           value={district} onChange={e => setDistrict(e.target.value)}/>
                                    {err("district") && <ErrMsg>Obligatorio</ErrMsg>}
                                </div>
                            </div>
                            <div className="bf-row2">
                                <div className="field">
                                    <label htmlFor={`${fid}-ruc`}>RUC</label>
                                    <input id={`${fid}-ruc`} className="input" placeholder="20123456789"
                                           value={ruc} onChange={e => setRuc(e.target.value)}/>
                                </div>
                                <div className="field">
                                    <label htmlFor={`${fid}-phone`}>Teléfono</label>
                                    <input id={`${fid}-phone`} className="input" placeholder="01 444-2323"
                                           value={phone} onChange={e => setPhone(e.target.value)}/>
                                </div>
                            </div>
                            <div className="bf-row2">
                                <div className="field">
                                    <label htmlFor={`${fid}-email`}>Correo</label>
                                    <input id={`${fid}-email`} className="input" type="email" placeholder="contacto@negocio.com"
                                           value={email} onChange={e => setEmail(e.target.value)}/>
                                </div>
                                <div className="field">
                                    <label htmlFor={`${fid}-web`}>Sitio web</label>
                                    <input id={`${fid}-web`} className="input" placeholder="negocio.com"
                                           value={website} onChange={e => setWebsite(e.target.value)}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* horarios */}
                    <div className="card bf-card">
                        <div className="eyebrow bf-eyebrow">Horarios de atención</div>
                        <div className="bf-hours">
                            {hours.map((h, i) => (
                                <div key={h.day} className={"bf-hours-row" + (h.closed ? " closed" : "") + (i < hours.length - 1 ? " divided" : "")}>
                                    <span className="bf-day">{h.day}</span>
                                    {h.closed ? (
                                        <span className="bf-closed-text">Cerrado</span>
                                    ) : (
                                        <div className="bf-time-range">
                                            <input type="time" className="input bf-time" aria-label={`${h.day} apertura`}
                                                   value={h.open} onChange={e => setHour(i, "open", e.target.value)}/>
                                            <span className="bf-dash">—</span>
                                            <input type="time" className="input bf-time" aria-label={`${h.day} cierre`}
                                                   value={h.close} onChange={e => setHour(i, "close", e.target.value)}/>
                                        </div>
                                    )}
                                    <button type="button" onClick={() => toggleClosed(i)}
                                            className={"chip bf-hours-toggle " + (h.closed ? "active" : "")}>
                                        {h.closed ? "Abrir" : "Cerrado"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* derecha: identidad visual */}
                <div className="bf-side">
                    <div className="card bf-card">
                        <div className="eyebrow bf-eyebrow">Identidad visual</div>

                        {/* logo */}
                        <input ref={logoRef} type="file" accept="image/*" aria-label="Subir logo del negocio" className="bf-hidden-input" onChange={handleLogo}/>
                        <div className="bf-logo-row">
                            <button type="button" onClick={() => logoRef.current?.click()} aria-label="Subir logo del negocio" className="bf-logo-btn">
                                {logo
                                    ? <img src={logo} alt="Logo"/>
                                    : <div className="bf-logo-placeholder"><Icon name="image" size={20}/><div>Logo</div></div>}
                            </button>
                            <div className="bf-logo-info">
                                <div className="bf-logo-name">Logo del negocio</div>
                                <div className="bf-logo-hint">Cuadrado · JPG o PNG</div>
                                <button type="button" className="btn btn-sm" onClick={() => logoRef.current?.click()}>
                                    <Icon name="image" size={12}/> {logo ? "Cambiar" : "Subir logo"}
                                </button>
                            </div>
                        </div>

                        {/* fotos */}
                        <input ref={photosRef} type="file" accept="image/*" multiple aria-label="Subir fotos del establecimiento" className="bf-hidden-input" onChange={handlePhotos}/>
                        <div className="field">
                            <span className="bf-group-label">Fotos del establecimiento</span>
                            <div className="bf-photos-grid">
                                {photos.map((p, i) => (
                                    <div key={p} className="bf-photo">
                                        <img src={p} alt={`Foto ${i + 1}`}/>
                                        <button type="button" onClick={() => removePhoto(i)} aria-label={`Quitar foto ${i + 1}`} className="bf-photo-remove">
                                            <Icon name="close" size={11}/>
                                        </button>
                                        {i === 0 && <span className="bf-photo-cover">Portada</span>}
                                    </div>
                                ))}
                                <button type="button" onClick={() => photosRef.current?.click()} className="bf-photo-add">
                                    <Icon name="plus" size={16}/>
                                    <span>Agregar</span>
                                </button>
                            </div>
                            <span className="bf-hint">La primera foto será la portada en el mapa.</span>
                        </div>
                    </div>

                    {/* acciones */}
                    <div className="card bf-actions">
                        <button type="button" className="btn btn-brand btn-lg bf-fullbtn" onClick={handleSubmit}>
                            {submitLabel} <Icon name="arrowRight" size={15}/>
                        </button>
                        <button type="button" className="btn bf-fullbtn" onClick={onCancel}>
                            Cancelar
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