import { Icon } from "@/shared/ui/components/Icon";

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
            <div className="msb-head">
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
                <div className="msb-store-info">
                    <div className="msb-store-name">Tanta — Pardo</div>
                    <div className="msb-store-plan">Plan Premium · activo</div>
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

                <div className="msb-section msb-section-gap">Mi negocio</div>
                <button type="button"
                        className={"msb-item" + (view === "establishments" ? " active" : "")}
                        onClick={() => setView("establishments")}>
                    <Icon name="store" size={16}/><span>Establecimientos</span>
                </button>
                <button type="button" className="msb-item"><Icon name="settings" size={16}/><span>Configuración</span></button>
                <button type="button" className="msb-item"><Icon name="user" size={16}/><span>Equipo</span></button>
                <button type="button" className="msb-item"><Icon name="chart" size={16}/><span>Facturación</span></button>
            </nav>

            <div className="msb-foot">
                <div className="msb-card">
                    <div className="eyebrow">Próxima fecha</div>
                    <div className="msb-card-title">Día de la Madre</div>
                    <div className="msb-card-sub">en 8 días · prepara campaña</div>
                    <button type="button" className="btn btn-sm msb-card-btn">
                        <Icon name="sparkles" size={12}/> Plantilla
                    </button>
                </div>
                <button type="button" className="btn btn-ghost btn-sm msb-switch-btn" onClick={onSwitchRole}>
                    <Icon name="arrow_up_right" size={14}/> Vista cliente
                </button>
            </div>
        </aside>
    );
}