import {useRef, useState} from "react";
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

export function ProfileView({ favCount, reservedCount, reservedCoupons = [], onOpenCoupon, theme = "light", onThemeChange, onSignOut }: ProfileViewProps) {
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

    const initials = profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div style={{ background: "var(--bg)", minHeight: "100%", overflow: "auto" }}>
            <div className="profile-head">
                <div className="profile-avatar" style={{ background: "var(--brand)", color: "var(--brand-ink)", fontSize: 20, userSelect: "none" }}>
                    {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    {editMode ? (
                        <div className="field">
                            <input className="input" aria-label="Nombre del perfil" value={draft.name} placeholder="Tu nombre"
                                   onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                                   style={{ fontSize: 18, fontWeight: 600 }}/>
                        </div>
                    ) : (
                        <>
                            <div className="eyebrow">Perfil de cliente</div>
                            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>{profile.name}</div>
                            <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon name="user" size={11}/> {profile.email || "sin email"}
                </span>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon name="clock" size={11}/> Miembro desde may 2026
                </span>
                            </div>
                        </>
                    )}
                </div>
                {editMode ? (
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button type="button" className="btn btn-sm btn-ghost" onClick={cancelEdit}>Cancelar</button>
                        <button type="button" className="btn btn-sm btn-brand" onClick={saveProfile}><Icon name="check" size={13}/> Guardar</button>
                    </div>
                ) : (
                    <button type="button" className="btn btn-sm" onClick={() => { setDraft(profile); setEditMode(true); }} style={{ flexShrink: 0 }}>
                        <Icon name="sliders" size={14}/> Editar
                    </button>
                )}
            </div>

            {editMode && (
                <div style={{ padding: "0 28px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, borderBottom: "1px solid var(--line)" }}>
                    <div className="field" style={{ gridColumn: "1 / -1" }}>
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
                            { label: "Canjes realizados", value: reservedCoupons.length, sub: reservedCoupons.length === 0 ? "Sin historial aún" : `${reservedCoupons.length} cupón${reservedCoupons.length > 1 ? "es" : ""}`, mono: true },
                        ].map((s) => (
                            <div key={s.label} className="ps-card">
                                <div className="eyebrow">{s.label}</div>
                                <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 6, fontFamily: (s as any).mono ? "var(--font-mono)" : "var(--font-sans)" }}>
                                    {s.value}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{s.sub}</div>
                            </div>
                        ))}
                    </div>
                );
            })()}

            <div className="profile-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div className="eyebrow">Mis canjes</div>
                    {reservedCoupons.length > 0 && (
                        <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>{reservedCoupons.length} cupón{reservedCoupons.length > 1 ? "es" : ""}</span>
                    )}
                </div>
                {reservedCoupons.length === 0 ? (
                    <div style={{ padding: "28px 0", textAlign: "center" }}>
                        <div className="pv-empty-icon">
                            <Icon name="ticket" size={22}/>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-2)" }}>Sin canjes todavía</div>
                        <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
                            Reserva un cupón desde el mapa y aparecerá aquí.
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {reservedCoupons.map((c) => (
                            <button type="button" key={c.id} className="pv-reserved-item" onClick={() => onOpenCoupon?.(c)}>
                                <div style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0, overflow: "hidden",
                                    background: c.imageUrl ? "transparent"
                                        : `linear-gradient(135deg, color-mix(in oklab, var(--brand) 60%, var(--bg-sunken)), color-mix(in oklab, var(--accent-2) 40%, var(--bg-sunken)))`,
                                    display: "grid", placeItems: "center", position: "relative" }}>
                                    {c.imageUrl
                                        ? <img src={c.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt=""/>
                                        : <Icon name="ticket" size={20} style={{ color: "var(--brand-ink)" }}/>}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 2 }}>{c.brand}</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 6, background: "color-mix(in oklab, var(--brand) 15%, var(--bg-sunken))", color: "var(--brand-strong)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      −{c.discount}
                    </span>
                                        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      GEOPS · {c.id.toUpperCase()} · 7K3X
                    </span>
                                    </div>
                                </div>
                                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                    <div style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: "#22c55e18", color: "#16a34a", fontWeight: 600 }}>
                                        Reservado
                                    </div>
                                    <Icon name="chevron" size={13} style={{ color: "var(--ink-3)" }}/>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="profile-section">
                <div className="eyebrow" style={{ marginBottom: 4 }}>Preferencias</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14 }}>Los cambios se aplican de inmediato</div>
                <div className="pref-grid">
                    {PREF_ITEMS.map(p => (
                        <button type="button" key={p.key} className="pref-row"
                                style={{ width: "100%", background: "transparent", border: 0, fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}
                                onClick={() => togglePref(p.key)}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--bg-sunken)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                                <Icon name={p.icon} size={15}/>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
                                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{p.desc}</div>
                            </div>
                            <div className={"toggle" + (prefs[p.key] ? " on" : "")} style={{ flexShrink: 0 }}>
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