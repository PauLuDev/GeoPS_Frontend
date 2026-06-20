import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Icon} from "@/shared/ui/components/Icon.tsx";
import {Modal} from "@/shared/ui/components/Modal.tsx";
import {LanguageSwitcher} from "@/shared/ui/components/LanguageSwitcher.tsx";
import {Coupon} from "@/shared/types.ts";
import {getCurrentUser} from "@/features/auth/application/session.ts";

interface ProfileViewProps {
    reservedCount: number;
    reservedCoupons?: Coupon[];
    theme?: string;
    onThemeChange?: (t: string) => void;
    onSignOut?: () => void;
    shareLocation?: boolean;
    onShareLocationChange?: (next: boolean) => void;
}

const PREF_ITEMS = [
    { key: "darkMode"      as const, labelKey: "pref.darkMode",      icon: "layers",   descKey: "pref.darkModeDesc" },
    { key: "shareLocation" as const, labelKey: "pref.shareLocation", icon: "location", descKey: "pref.shareLocationDesc" },
] as const;

/* referencia estable para el default y no romper el memo en cada render */
const EMPTY_COUPONS: Coupon[] = [];

export function ProfileView({ reservedCount, reservedCoupons = EMPTY_COUPONS, theme = "light", onThemeChange, onSignOut, shareLocation = false, onShareLocationChange }: ProfileViewProps) {
    const { t } = useTranslation();
    const [editMode, setEditMode] = useState(false);
    const me = getCurrentUser();
    const [profile, setProfile] = useState({
        name: me?.username ?? "",
        email: me?.email ?? "",
        phone: "",
        neighborhood: "",
    });
    const [draft, setDraft] = useState(profile);
    const isDarkMode = theme === "dark";
    const [confirmOut, setConfirmOut] = useState(false);
    const [confirmShareOff, setConfirmShareOff] = useState(false);

    const saveProfile = () => { setProfile(draft); setEditMode(false); };
    const cancelEdit = () => { setDraft(profile); setEditMode(false); };

    const togglePref = (key: "darkMode" | "shareLocation") => {
        if (key === "darkMode") {
            onThemeChange?.(isDarkMode ? "light" : "dark");
            return;
        }
        if (shareLocation) {
            /* apagar requiere confirmación */
            setConfirmShareOff(true);
        } else {
            /* encender pide GPS al padre */
            onShareLocationChange?.(true);
        }
    };

    const confirmDisableShare = () => {
        onShareLocationChange?.(false);
        setConfirmShareOff(false);
    };

    const isPrefOn = (key: "darkMode" | "shareLocation") =>
        key === "darkMode" ? isDarkMode : shareLocation;

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
                            <input className="input pv-name-input" aria-label={t("profile.nameAria")} value={draft.name} placeholder={t("profile.namePlaceholder")}
                                   onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}/>
                        </div>
                    ) : (
                        <>
                            <div className="eyebrow">{t("profile.role")}</div>
                            <div className="pv-name">{profile.name}</div>
                            <div className="pv-contact">
                                <span className="pv-contact-item">
                                    <Icon name="mail" size={11}/> {profile.email || t("profile.noEmail")}
                                </span>
                                <span className="pv-contact-item">
                                    <Icon name="clock" size={11}/> {t("profile.memberSince")}
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
                        <label htmlFor="pf-name">{t("profile.fullName")}</label>
                        <input id="pf-name" className="input" value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder={t("profile.namePlaceholder")}/>
                    </div>
                    <div className="field">
                        <label htmlFor="pf-email">{t("profile.email")}</label>
                        <input id="pf-email" className="input" type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} placeholder={t("profile.emailPlaceholder")}/>
                    </div>
                    <div className="field">
                        <label htmlFor="pf-phone">{t("profile.phone")}</label>
                        <input id="pf-phone" className="input" type="tel" value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} placeholder={t("profile.phonePlaceholder")}/>
                    </div>
                    <div className="field">
                        <label htmlFor="pf-district">{t("profile.district")}</label>
                        <input id="pf-district" className="input" value={draft.neighborhood} onChange={e => setDraft(d => ({ ...d, neighborhood: e.target.value }))} placeholder={t("profile.districtPlaceholder")}/>
                    </div>
                </div>
            )}

            {(() => {
                const savings = reservedCoupons.reduce((s, c) => s + (c.originalPrice - c.finalPrice), 0);
                const locales = new Set(reservedCoupons.map(c => c.brand)).size;
                return (
                    <div className="profile-stats">
                        {[
                            { label: t("profile.statSaved"), value: reservedCount, sub: reservedCount === 0 ? t("profile.statSavedEmpty") : t("profile.statSavedCount", { count: reservedCount }) },
                            { label: t("profile.statSavings"), value: `S/ ${savings}`, sub: savings === 0 ? t("profile.statSavingsEmpty") : t("profile.statSavingsOk"), mono: true },
                            { label: t("profile.statSpots"), value: locales, sub: locales === 0 ? t("profile.statSpotsEmpty") : t("profile.statSpotsCount", { count: locales }), mono: true },
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
                                <div className="pv-pref-label">{t(p.labelKey)}</div>
                                <div className="pv-pref-desc">{t(p.descKey)}</div>
                            </div>
                            <div className={"toggle pv-noshrink" + (isPrefOn(p.key) ? " on" : "")}>
                                <span className="toggle-knob"/>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <button type="button" className="signout-btn" onClick={() => setConfirmOut(true)}>
                <Icon name="arrowLeft" size={14}/> {t("profile.signOut")}
            </button>

            {confirmShareOff && (
                <Modal onClose={() => setConfirmShareOff(false)} ariaLabel={t("pref.shareLocationOffTitle", { defaultValue: "Desactivar ubicación compartida" })} className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon"><Icon name="location" size={20}/></div>
                        <h3 className="est-modal-title">{t("pref.shareLocationOffTitle", { defaultValue: "¿Desactivar compartir ubicación?" })}</h3>
                        <p className="est-modal-text">{t("pref.shareLocationOffText", { defaultValue: "Las marcas dejarán de ver tu ubicación. Algunas ofertas personalizadas no aparecerán." })}</p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setConfirmShareOff(false)}>{t("common.cancel", { defaultValue: "Cancelar" })}</button>
                            <button type="button" className="btn est-del-confirm est-modal-btn" onClick={confirmDisableShare}>{t("pref.shareLocationOffConfirm", { defaultValue: "Sí, desactivar" })}</button>
                        </div>
                    </div>
                </Modal>
            )}

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