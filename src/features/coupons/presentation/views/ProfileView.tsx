import {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {Icon} from "@/shared/ui/components/Icon.tsx";
import {Modal} from "@/shared/ui/components/Modal.tsx";
import {LanguageSwitcher} from "@/shared/ui/components/LanguageSwitcher.tsx";
import {Coupon} from "@/shared/types.ts";
import {getCurrentUser} from "@/features/auth/application/session.ts";
import {profileApi, ProfileResource} from "@/features/auth/infrastructure/api/profileApi.ts";
import {uploadImage} from "@/shared/cloudinary.ts";

interface ProfileViewProps {
    reservedCount: number;
    reservedCoupons?: Coupon[];
    theme?: string;
    onThemeChange?: (t: string) => void;
    onSignOut?: () => void;
    shareLocation?: boolean;
    onShareLocationChange?: (next: boolean) => void;
    /* perfil compartido (cargado por el padre) y callback al guardar */
    profileData?: ProfileResource | null;
    onProfileSaved?: (p: ProfileResource) => void;
}

const PREF_ITEMS = [
    { key: "darkMode"      as const, labelKey: "pref.darkMode",      icon: "layers",   descKey: "pref.darkModeDesc" },
    { key: "shareLocation" as const, labelKey: "pref.shareLocation", icon: "location", descKey: "pref.shareLocationDesc" },
] as const;

/* referencia estable para el default y no romper el memo en cada render */
const EMPTY_COUPONS: Coupon[] = [];

interface ProfileForm {
    profileId?: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    district: string;   // solo local (el back no lo guarda)
}

export function ProfileView({ reservedCount, reservedCoupons = EMPTY_COUPONS, theme = "light", onThemeChange, onSignOut, shareLocation = false, onShareLocationChange, profileData, onProfileSaved }: ProfileViewProps) {
    const { t } = useTranslation();
    const [editMode, setEditMode] = useState(false);
    const me = getCurrentUser();
    const fileRef = useRef<HTMLInputElement>(null);

    /* perfil real del back (nombre, apellido, foto); distrito es solo local */
    const [profile, setProfile] = useState<ProfileForm>({
        firstName: me?.username ?? "",
        lastName: "",
        avatarUrl: undefined,
        district: (() => { try { return localStorage.getItem("geops_profile_district") ?? ""; } catch { return ""; } })(),
    });
    const [draft, setDraft] = useState(profile);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const isDarkMode = theme === "dark";
    const [confirmOut, setConfirmOut] = useState(false);
    const [confirmShareOff, setConfirmShareOff] = useState(false);

    /* sincroniza con el perfil que carga el padre (topbar/CustomerMap) */
    useEffect(() => {
        if (!profileData) return;
        const next: ProfileForm = {
            profileId: profileData.profileId,
            firstName: profileData.firstName ?? "",
            lastName: profileData.lastName ?? "",
            avatarUrl: profileData.avatarUrl ?? undefined,
            district: (() => { try { return localStorage.getItem("geops_profile_district") ?? ""; } catch { return ""; } })(),
        };
        setProfile(next);
        if (!editMode) setDraft(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileData]);

    const saveProfile = async () => {
        if (!draft.firstName.trim()) return;
        try { localStorage.setItem("geops_profile_district", draft.district); } catch { /* ignore */ }
        if (draft.profileId) {
            setSaving(true);
            try {
                const p = await profileApi.update(draft.profileId, {
                    firstName: draft.firstName.trim(),
                    lastName: draft.lastName.trim() || draft.firstName.trim(),
                    avatarUrl: draft.avatarUrl ?? null,
                });
                setProfile({ ...draft, firstName: p.firstName, lastName: p.lastName, avatarUrl: p.avatarUrl ?? undefined });
                onProfileSaved?.(p);   // sincroniza el topbar
            } catch {
                setProfile(draft);   // si el back falla, igual reflejamos local
            } finally {
                setSaving(false);
            }
        } else {
            setProfile(draft);
        }
        setEditMode(false);
    };
    const cancelEdit = () => { setDraft(profile); setEditMode(false); };

    /* sube la foto de perfil a Cloudinary y guarda la URL en el draft */
    const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setUploading(true);
        try {
            const url = await uploadImage(f);
            setDraft(d => ({ ...d, avatarUrl: url }));
        } catch { /* falla la subida -> no cambia la foto */ }
        finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
    };

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

    /* nombre completo: firstName + lastName, pero si no hay apellido (o quedo
       duplicado igual al nombre por el registro) muestra solo el firstName */
    const joinName = (first: string, last: string) => {
        const f = first.trim();
        const l = last.trim();
        return (l && l !== f) ? `${f} ${l}` : f;
    };
    const fullName = joinName(profile.firstName, profile.lastName) || me?.username || "";
    const draftName = joinName(draft.firstName, draft.lastName);

    /* draft para editar: si el apellido es el duplicado del registro (igual al
       nombre), el input de apellido arranca vacio para que pongan el real */
    const startEdit = () => {
        const dup = profile.lastName.trim() && profile.lastName.trim() === profile.firstName.trim();
        setDraft({ ...profile, lastName: dup ? "" : profile.lastName });
        setEditMode(true);
    };
    const initials = (fullName || me?.username || "·").split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

    return (
        <div className="pv-root">
            <div className="profile-head">
                {editMode ? (
                    <label className="profile-avatar pv-avatar pv-avatar-edit" title="Cambiar foto">
                        {draft.avatarUrl ? <img src={draft.avatarUrl} alt=""/> : <span>{initials}</span>}
                        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto}/>
                        <span className="pv-avatar-overlay">
                            {uploading ? "…" : <Icon name="image" size={15}/>}
                        </span>
                    </label>
                ) : (
                    <div className="profile-avatar pv-avatar">
                        {profile.avatarUrl ? <img src={profile.avatarUrl} alt=""/> : initials}
                    </div>
                )}
                <div className="pv-head-main">
                    <div className="eyebrow">{t("profile.role")}</div>
                    <div className="pv-name">{editMode ? (draftName || t("profile.namePlaceholder")) : fullName}</div>
                    {!editMode && (
                        <div className="pv-contact">
                            <span className="pv-contact-item">
                                <Icon name="clock" size={11}/> {t("profile.memberSince")}
                            </span>
                        </div>
                    )}
                </div>
                {editMode ? (
                    <div className="pv-edit-actions">
                        <button type="button" className="btn btn-sm btn-ghost" onClick={cancelEdit} disabled={saving}>{t("common.cancel")}</button>
                        <button type="button" className="btn btn-sm btn-brand" onClick={saveProfile} disabled={saving || uploading}>
                            <Icon name="check" size={13}/> {saving ? t("common.saving", { defaultValue: "Guardando…" }) : t("common.save")}
                        </button>
                    </div>
                ) : (
                    <button type="button" className="btn btn-sm pv-noshrink" onClick={startEdit}>
                        <Icon name="edit" size={14}/> {t("common.edit")}
                    </button>
                )}
            </div>

            {editMode && (
                <div className="pv-edit-grid">
                    <div className="field">
                        <label htmlFor="pf-first">{t("profile.firstName", { defaultValue: "Nombre" })}</label>
                        <input id="pf-first" className="input" value={draft.firstName}
                               onChange={e => setDraft(d => ({ ...d, firstName: e.target.value }))}
                               placeholder={t("profile.firstNamePlaceholder", { defaultValue: "Nombre" })}/>
                    </div>
                    <div className="field">
                        <label htmlFor="pf-last">{t("profile.lastName", { defaultValue: "Apellido" })}</label>
                        <input id="pf-last" className="input" value={draft.lastName}
                               onChange={e => setDraft(d => ({ ...d, lastName: e.target.value }))}
                               placeholder={t("profile.lastNamePlaceholder", { defaultValue: "Apellido" })}/>
                    </div>
                    <div className="field pv-field-full">
                        <label htmlFor="pf-district">{t("profile.district")}</label>
                        <input id="pf-district" className="input" value={draft.district}
                               onChange={e => setDraft(d => ({ ...d, district: e.target.value }))}
                               placeholder={t("profile.districtPlaceholder")}/>
                    </div>
                    {uploading && (
                        <div className="field pv-field-full"><span className="bf-hint"><Icon name="image" size={11}/> Subiendo foto…</span></div>
                    )}
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