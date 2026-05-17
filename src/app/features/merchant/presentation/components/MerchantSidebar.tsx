import { Icon } from "@/app/ui/components/Icon";
import {useState} from "react";

interface SidebarProps {
    view: string;
    setView: (v: string) => void;
    onSwitchRole: () => void;
}

export function MerchantSidebar({ view, setView, onSwitchRole }: SidebarProps) {
    const items = [
        { id: "dashboard", label: "Resumen", icon: "home" },
        { id: "campaigns", label: "Campañas", icon: "tag", badge: 4 },
        { id: "new", label: "Nueva campaña", icon: "plus", primary: true },
    ];
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
                <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "linear-gradient(135deg, var(--brand) 0%, var(--accent-2) 100%)",
                    color: "var(--brand-ink)", display: "grid", placeItems: "center",
                    fontWeight: 600, fontSize: 14
                }}>T</div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>Tanta — Pardo</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Plan Premium · activo</div>
                </div>
                <Icon name="chevronDown" size={14}/>
            </div>

            <nav className="msb-nav">
                <div className="msb-section">Operación</div>
                {items.map(item => (
                    <button key={item.id}
                            className={"msb-item" + (view === item.id ? " active" : "") + (item.primary ? " primary" : "")}
                            onClick={() => setView(item.id)}>
                        <Icon name={item.icon} size={16}/>
                        <span>{item.label}</span>
                        {item.badge && <span className="msb-badge">{item.badge}</span>}
                    </button>
                ))}

                <div className="msb-section" style={{ marginTop: 18 }}>Establecimiento</div>
                <button className="msb-item"><Icon name="settings" size={16}/><span>Configuración</span></button>
                <button className="msb-item"><Icon name="user" size={16}/><span>Equipo</span></button>
                <button className="msb-item"><Icon name="chart" size={16}/><span>Facturación</span></button>
            </nav>

            <div className="msb-foot">
                <div className="msb-card">
                    <div className="eyebrow">Próxima fecha</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>Día de la Madre</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>en 8 días · prepara campaña</div>
                    <button className="btn btn-sm" style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>
                        <Icon name="sparkles" size={12}/> Plantilla
                    </button>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "flex-start", marginTop: 8 }} onClick={onSwitchRole}>
                    <Icon name="arrow_up_right" size={14}/> Vista cliente
                </button>
            </div>

            <style>{`
        .msb { background: var(--bg-elev); border-right: 1px solid var(--line); display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        @media (max-width: 880px) { .msb { position: relative; height: auto; } }
        .msb-store { margin: 0 14px 6px; padding: 10px; border-radius: 12px; background: var(--bg-sunken); display: flex; align-items: center; gap: 10px; cursor: pointer; color: var(--ink-2); }
        .msb-nav { padding: 14px; display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .msb-section { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-3); padding: 8px 10px 4px; }
        .msb-item { appearance: none; border: 0; background: transparent; padding: 9px 10px; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: var(--ink-2); cursor: pointer; transition: all 160ms ease; text-align: left; font-family: inherit; width: 100%; }
        .msb-item:hover { background: var(--bg-sunken); color: var(--ink); }
        .msb-item.active { background: var(--ink); color: var(--bg); }
        .msb-item.active .msb-badge { background: var(--brand); color: var(--brand-ink); }
        .msb-item.primary { background: var(--brand-soft); color: var(--brand-ink); }
        .msb-item.primary:hover { background: color-mix(in oklab, var(--brand) 25%, var(--bg-elev)); }
        .msb-item span { flex: 1; }
        .msb-badge { font-family: var(--font-mono); font-size: 10px; padding: 1px 6px; background: var(--bg-sunken); border-radius: 999px; color: var(--ink-2); flex: 0 !important; }
        .msb-foot { padding: 14px; border-top: 1px solid var(--line); }
        .msb-card { padding: 14px; background: var(--bg-sunken); border: 1px dashed var(--line-strong); border-radius: 12px; }
      `}</style>
        </aside>
    );
}