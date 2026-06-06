import {Icon} from "@/shared/ui/components/Icon.tsx";
import {Coupon} from "@/shared/types.ts";
import {BrandMark} from "@/shared/ui/components/BrandMark.tsx";
import {useEffect, useRef, useState} from "react";

interface CustomerTopbarProps {
    onProfileClick?: () => void;
    onSignOut?: () => void;
    locationName?: string;
    onLocationClick?: () => void;
}

export function CustomerTopbar({ onProfileClick, onSignOut, locationName = "Miraflores", onLocationClick }: CustomerTopbarProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
                <span className="brand-suffix">cliente</span>
            </div>
            <div className="topbar-spacer"/>
            <button type="button" className="topbar-loc" onClick={onLocationClick}>
                <Icon name="location" size={13}/>
                <span style={{ fontSize: 13, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{locationName}</span>
                <Icon name="chevronDown" size={11}/>
            </button>
            <div ref={menuRef} style={{ position: "relative" }}>
                <button type="button"
                    onClick={() => setMenuOpen(v => !v)}
                    className="topbar-avatar-btn"
                    style={{ borderColor: menuOpen ? "var(--brand)" : "transparent" }}
                >
                    <div className="avatar-mini">D</div>
                </button>

                {menuOpen && (
                    <div className="topbar-menu">
                        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
                            <div className="avatar-mini" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>D</div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>Daniela Gómez</div>
                                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>daniela@email.com</div>
                            </div>
                        </div>
                        <div style={{ padding: "6px 0" }}>
                            <button type="button" className="topbar-menu-item" onClick={() => { setMenuOpen(false); onProfileClick?.(); }}>
                                <Icon name="user" size={14}/> Ver perfil
                            </button>
                            <button type="button" className="topbar-menu-item" onClick={() => { setMenuOpen(false); onLocationClick?.(); }}>
                                <Icon name="location" size={14}/> Cambiar ubicación
                            </button>
                            <button type="button" className="topbar-menu-item" style={{ color: "var(--danger)" }}
                                    onClick={() => { setMenuOpen(false); onSignOut?.(); }}>
                                <Icon name="arrowLeft" size={14}/> Cerrar sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}