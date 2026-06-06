import {Icon} from "@/shared/ui/components/Icon.tsx";

const CAMPAIGNS = [
    { id: 1, name: "2x1 en lomo saltado",             status: "live",      views: 1240, reserved: 412, redeemed: 289, stock: 23,  total: 60,   end: "2h 14m" },
    { id: 2, name: "Almuerzo ejecutivo",               status: "live",      views: 892,  reserved: 241, redeemed: 188, stock: 41,  total: 80,   end: "5h 02m" },
    { id: 3, name: "Postre gratis con plato fuerte",   status: "live",      views: 512,  reserved: 98,  redeemed: 62,  stock: 18,  total: 30,   end: "1d 4h" },
    { id: 4, name: "Happy Hour piscos",                status: "draft",     views: 0,    reserved: 0,   redeemed: 0,   stock: 0,   total: 50,   end: "—" },
    { id: 5, name: "Día de la Madre · menú especial", status: "scheduled", views: 0,    reserved: 0,   redeemed: 0,   stock: 0,   total: 120,  end: "en 8d" },
    { id: 6, name: "Lomo Fest 2026",                   status: "ended",     views: 3408, reserved: 910, redeemed: 702, stock: 0,   total: 1000, end: "hace 12d" },
];
const STATUS_COLOR: Record<string, string> = { live: "var(--brand-strong)", draft: "var(--ink-3)", scheduled: "var(--accent-2)", ended: "var(--ink-3)" };
const STATUS_BG:    Record<string, string> = { live: "var(--brand-soft)",   draft: "var(--bg-sunken)", scheduled: "var(--accent-2-soft)", ended: "var(--bg-sunken)" };
const STATUS_LABEL: Record<string, string> = { live: "En vivo", draft: "Borrador", scheduled: "Programada", ended: "Finalizada" };

export function CampaignsList({ onNew }: { onNew: () => void }) {

    return (
        <div className="md">
            <header className="md-head">
                <div>
                    <div className="eyebrow">Operación</div>
                    <h1 className="page-title">Campañas</h1>
                    <p className="page-subtitle">3 activas · 1 borrador · 1 programada</p>
                </div>
                <button type="button" className="btn btn-brand" onClick={onNew}><Icon name="plus" size={14}/> Nueva campaña</button>
            </header>

            <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", padding: "14px 18px", borderBottom: "1px solid var(--line)", gap: 10, alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {["Todas", "En vivo", "Programadas", "Borradores", "Finalizadas"].map((t, i) => (
                            <button type="button" key={t} className={"sort-pill " + (i === 0 ? "active" : "")}>{t}</button>
                        ))}
                    </div>
                    <div style={{ flex: 1 }}/>
                    <div className="search-wrap" style={{ padding: "6px 10px", boxShadow: "none", maxWidth: 220 }}>
                        <Icon name="search" size={14}/>
                        <input className="search-input" aria-label="Buscar campaña" placeholder="Buscar campaña" style={{ fontSize: 13 }}/>
                    </div>
                </div>

                <div className="campaigns-table stagger">
                    <div className="ct-head">
                        <div>Campaña</div><div>Estado</div><div>Vistos</div>
                        <div>Reservados</div><div>Redimidos</div><div>Stock</div><div>Tiempo</div><div></div>
                    </div>
                    {CAMPAIGNS.map(c => (
                        <div key={c.id} className="ct-row">
                            <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: c.status === "live" ? `linear-gradient(135deg, var(--brand) 0%, var(--accent-2) 100%)` : "var(--bg-sunken)", border: "1px solid var(--line)" }}/>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{c.name}</div>
                                    <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>#GEO-{(1000 + c.id).toString()}</div>
                                </div>
                            </div>
                            <div>
                <span className="badge" style={{ background: STATUS_BG[c.status], color: STATUS_COLOR[c.status] }}>
                  {c.status === "live" && <span className="status-dot"/>}
                    {STATUS_LABEL[c.status]}
                </span>
                            </div>
                            <div className="mono tnum">{c.views.toLocaleString()}</div>
                            <div className="mono tnum">{c.reserved.toLocaleString()}</div>
                            <div className="mono tnum">{c.redeemed.toLocaleString()}</div>
                            <div>
                                {c.total > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        <span className="mono" style={{ fontSize: 12 }}>{c.stock}/{c.total}</span>
                                        <div className="stock-bar" style={{ height: 3 }}>
                                            <div className="stock-fill" style={{ width: `${(c.stock / c.total) * 100}%`, background: c.stock === 0 ? "var(--line-strong)" : "var(--brand)" }}/>
                                        </div>
                                    </div>
                                ) : "—"}
                            </div>
                            <div className="mono" style={{ fontSize: 12, color: "var(--ink-2)" }}>{c.end}</div>
                            <div style={{ textAlign: "right" }}>
                                <button type="button" className="btn btn-icon btn-sm"><Icon name="chevron" size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}