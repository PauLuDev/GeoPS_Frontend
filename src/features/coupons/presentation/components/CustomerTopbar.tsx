import {Icon} from "@/shared/ui/components/Icon.tsx";
import {BrandMark} from "@/shared/ui/components/BrandMark.tsx";
import {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {getCurrentUser} from "@/features/auth/application/session.ts";

interface CustomerTopbarProps {
    onProfileClick?: () => void;
    onSignOut?: () => void;
    locationName?: string;
    onLocationClick?: () => void;
}

export function CustomerTopbar({ onProfileClick, onSignOut, locationName = "Miraflores", onLocationClick }: CustomerTopbarProps) {
    const { t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    /* datos del usuario logueado */
    const me = getCurrentUser();
    const displayName = me?.username ?? "Invitado";
    const email = me?.email ?? "";
    const initial = displayName.charAt(0).toUpperCase();

    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    return (
        <div className="topbar">
            <div className="brand">
                <BrandMark/>
                <span>GeoPS</span>
                <span className="brand-suffix">{t("topbar.roleCustomer")}</span>
            </div>
            <div className="topbar-spacer"/>
            <button type="button" className="topbar-loc" onClick={onLocationClick}>
                <Icon name="location" size={13}/>
                <span className="topbar-loc-text">{locationName}</span>
                <Icon name="chevronDown" size={11}/>
            </button>
            <div ref={menuRef} className="topbar-menu-wrap">
                <button type="button" className="topbar-avatar-btn" aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(v => !v)}>
                    <div className="avatar-mini">{initial}</div>
                </button>

                {menuOpen && (
                    <div className="topbar-menu">
                        <div className="topbar-menu-head">
                            <div className="avatar-mini topbar-menu-avatar">{initial}</div>
                            <div>
                                <div className="topbar-menu-name">{displayName}</div>
                                {email && <div className="topbar-menu-email">{email}</div>}
                            </div>
                        </div>
                        <div className="topbar-menu-body">
                            <button type="button" className="topbar-menu-item" onClick={() => { setMenuOpen(false); onProfileClick?.(); }}>
                                <Icon name="user" size={14}/> {t("topbar.viewProfile")}
                            </button>
                            <button type="button" className="topbar-menu-item" onClick={() => { setMenuOpen(false); onLocationClick?.(); }}>
                                <Icon name="location" size={14}/> {t("topbar.changeLocation")}
                            </button>
                            <button type="button" className="topbar-menu-item danger"
                                    onClick={() => { setMenuOpen(false); onSignOut?.(); }}>
                                <Icon name="arrowLeft" size={14}/> {t("topbar.signOut")}
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}