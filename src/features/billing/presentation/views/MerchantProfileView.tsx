import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { LanguageSwitcher } from "@/shared/ui/components/LanguageSwitcher.tsx";
import { getCurrentUser } from "@/features/auth/application/session.ts";

interface MerchantProfileViewProps {
    theme?: string;
    onThemeChange?: (t: string) => void;
    onSignOut?: () => void;
}

const PREF_ITEMS = [
    { key: "darkMode" as const, label: "Modo oscuro", icon: "layers", desc: "Cambia la apariencia de la aplicación" },
] as const;

export function MerchantProfileView({ theme = "light", onThemeChange, onSignOut }: MerchantProfileViewProps) {
    const { t } = useTranslation();
    const [editMode, setEditMode] = useState(false);
    const me = getCurrentUser();
    const [profile, setProfile] = useState({
        name: me?.username ?? "",
        email: me?.email ?? "",
        phone: "",
        district: "",
    });
    const [draft, setDraft] = useState(profile);
    const isDarkMode = theme === "dark";
    const [confirmOut, setConfirmOut] = useState(false);

    const saveProfile = () => { setProfile(draft); setEditMode(false); };
    const cancelEdit = () => { setDraft(profile); setEditMode(false); };

    const togglePref = (key: "darkMode") => {
        if (key === "darkMode") onThemeChange?.(isDarkMode ? "light" : "dark");
    };

    const isPrefOn = (key: "darkMode") => (key === "darkMode" ? isDarkMode : false);

    const initials = profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="md pv-merchant">
            <div className="profile-head">
                <div className="profile-avatar pv-avatar">
                    {initials}
                </div>
                <div className="pv-head-main">
                    {editMode ? (
                        <div className="field">
                            <input className="input pv-name-input" aria-label="Nombre" value={draft.name} placeholder="Tu nombre"
                                   onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}/>
                        </div>
                    ) : (
                        <>
                            <div className="eyebrow">Perfil dueño de negocio</div>
                            <div className="pv-name">{profile.name}</div>
                            <div className="pv-contact">
                                <span className="pv-contact-item">
                                    <Icon name="mail" size={11}/> {profile.email}
                                </span>
                                <span className="pv-contact-item">
                                    <Icon name="clock" size={11}/> Miembro desde 2026
                                </span>
                            </div>
                        </>
                    )}
                </div>
                {editMode ? (
                    <div className="pv-edit-actions">
                        <button type="button" className="btn btn-sm btn-ghost" onClick={cancelEdit}>{t("common.cancel")}</button>
                        <button type="button" className="btn btn-sm btn-brand" onClick={saveProfile}><Icon name="check" size={13}/> {t("common.save")}</button>
                    </div>
                ) : (
                    <button type="button" className="btn btn-sm pv-noshrink" onClick={() => { setDraft(profile); setEditMode(true); }}>
                        <Icon name="edit" size={14}/> {t("common.edit")}
                    </button>
                )}
            </div>

            {editMode && (
                <div className="pv-edit-grid">
                    <div className="field pv-field-full">
                        <label htmlFor="mp-name">Nombre completo</label>
                        <input id="mp-name" className="input" value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="Tu nombre"/>
                    </div>
                    <div className="field">
                        <label htmlFor="mp-email">Correo electrónico</label>
                        <input id="mp-email" className="input" type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} placeholder="correo@ejemplo.com"/>
                    </div>
                    <div className="field">
                        <label htmlFor="mp-phone">Teléfono</label>
                        <input id="mp-phone" className="input" type="tel" value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} placeholder="+51 999 999 999"/>
                    </div>
                    <div className="field">
                        <label htmlFor="mp-district">Distrito</label>
                        <input id="mp-district" className="input" value={draft.district} onChange={e => setDraft(d => ({ ...d, district: e.target.value }))} placeholder="Miraflores"/>
                    </div>
                </div>
            )}

            <div className="profile-section">
                <div className="eyebrow pv-mb4">{t("profile.preferences")}</div>
                <div className="pref-grid">
                    <div className="pref-row pv-lang-row">
                        <div className="pv-pref-icon">
                            <Icon name="globe" size={15}/>
                        </div>
                        <div className="pv-pref-main">
                            <div className="pv-pref-label">{t("lang.label")}</div>
                            <div className="pv-pref-desc">{t("lang.sub")}</div>
                        </div>
                        <LanguageSwitcher/>
                    </div>
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

            <div className="pv-foot-divider"/>
            <button type="button" className="signout-btn" onClick={() => setConfirmOut(true)}>
                <Icon name="arrowLeft" size={14}/> {t("profile.signOut")}
            </button>

            {confirmOut && (
                <Modal onClose={() => setConfirmOut(false)} ariaLabel={t("profile.signOutConfirmTitle")} className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon"><Icon name="arrowLeft" size={20}/></div>
                        <h3 className="est-modal-title">{t("profile.signOutConfirmTitle")}</h3>
                        <p className="est-modal-text">{t("profile.signOutConfirmText")}</p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setConfirmOut(false)}>{t("common.cancel")}</button>
                            <button type="button" className="btn est-del-confirm est-modal-btn" onClick={onSignOut}>{t("profile.signOutConfirm")}</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}