import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { getCurrentUser } from "@/features/auth/application/session.ts";
import { ProfileResource } from "@/features/auth/infrastructure/api/profileApi.ts";

interface MerchantTopbarProps {
    onAccount: () => void;
    onSwitchRole: () => void;
    onSignOut: () => void;
    /* perfil del dueno (firstName y foto) para mostrarlo en el avatar */
    profile?: ProfileResource | null;
}

/* barra superior del panel merchant con el avatar y menu del dueno */
export function MerchantTopbar({ onAccount, onSwitchRole, onSignOut, profile }: MerchantTopbarProps) {
    const { t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    /* nombre (firstName del perfil) y foto, con fallback al usuario logueado */
    const me = getCurrentUser();
    const displayName = profile?.firstName || me?.username || t("merchant.guest");
    const email = me?.email ?? "";
    const avatarUrl = profile?.avatarUrl || undefined;
    const initials = displayName.split(/[\s._-]+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const avatar = avatarUrl ? <img src={avatarUrl} alt=""/> : initials;

    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    return (
        <div className="merchant-topbar">
            <div ref={menuRef} className="topbar-menu-wrap">
                <button type="button" className="topbar-avatar-btn" aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(v => !v)}>
                    <div className="avatar-mini">{avatar}</div>
                </button>

                {menuOpen && (
                    <div className="topbar-menu">
                        <div className="topbar-menu-head">
                            <div className="avatar-mini topbar-menu-avatar">{avatar}</div>
                            <div>
                                <div className="topbar-menu-name">{displayName}</div>
                                {email && <div className="topbar-menu-email">{email}</div>}
                            </div>
                        </div>
                        <div className="topbar-menu-body">
                            <button type="button" className="topbar-menu-item" onClick={() => { setMenuOpen(false); onAccount(); }}>
                                <Icon name="user" size={14}/> {t("merchant.navAccount")}
                            </button>
                            <button type="button" className="topbar-menu-item" onClick={() => { setMenuOpen(false); onSwitchRole(); }}>
                                <Icon name="arrow_up_right" size={14}/> {t("merchant.customerView")}
                            </button>
                            <button type="button" className="topbar-menu-item danger" onClick={() => { setMenuOpen(false); onSignOut(); }}>
                                <Icon name="arrowLeft" size={14}/> {t("merchant.signOut")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}