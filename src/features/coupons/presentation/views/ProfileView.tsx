import {useState} from "react";
import {Icon} from "@/shared/ui/components/Icon.tsx";
import {Coupon} from "@/shared/types.ts";

interface ProfileViewProps {
    favCount: number;
    reservedCount: number;
    reservedCoupons?: Coupon[];
    onOpenCoupon?: (c: Coupon) => void;
    theme?: string;
    onThemeChange?: (t: string) => void;
    onSignOut?: () => void;
}

const PREF_ITEMS = [
    { key: "notifications" as const, label: "Alertas de cupones cercanos", icon: "bell",     desc: "Notificaciones cuando hay ofertas cerca" },
    { key: "darkMode"      as const, label: "Modo oscuro",                  icon: "layers",   desc: "Cambia la apariencia de la app" },
    { key: "shareLocation" as const, label: "Compartir ubicación con marcas",icon: "location",desc: "Mejora las recomendaciones" },
    { key: "newsletter"    as const, label: "Boletín semanal por email",    icon: "food",     desc: "Resumen de las mejores ofertas" },
] as const;

/* referencia estable para el default y no romper el memo en cada render */
const EMPTY_COUPONS: Coupon[] = [];

export function ProfileView({ favCount, reservedCount, reservedCoupons = EMPTY_COUPONS, onOpenCoupon, theme = "light", onThemeChange, onSignOut }: ProfileViewProps) {
    const [editMode, setEditMode] = useState(false);
    const [profile, setProfile] = useState({
        name: "Daniela Gómez",
        email: "daniela@email.com",
        phone: "",
        neighborhood: "",
    });
    const [draft, setDraft] = useState(profile);
    const isDarkMode = theme === "dark";
    const [prefs, setPrefs] = useState({
        notifications: true,
        shareLocation: false,
        newsletter: false,
    });

    const saveProfile = () => { setProfile(draft); setEditMode(false); };
    const cancelEdit = () => { setDraft(profile); setEditMode(false); };

    const togglePref = (key: keyof typeof prefs | "darkMode") => {
        if (key === "darkMode") {
            onThemeChange?.(isDarkMode ? "light" : "dark");
        } else {
            setPrefs(p => ({ ...p, [key]: !p[key] }));
        }
    };

    const isPrefOn = (key: keyof typeof prefs | "darkMode") =>
        key === "darkMode" ? isDarkMode : prefs[key];

    const initials = profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="pv-root">
            <div className="profile-head">
                <div className="profile-avatar pv-avatar">
                    {initials}
                </div>
                <div className="pv-head-main">
                    {editMode ? (
                        <div className="field">
                            <input className="input pv-name-input" aria-label="Nombre del perfil" value={draft.name} placeholder="Tu nombre"
                                   onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}/>
                        </div>
                    ) : (
                        <>
                            <div className="eyebrow">Perfil de cliente</div>
                            <div className="pv-name">{profile.name}</div>
                            <div className="pv-contact">
                                <span className="pv-contact-item">
                                    <Icon name="user" size={11}/> {profile.email || "sin email"}
                                </span>
                                <span className="pv-contact-item">
                                    <Icon name="clock" size={11}/> Miembro desde may 2026
                                </span>
                            </div>
                        </>
                    )}
                </div>
                {editMode ? (
                    <div className="pv-edit-actions">
                        <button type="button" className="btn btn-sm btn-ghost" onClick={cancelEdit}>Cancelar</button>
                        <button type="button" className="btn btn-sm btn-brand" onClick={saveProfile}><Icon name="check" size={13}/> Guardar</button>
                    </div>
                ) : (
                    <button type="button" className="btn btn-sm pv-noshrink" onClick={() => { setDraft(profile); setEditMode(true); }}>
                        <Icon name="sliders" size={14}/> Editar
                    </button>
                )}
            </div>

            {editMode && (
                <div className="pv-edit-grid">
                    <div className="field pv-field-full">
                        <label htmlFor="pf-name">Nombre completo</label>
                        <input id="pf-name" className="input" value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="Tu nombre"/>
                    </div>
                    <div className="field">
                        <label htmlFor="pf-email">Email</label>
                        <input id="pf-email" className="input" type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} placeholder="tu@email.com"/>
                    </div>
                    <div className="field">
                        <label htmlFor="pf-phone">Teléfono</label>
                        <input id="pf-phone" className="input" type="tel" value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} placeholder="+51 999 000 000"/>
                    </div>
                    <div className="field">
                        <label htmlFor="pf-district">Distrito</label>
                        <input id="pf-district" className="input" value={draft.neighborhood} onChange={e => setDraft(d => ({ ...d, neighborhood: e.target.value }))} placeholder="Miraflores"/>
                    </div>
                </div>
            )}

            {(() => {
                const savings = reservedCoupons.reduce((s, c) => s + (c.originalPrice - c.finalPrice), 0);
                return (
                    <div className="profile-stats">
                        {[
                            { label: "Cupones guardados", value: favCount, sub: favCount === 0 ? "Guarda desde el mapa" : `${favCount} activo${favCount > 1 ? "s" : ""}` },
                            { label: "Reservas activas", value: reservedCount, sub: reservedCount === 0 ? "Reserva un cupón" : `${reservedCount} pendiente${reservedCount > 1 ? "s" : ""}` },
                            { label: "Ahorro acumulado", value: `S/ ${savings}`, sub: savings === 0 ? "Empieza a canjear" : "¡Buen ahorro!", mono: true },
                            { label: "Canjes realizados", value: reservedCoupons.length, sub: reservedCoupons.length === 0 ? "Sin historial aún" : `${reservedCoupons.length} ${reservedCoupons.length > 1 ? "cupones" : "cupón"}`, mono: true },
                        ].map((s) => (
                            <div key={s.label} className="ps-card">
                                <div className="eyebrow">{s.label}</div>
                                <div className={"ps-value" + ((s as { mono?: boolean }).mono ? " mono" : "")}>
                                    {s.value}
                                </div>
                                <div className="ps-sub">{s.sub}</div>
                            </div>
                        ))}
                    </div>
                );
            })()}

            <div className="profile-section">
                <div className="pv-section-head">
                    <div className="eyebrow">Mis canjes</div>
                    {reservedCoupons.length > 0 && (
                        <span className="pv-section-count">{reservedCoupons.length} {reservedCoupons.length > 1 ? "cupones" : "cupón"}</span>
                    )}
                </div>
                {reservedCoupons.length === 0 ? (
                    <div className="pv-empty">
                        <div className="pv-empty-icon">
                            <Icon name="ticket" size={22}/>
                        </div>
                        <div className="pv-empty-title">Sin canjes todavía</div>
                        <div className="pv-empty-sub">
                            Reserva un cupón desde el mapa y aparecerá aquí.
                        </div>
                    </div>
                ) : (
                    <div className="pv-reserved-list">
                        {reservedCoupons.map((c) => (
                            <button type="button" key={c.id} className="pv-reserved-item" onClick={() => onOpenCoupon?.(c)}>
                                <div className="pv-thumb">
                                    {c.imageUrl
                                        ? <img className="pv-thumb-img" src={c.imageUrl} alt=""/>
                                        : <Icon name="ticket" size={20}/>}
                                </div>
                                <div className="pv-item-main">
                                    <div className="pv-item-brand">{c.brand}</div>
                                    <div className="pv-item-title">{c.title}</div>
                                    <div className="pv-item-meta">
                                        <span className="pv-discount-chip">
                                            −{c.discount}
                                        </span>
                                        <span className="pv-code">
                                            GEOPS · {c.id.toUpperCase()} · 7K3X
                                        </span>
                                    </div>
                                </div>
                                <div className="pv-item-side">
                                    <div className="pv-reserved-badge">
                                        Reservado
                                    </div>
                                    <Icon name="chevron" size={13}/>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="profile-section">
                <div className="eyebrow pv-mb4">Preferencias</div>
                <div className="pv-pref-sub">Los cambios se aplican de inmediato</div>
                <div className="pref-grid">
                    {PREF_ITEMS.map(p => (
                        <button type="button" key={p.key} className="pref-row pv-pref-btn"
                                onClick={() => togglePref(p.key)}>
                            <div className="pv-pref-icon">
                                <Icon name={p.icon} size={15}/>
                            </div>
                            <div className="pv-pref-main">
                                <div className="pv-pref-label">{p.label}</div>
                                <div className="pv-pref-desc">{p.desc}</div>
                            </div>
                            <div className={"toggle pv-noshrink" + (isPrefOn(p.key) ? " on" : "")}>
                                <span className="toggle-knob"/>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <button type="button" className="signout-btn" onClick={onSignOut}>
                <Icon name="arrowLeft" size={14}/> Cerrar sesión
            </button>
        </div>
    );
}