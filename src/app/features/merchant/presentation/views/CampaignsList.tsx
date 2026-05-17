import {Icon} from "@/app/ui/components/Icon.tsx";

export function CampaignsList({ onNew }: { onNew: () => void }) {
    const campaigns = [
        { id: 1, name: "2x1 en lomo saltado",             status: "live",      views: 1240, reserved: 412, redeemed: 289, stock: 23,  total: 60,   end: "2h 14m" },
        { id: 2, name: "Almuerzo ejecutivo",               status: "live",      views: 892,  reserved: 241, redeemed: 188, stock: 41,  total: 80,   end: "5h 02m" },
        { id: 3, name: "Postre gratis con plato fuerte",   status: "live",      views: 512,  reserved: 98,  redeemed: 62,  stock: 18,  total: 30,   end: "1d 4h" },
        { id: 4, name: "Happy Hour piscos",                status: "draft",     views: 0,    reserved: 0,   redeemed: 0,   stock: 0,   total: 50,   end: "—" },
        { id: 5, name: "Día de la Madre · menú especial", status: "scheduled", views: 0,    reserved: 0,   redeemed: 0,   stock: 0,   total: 120,  end: "en 8d" },
        { id: 6, name: "Lomo Fest 2026",                   status: "ended",     views: 3408, reserved: 910, redeemed: 702, stock: 0,   total: 1000, end: "hace 12d" },
    ];
    const statusColor: Record<string, string> = { live: "var(--brand-strong)", draft: "var(--ink-3)", scheduled: "var(--accent-2)", ended: "var(--ink-3)" };
    const statusBg:    Record<string, string> = { live: "var(--brand-soft)",   draft: "var(--bg-sunken)", scheduled: "var(--accent-2-soft)", ended: "var(--bg-sunken)" };
    const statusLabel: Record<string, string> = { live: "En vivo", draft: "Borrador", scheduled: "Programada", ended: "Finalizada" };

    return (
        <div className="md">
            <header className="md-head">
                <div>
                    <div className="eyebrow">Operación</div>
                    <h1 style={{ margin: "6px 0 0", fontSize: 32, letterSpacing: "-0.025em", fontWeight: 600 }}>Campañas</h1>
                    <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: 14 }}>3 activas · 1 borrador · 1 programada</p>
                </div>
                <button className="btn btn-brand" onClick={onNew}><Icon name="plus" size={14}/> Nueva campaña</button>
            </header>

            <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", padding: "14px 18px", borderBottom: "1px solid var(--line)", gap: 10, alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {["Todas", "En vivo", "Programadas", "Borradores", "Finalizadas"].map((t, i) => (
                            <button key={t} className={"sort-pill " + (i === 0 ? "active" : "")}>{t}</button>
                        ))}
                    </div>
                    <div style={{ flex: 1 }}/>
                    <div className="search-wrap" style={{ padding: "6px 10px", boxShadow: "none", maxWidth: 220 }}>
                        <Icon name="search" size={14}/>
                        <input className="search-input" placeholder="Buscar campaña" style={{ fontSize: 13 }}/>
                    </div>
                </div>

                <div className="campaigns-table stagger">
                    <div className="ct-head">
                        <div>Campaña</div><div>Estado</div><div>Vistos</div>
                        <div>Reservados</div><div>Redimidos</div><div>Stock</div><div>Tiempo</div><div></div>
                    </div>
                    {campaigns.map(c => (
                        <div key={c.id} className="ct-row">
                            <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: c.status === "live" ? `linear-gradient(135deg, var(--brand) 0%, var(--accent-2) 100%)` : "var(--bg-sunken)", border: "1px solid var(--line)" }}/>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{c.name}</div>
                                    <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>#GEO-{(1000 + c.id).toString()}</div>
                                </div>
                            </div>
                            <div>
                <span className="badge" style={{ background: statusBg[c.status], color: statusColor[c.status] }}>
                  {c.status === "live" && <span className="status-dot"/>}
                    {statusLabel[c.status]}
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
                                <button className="btn btn-icon btn-sm"><Icon name="chevron" size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        .campaigns-table { display: flex; flex-direction: column; }
        .ct-head, .ct-row { display: grid; grid-template-columns: 2.4fr 1.2fr 0.9fr 0.9fr 0.9fr 1.1fr 0.9fr 0.4fr; gap: 14px; padding: 14px 18px; align-items: center; }
        .ct-head { background: var(--bg-sunken); font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-3); }
        .ct-row { border-bottom: 1px solid var(--line); font-size: 13px; transition: background 160ms ease; }
        .ct-row:hover { background: var(--bg-sunken); }
        .ct-row:last-child { border-bottom: 0; }
        @media (max-width: 1100px) {
          .ct-head { display: none; }
          .ct-row { grid-template-columns: 1fr; gap: 6px; padding: 14px; }
        }
      `}</style>
        </div>
    );
}