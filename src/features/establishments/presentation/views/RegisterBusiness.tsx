import { useEffect, useRef, useState } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { BrandMark } from "@/shared/ui/components/BrandMark.tsx";
import { Business, BusinessHours } from "@/shared/types.ts";
import { CATEGORIES } from "@/shared/constants.ts";

interface RegisterBusinessProps {
    onDone: (business: Business) => void;
    onBack: () => void;
}

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const blankHours = (): BusinessHours[] =>
    DAYS.map(day => ({ day, open: "09:00", close: "20:00", closed: false }));

const readFile = (file: File): Promise<string> =>
    new Promise(res => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); });

const STEPS = [
    { label: "Información",        title: "Cuéntanos de tu negocio" },
    { label: "Ubicación y contacto", title: "¿Dónde te encuentran?" },
    { label: "Fotos y logo",       title: "Tu identidad visual" },
    { label: "Horarios",           title: "Horarios de atención" },
];

export function RegisterBusiness({ onDone, onBack }: RegisterBusinessProps) {
    const logoRef   = useRef<HTMLInputElement>(null);
    const photosRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const [logo,        setLogo]        = useState("");
    const [photos,      setPhotos]      = useState<string[]>([]);
    const [name,        setName]        = useState("");
    const [description, setDescription] = useState("");
    const [category,    setCategory]    = useState("");
    const [ruc,         setRuc]         = useState("");
    const [address,     setAddress]     = useState("");
    const [district,    setDistrict]    = useState("");
    const [phone,       setPhone]       = useState("");
    const [email,       setEmail]       = useState("");
    const [website,     setWebsite]     = useState("");
    const [hours,       setHours]       = useState<BusinessHours[]>(blankHours());

    /* carrusel del panel derecho */
    const [slide, setSlide] = useState(0);
    useEffect(() => {
        if (photos.length <= 1) return;
        const id = setInterval(() => setSlide(s => (s + 1) % photos.length), 3000);
        return () => clearInterval(id);
    }, [photos.length]);

    const stepErrors: Record<number, boolean> = {
        0: !name.trim() || !description.trim() || !category,
        1: !address.trim() || !district.trim(),
        2: false,
        3: false,
    };
    const inputCls = (bad: boolean) => "input" + (submitted && bad ? " input-error" : "");

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

    const next = () => {
        setSubmitted(true);
        if (stepErrors[step]) return;
        if (step < STEPS.length - 1) { setStep(step + 1); setSubmitted(false); }
        else submit();
    };
    const prev = () => { if (step > 0) { setStep(step - 1); setSubmitted(false); } else onBack(); };

    const submit = () => {
        onDone({
            id: `b-${Date.now()}`,
            ruc: ruc.trim() || "No disponible",
            name: name.trim(),
            address: address.trim(),
            district: district.trim(),
            phone: phone.trim() || undefined,
            email: email.trim() || undefined,
            website: website.trim() || undefined,
            category,
            description: description.trim(),
            rating: 0,
            totalReviews: 0,
            hours: hours.map(h => h.closed ? { ...h, open: "—", close: "—" } : h),
            imageUrl: photos[0] || logo || undefined,
            logo: logo || undefined,
            photos,
            lat: -12.1,
            lng: -77.03,
        });
    };

    const cat = CATEGORIES.find(c => c.id === category);

    return (
        <div className="rw">
            {/* panel izquierdo: pasos */}
            <div className="rw-left">
                <div className="rw-top">
                    <div className="brand"><BrandMark/><span>GeoPS</span></div>
                    <button type="button" className="btn btn-sm back-btn rw-exit" onClick={onBack}>
                        <Icon name="close" size={14}/> Salir
                    </button>
                </div>

                <div className="rw-content">
                    <div className="rw-step-label">
                        {String(step + 1).padStart(2, "0")} / {STEPS.length.toString().padStart(2, "0")} · {STEPS[step].label.toUpperCase()}
                    </div>
                    <h1 className="rw-title">{STEPS[step].title}</h1>

                    {submitted && stepErrors[step] && (
                        <div className="rw-error"><Icon name="close" size={14}/> Completa los campos obligatorios para continuar.</div>
                    )}

                    {/* paso 0 -> informacion */}
                    {step === 0 && (
                        <div className="rw-fields">
                            <div className="field">
                                <label>Nombre del establecimiento <Req/></label>
                                <input className={inputCls(!name.trim())} placeholder="Ej. Tanta Miraflores"
                                       value={name} onChange={e => setName(e.target.value)}/>
                            </div>
                            <div className="field">
                                <label>Descripción <Req/></label>
                                <textarea className={inputCls(!description.trim())} rows={3} placeholder="Describe tu negocio, especialidades, ambiente..."
                                          value={description} onChange={e => setDescription(e.target.value)}/>
                            </div>
                            <div className="field">
                                <span className="bf-group-label">Categoría <Req/></span>
                                <div className="bf-chips">
                                    {CATEGORIES.slice(1).map(c => (
                                        <button type="button" key={c.id}
                                                className={"chip " + (category === c.id ? "active" : "")}
                                                onClick={() => setCategory(c.id)}>
                                            <Icon name={c.icon} size={13}/> {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* paso 1 -> ubicacion y contacto */}
                    {step === 1 && (
                        <div className="rw-fields">
                            <div className="bf-row2">
                                <div className="field">
                                    <label>Dirección <Req/></label>
                                    <input className={inputCls(!address.trim())} placeholder="Av. Pardo 1145"
                                           value={address} onChange={e => setAddress(e.target.value)}/>
                                </div>
                                <div className="field">
                                    <label>Distrito <Req/></label>
                                    <input className={inputCls(!district.trim())} placeholder="Miraflores"
                                           value={district} onChange={e => setDistrict(e.target.value)}/>
                                </div>
                            </div>
                            <div className="bf-row2">
                                <div className="field">
                                    <label>RUC</label>
                                    <input className="input" placeholder="20123456789" value={ruc} onChange={e => setRuc(e.target.value)}/>
                                </div>
                                <div className="field">
                                    <label>Teléfono</label>
                                    <input className="input" placeholder="01 444-2323" value={phone} onChange={e => setPhone(e.target.value)}/>
                                </div>
                            </div>
                            <div className="bf-row2">
                                <div className="field">
                                    <label>Correo</label>
                                    <input className="input" type="email" placeholder="contacto@negocio.com" value={email} onChange={e => setEmail(e.target.value)}/>
                                </div>
                                <div className="field">
                                    <label>Sitio web</label>
                                    <input className="input" placeholder="negocio.com" value={website} onChange={e => setWebsite(e.target.value)}/>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* paso 2: fotos y logo */}
                    {step === 2 && (
                        <div className="rw-fields">
                            <input ref={logoRef} type="file" accept="image/*" className="bf-hidden-input" onChange={handleLogo} aria-label="Subir logo"/>
                            <div className="bf-logo-row">
                                <button type="button" onClick={() => logoRef.current?.click()} className="bf-logo-btn" aria-label="Subir logo">
                                    {logo ? <img src={logo} alt="Logo"/> : <div className="bf-logo-placeholder"><Icon name="image" size={20}/><div>Logo</div></div>}
                                </button>
                                <div className="bf-logo-info">
                                    <div className="bf-logo-name">Logo del negocio</div>
                                    <div className="bf-logo-hint">Cuadrado · JPG o PNG</div>
                                    <button type="button" className="btn btn-sm" onClick={() => logoRef.current?.click()}>
                                        <Icon name="image" size={12}/> {logo ? "Cambiar" : "Subir logo"}
                                    </button>
                                </div>
                            </div>

                            <input ref={photosRef} type="file" accept="image/*" multiple className="bf-hidden-input" onChange={handlePhotos} aria-label="Subir fotos"/>
                            <div className="field">
                                <span className="bf-group-label">Fotos del establecimiento</span>
                                <div className="bf-photos-grid">
                                    {photos.map((p, i) => (
                                        <div key={p} className="bf-photo">
                                            <img src={p} alt={`Foto ${i + 1}`}/>
                                            <button type="button" onClick={() => removePhoto(i)} className="bf-photo-remove" aria-label={`Quitar foto ${i + 1}`}>
                                                <Icon name="close" size={11}/>
                                            </button>
                                            {i === 0 && <span className="bf-photo-cover">Portada</span>}
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => photosRef.current?.click()} className="bf-photo-add">
                                        <Icon name="plus" size={16}/><span>Agregar</span>
                                    </button>
                                </div>
                                <span className="bf-hint">La primera foto será la portada en el mapa.</span>
                            </div>
                        </div>
                    )}

                    {/* paso 3: horarios */}
                    {step === 3 && (
                        <div className="rw-fields bf-hours">
                            {hours.map((h, i) => (
                                <div key={h.day} className={"bf-hours-row" + (h.closed ? " closed" : "") + (i < hours.length - 1 ? " divided" : "")}>
                                    <span className="bf-day">{h.day}</span>
                                    {h.closed ? (
                                        <span className="bf-closed-text">Cerrado</span>
                                    ) : (
                                        <div className="bf-time-range">
                                            <input type="time" className="input bf-time" aria-label={`${h.day} apertura`} value={h.open} onChange={e => setHour(i, "open", e.target.value)}/>
                                            <span className="bf-dash">—</span>
                                            <input type="time" className="input bf-time" aria-label={`${h.day} cierre`} value={h.close} onChange={e => setHour(i, "close", e.target.value)}/>
                                        </div>
                                    )}
                                    <button type="button" onClick={() => toggleClosed(i)} className={"chip bf-hours-toggle " + (h.closed ? "active" : "")}>
                                        {h.closed ? "Abrir" : "Cerrado"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* pie -> progreso y navegacion */}
                <div className="rw-foot">
                    <div className="rw-dots">
                        {STEPS.map((_, i) => (
                            <span key={i} className={"rw-dot" + (i === step ? " active" : "") + (i < step ? " done" : "")}/>
                        ))}
                    </div>
                    <div className="rw-nav">
                        <button type="button" className="btn" onClick={prev}>
                            {step === 0 ? "Cancelar" : "Anterior"}
                        </button>
                        <button type="button" className="btn btn-brand" onClick={next}>
                            {step === STEPS.length - 1 ? "Registrar negocio" : "Siguiente"} <Icon name="arrowRight" size={15}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* panel derecho: vista previa visual (carrusel de fotos) */}
            <div className="rw-right">
                {photos.length > 0 ? (
                    <>
                        {photos.map((src, i) => (
                            <img key={i} className={"rw-photo" + (i === slide ? " active" : "")} src={src} alt={`Foto ${i + 1}`}/>
                        ))}
                        <div className="rw-right-scrim"/>
                        <div className="rw-right-card">
                            <div className="rw-right-logo">
                                {logo ? <img src={logo} alt="Logo"/> : <Icon name="store" size={20}/>}
                            </div>
                            <div>
                                <div className="rw-right-name">{name || "Tu negocio"}</div>
                                <div className="rw-right-meta">
                                    {cat && <><Icon name={cat.icon} size={11}/> {cat.label}</>}
                                    {district && <> · {district}</>}
                                </div>
                            </div>
                        </div>
                        {photos.length > 1 && (
                            <div className="rw-right-dots">
                                {photos.map((_, i) => (
                                    <button type="button" key={i} className={"rw-right-dot" + (i === slide ? " active" : "")}
                                            aria-label={`Foto ${i + 1}`} onClick={() => setSlide(i)}/>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="rw-right-empty">
                        <div className="rw-right-empty-icon"><Icon name="image" size={34}/></div>
                        <div className="rw-right-empty-title">Vista previa de tu local</div>
                        <div className="rw-right-empty-sub">Sube fotos en el paso "Fotos y logo" y aquí verás cómo lucirá tu negocio para los clientes.</div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Req() { return <span className="req-mark">*</span>; }