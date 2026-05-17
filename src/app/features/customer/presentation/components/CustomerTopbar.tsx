import {Icon} from "@/app/ui/components/Icon.tsx";
import {Coupon} from "@/app/core/common/mockData.ts";
import {BrandMark} from "@/app/ui/components/BrandMark.tsx";
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
            <button className="topbar-loc" onClick={onLocationClick}
                    style={{ cursor: "pointer", background: "none", border: "1px solid var(--line)", borderRadius: 10, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", color: "var(--ink-2)", transition: "border-color 160ms ease" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--ink)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--line)")}>
                <Icon name="location" size={13}/>
                <span style={{ fontSize: 13, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{locationName}</span>
                <Icon name="chevronDown" size={11}/>
            </button>
            <div ref={menuRef} style={{ position: "relative" }}>
                <button
                    onClick={() => setMenuOpen(v => !v)}
                    style={{
                        appearance: "none", border: "2px solid transparent", padding: 0,
                        background: "transparent", cursor: "pointer", borderRadius: "50%",
                        transition: "border-color 160ms ease",
                        borderColor: menuOpen ? "var(--brand)" : "transparent"
                    }}
                >
                    <div className="avatar-mini">D</div>
                </button>

                {menuOpen && (
                    <div style={{
                        position: "absolute", top: "calc(100% + 8px)", right: 0,
                        background: "var(--bg-elev)", border: "1px solid var(--line)",
                        borderRadius: 14, boxShadow: "var(--shadow-lg)", minWidth: 200,
                        zIndex: 200, overflow: "hidden",
                        animation: "geops-scale-in 180ms cubic-bezier(.2,.8,.2,1) both"
                    }}>
                        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
                            <div className="avatar-mini" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>D</div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>Daniela Gómez</div>
                                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>daniela@email.com</div>
                            </div>
                        </div>
                        <div style={{ padding: "6px 0" }}>
                            <button className="topbar-menu-item" onClick={() => { setMenuOpen(false); onProfileClick?.(); }}>
                                <Icon name="user" size={14}/> Ver perfil
                            </button>
                            <button className="topbar-menu-item" onClick={() => { setMenuOpen(false); onLocationClick?.(); }}>
                                <Icon name="location" size={14}/> Cambiar ubicación
                            </button>
                            <button className="topbar-menu-item" style={{ color: "var(--danger)" }}
                                    onClick={() => { setMenuOpen(false); onSignOut?.(); }}>
                                <Icon name="arrowLeft" size={14}/> Cerrar sesión
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .topbar-menu-item {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 9px 14px; appearance: none; border: 0;
          background: transparent; color: var(--ink);
          font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: var(--font-sans); text-align: left;
          transition: background 120ms ease;
        }
        .topbar-menu-item:hover { background: var(--bg-sunken); }
      `}</style>
        </div>
    );
}