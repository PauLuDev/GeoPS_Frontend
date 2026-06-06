import { Icon } from "@/shared/ui/components/Icon";
import {useState} from "react";

interface SidebarProps {
    view: string;
    setView: (v: string) => void;
    onSwitchRole: () => void;
}

const SIDEBAR_ITEMS = [
    { id: "dashboard", label: "Resumen", icon: "home" },
    { id: "campaigns", label: "Campañas", icon: "tag", badge: 4 },
    { id: "new", label: "Nueva campaña", icon: "plus", primary: true },
];

export function MerchantSidebar({ view, setView, onSwitchRole }: SidebarProps) {
    return (
        <aside className="msb">
            <div style={{ padding: "18px 18px 12px" }}>
                <div className="brand">
                    <div className="brand-mark">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 22 C 6 15 4 11 4 8 a 8 8 0 0 1 16 0 c 0 3 -2 7 -8 14 z" fill="currentColor"/>
                            <circle cx="12" cy="9" r="3" fill="var(--brand)"/>
                        </svg>
                    </div>
                    <span>GeoPS</span>
                    <span className="brand-suffix">merchant</span>
                </div>
            </div>

            <div className="msb-store">
                <div className="msb-store-avatar">T</div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>Tanta — Pardo</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Plan Premium · activo</div>
                </div>
                <Icon name="chevronDown" size={14}/>
            </div>

            <nav className="msb-nav">
                <div className="msb-section">Operación</div>
                {SIDEBAR_ITEMS.map(item => (
                    <button type="button" key={item.id}
                            className={"msb-item" + (view === item.id ? " active" : "") + (item.primary ? " primary" : "")}
                            onClick={() => setView(item.id)}>
                        <Icon name={item.icon} size={16}/>
                        <span>{item.label}</span>
                        {item.badge && <span className="msb-badge">{item.badge}</span>}
                    </button>
                ))}

                <div className="msb-section" style={{ marginTop: 18 }}>Establecimiento</div>
                <button type="button" className="msb-item"><Icon name="settings" size={16}/><span>Configuración</span></button>
                <button type="button" className="msb-item"><Icon name="user" size={16}/><span>Equipo</span></button>
                <button type="button" className="msb-item"><Icon name="chart" size={16}/><span>Facturación</span></button>
            </nav>

            <div className="msb-foot">
                <div className="msb-card">
                    <div className="eyebrow">Próxima fecha</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>Día de la Madre</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>en 8 días · prepara campaña</div>
                    <button type="button" className="btn btn-sm" style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>
                        <Icon name="sparkles" size={12}/> Plantilla
                    </button>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "flex-start", marginTop: 8 }} onClick={onSwitchRole}>
                    <Icon name="arrow_up_right" size={14}/> Vista cliente
                </button>
            </div>

        </aside>
    );
}