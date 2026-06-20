import { useState } from "react";
import { CATEGORIES, COUPONS, USER_COORD } from "./data";
import { Icon } from "./Icon";
import { GeoMap } from "./OSMMap";

interface SidebarProps {
  view: string;
  setView: (v: string) => void;
  onSwitchRole: () => void;
}

function MerchantSidebar({ view, setView, onSwitchRole }: SidebarProps) {
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

interface KPIProps {
  label: string;
  value: string;
  delta: string;
  trend: string;
  sparkData: number[];
}

function KPI({ label, value, delta, trend, sparkData }: KPIProps) {
  const max = Math.max(...sparkData);
  const w = 110, h = 36;
  const slug = label.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
  const path = sparkData.map((v, i) => {
    const x = (i / (sparkData.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="eyebrow">{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <div className="mono tnum" style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}>{value}</div>
        <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 500, color: trend === "up" ? "var(--brand-strong)" : "var(--danger)", display: "inline-flex", alignItems: "center", gap: 3 }}>
          <Icon name="trending" size={11}/> {delta}
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="36" style={{ marginTop: 4 }}>
        <defs>
          <linearGradient id={`grad-${slug}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={`url(#grad-${slug})`}/>
        <path d={path} fill="none" stroke="var(--brand-strong)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function HourChart() {
  const hours = Array.from({ length: 14 }, (_, i) => 8 + i);
  const reserved = [4, 6, 9, 14, 22, 38, 52, 41, 28, 19, 24, 31, 22, 12];
  const redeemed  = [2, 3, 5, 9, 16, 28, 41, 32, 20, 13, 17, 22, 15, 7];
  const max = Math.max(...reserved);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 200 }}>
      {hours.map((h, i) => (
        <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 2, width: "100%", justifyContent: "center" }}>
            <div style={{ width: "42%", background: "var(--ink)", borderRadius: "3px 3px 0 0", height: `${(reserved[i] / max) * 100}%`, transition: "height 800ms cubic-bezier(.2,.8,.2,1)", transitionDelay: `${i * 30}ms` }}/>
            <div style={{ width: "42%", background: "var(--brand)", borderRadius: "3px 3px 0 0", height: `${(redeemed[i] / max) * 100}%`, transition: "height 800ms cubic-bezier(.2,.8,.2,1)", transitionDelay: `${i * 30 + 80}ms` }}/>
          </div>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: i === 5 || i === 6 ? "var(--ink)" : "var(--ink-3)", fontWeight: i === 5 || i === 6 ? 600 : 400 }}>
            {h.toString().padStart(2, "0")}
          </div>
        </div>
      ))}
    </div>
  );
}

interface DashboardProps {
  onNew: () => void;
  mapEngine?: string;
  theme?: string;
}

function MerchantDashboard({ onNew, mapEngine = "osm", theme = "light" }: DashboardProps) {
  return (
    <div className="md">
      <header className="md-head">
        <div>
          <div className="eyebrow">Resumen · últimos 30 días</div>
          <h1 style={{ margin: "6px 0 0", fontSize: 32, letterSpacing: "-0.025em", fontWeight: 600 }}>Hola, Fernando 👋</h1>
          <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: 14 }}>
            Tus campañas están <strong style={{ color: "var(--ink)" }}>26% por encima</strong> del promedio del barrio.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn"><Icon name="chart" size={14}/> Exportar</button>
          <button className="btn btn-brand" onClick={onNew}><Icon name="plus" size={14}/> Nueva campaña</button>
        </div>
      </header>

      <section className="md-kpis stagger">
        <KPI label="Cupones vistos"   value="2,847" delta="+18%" trend="up" sparkData={[3,5,4,7,6,8,7,9,8,12,10,11,13,15]}/>
        <KPI label="Reservados"       value="412"   delta="+34%" trend="up" sparkData={[1,2,2,3,4,3,5,6,5,7,8,9,11,12]}/>
        <KPI label="Redimidos"        value="289"   delta="+22%" trend="up" sparkData={[2,2,3,3,4,4,5,5,6,7,8,8,9,9]}/>
        <KPI label="Tasa conversión"  value="10.1%" delta="+1.4pp" trend="up" sparkData={[6,7,7,8,8,8,9,9,9,10,10,10,10,11]}/>
      </section>

      <section className="md-grid">
        <div className="card md-chart">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div className="eyebrow">Rendimiento por hora</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>Cuándo se redimen tus cupones</div>
            </div>
            <div className="role-switch" style={{ padding: 2, fontSize: 11 }}>
              <button className="active" style={{ padding: "4px 10px", fontSize: 11 }}>Hoy</button>
              <button style={{ padding: "4px 10px", fontSize: 11 }}>7d</button>
              <button style={{ padding: "4px 10px", fontSize: 11 }}>30d</button>
            </div>
          </div>
          <HourChart/>
          <div className="md-chart-legend">
            <div><span className="dot" style={{ background: "var(--ink)" }}/> Reservados</div>
            <div><span className="dot" style={{ background: "var(--brand)" }}/> Redimidos</div>
            <div className="mono" style={{ marginLeft: "auto", color: "var(--ink-3)", fontSize: 11 }}>Pico: 13:00 — 14:00</div>
          </div>
        </div>

        <div className="card md-funnel">
          <div className="eyebrow">Funnel</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4, marginBottom: 18 }}>Del mapa al local</div>
          {[
            { label: "Vistos en mapa",      value: 2847, pct: 100 },
            { label: "Detalle abierto",     value: 891,  pct: 31.3 },
            { label: "Reservados",          value: 412,  pct: 14.5 },
            { label: "Redimidos en local",  value: 289,  pct: 10.2 },
          ].map((row, i) => (
            <div key={i} className="funnel-row">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13 }}>{row.label}</span>
                <span className="mono tnum" style={{ fontSize: 13, fontWeight: 500 }}>
                  {row.value.toLocaleString()} <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>· {row.pct}%</span>
                </span>
              </div>
              <div className="funnel-bar">
                <div className="funnel-fill" style={{
                  width: `${row.pct}%`,
                  background: i === 0 ? "var(--ink)" : i === 3 ? "var(--brand)" : `color-mix(in oklab, var(--ink) ${100 - i * 20}%, var(--brand))`
                }}/>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="md-grid">
        <div className="card md-heatmap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "18px 18px 0" }}>
            <div>
              <div className="eyebrow">Mapa de calor</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>De dónde vienen tus clientes</div>
            </div>
            <span className="badge badge-line">Radio de impacto · 800m</span>
          </div>
          <div style={{ height: 260, position: "relative" }}>
            <GeoMap engine={mapEngine} theme={theme} interactive={false} zoom={14}
                    pins={COUPONS.slice(0, 4).map(c => ({ ...c }))}
                    userPos={{ x: 460, y: 380 }} userCoord={USER_COORD} showRadar={false}/>
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div className="eyebrow">Top campañas</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>Activas ahora</div>
            </div>
            <button className="btn btn-ghost btn-sm">Ver todas</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { name: "2x1 lomo saltado",    views: 1240, rate: "38%", stock: "23/60", color: "var(--brand)" },
              { name: "Almuerzo ejecutivo",   views: 892,  rate: "24%", stock: "41/80", color: "var(--accent-2)" },
              { name: "Postre gratis",        views: 512,  rate: "12%", stock: "18/30", color: "oklch(0.72 0.16 35)" },
            ].map((c, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "4px 1fr auto", gap: 12, alignItems: "center", padding: "10px 12px", background: "var(--bg-sunken)", borderRadius: 10 }}>
                <div style={{ height: 36, width: 4, background: c.color, borderRadius: 2 }}/>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                    {c.views} vistas · {c.rate} conv. · stock {c.stock}
                  </div>
                </div>
                <Icon name="chevron" size={14}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .md { padding: 28px; max-width: 1400px; margin: 0 auto; }
        .md-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .md-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 14px; }
        @media (max-width: 880px) { .md-kpis { grid-template-columns: repeat(2, 1fr); } }
        .md-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 14px; margin-bottom: 14px; }
        @media (max-width: 1100px) { .md-grid { grid-template-columns: 1fr; } }
        .md-chart { padding: 22px; min-height: 360px; }
        .md-funnel { padding: 22px; }
        .md-heatmap { padding: 0; overflow: hidden; }
        .md-chart-legend { display: flex; align-items: center; gap: 18px; margin-top: 14px; font-size: 12px; color: var(--ink-2); }
        .md-chart-legend .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
        .funnel-row { margin-bottom: 14px; }
        .funnel-row:last-child { margin-bottom: 0; }
        .funnel-bar { height: 8px; background: var(--bg-sunken); border-radius: 4px; overflow: hidden; }
        .funnel-fill { height: 100%; border-radius: 4px; transition: width 800ms cubic-bezier(.2,.8,.2,1); }
      `}</style>
    </div>
  );
}

function CampaignsList({ onNew }: { onNew: () => void }) {
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

function NewCampaign({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState("Día de la Madre — 2x1");
  const [discount, setDiscount] = useState(40);
  const [stock, setStock] = useState(60);
  const [category, setCategory] = useState("food");
  const [radius, setRadius] = useState(800);

  return (
    <div className="md" style={{ maxWidth: 1240 }}>
      <header className="md-head">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ marginBottom: 8 }}>
            <Icon name="arrowLeft" size={13}/> Volver
          </button>
          <h1 style={{ margin: 0, fontSize: 32, letterSpacing: "-0.025em", fontWeight: 600 }}>Nueva campaña</h1>
          <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: 14 }}>Define tu oferta y publícala en menos de 5 minutos.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={onCancel}>Guardar borrador</button>
          <button className="btn btn-brand" onClick={onDone}>
            Publicar campaña <Icon name="arrowRight" size={14}/>
          </button>
        </div>
      </header>

      <div className="nc-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>1. Información básica</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field">
                <label>Nombre de la campaña</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)}/>
              </div>
              <div className="field">
                <label>Descripción</label>
                <textarea className="input" rows={3} defaultValue="Aplica de lunes a jueves de 12:00 a 16:00. Válido para consumo en local."/>
              </div>
              <div className="field">
                <label>Categoría</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {CATEGORIES.slice(1).map(c => (
                    <button key={c.id}
                            className={"chip " + (category === c.id ? "active" : "")}
                            onClick={() => setCategory(c.id)}>
                      <Icon name={c.icon} size={13}/> {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>2. Descuento y stock</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field">
                <label>Descuento (%)</label>
                <div style={{ position: "relative" }}>
                  <input className="input" type="number" value={discount} onChange={e => setDiscount(+e.target.value)} style={{ paddingRight: 60 }}/>
                  <span className="mono" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)", fontSize: 13 }}>%</span>
                </div>
              </div>
              <div className="field">
                <label>Stock total</label>
                <input className="input" type="number" value={stock} onChange={e => setStock(+e.target.value)}/>
              </div>
              <div className="field">
                <label>Precio original (S/)</label>
                <input className="input" type="number" defaultValue="48"/>
              </div>
              <div className="field">
                <label>Precio con descuento</label>
                <input className="input" type="number" defaultValue={(48 * (1 - discount / 100)).toFixed(0)}/>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>3. Vigencia y alcance</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field">
                <label>Inicio</label>
                <input className="input" type="datetime-local" defaultValue="2026-05-04T12:00"/>
              </div>
              <div className="field">
                <label>Fin</label>
                <input className="input" type="datetime-local" defaultValue="2026-05-12T22:00"/>
              </div>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Radio visible (metros)</label>
              <input type="range" min="200" max="2000" step="100" value={radius}
                     onChange={e => setRadius(+e.target.value)} style={{ width: "100%", accentColor: "var(--brand)" }}/>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>
                <span>200m</span>
                <span style={{ color: "var(--ink)", fontWeight: 600 }}>{radius}m</span>
                <span>2km</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 14, alignSelf: "flex-start" }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="eyebrow">Vista previa cliente</div>
              <span className="badge badge-line">live</span>
            </div>
            <div style={{ padding: 18 }}>
              <div className="card" style={{ padding: 14, border: "1px solid var(--line-strong)" }}>
                <div style={{
                  height: 140, borderRadius: 10,
                  background: `linear-gradient(135deg, color-mix(in oklab, var(--brand) 70%, var(--bg-sunken)) 0%, color-mix(in oklab, var(--accent-2) 30%, var(--bg-sunken)) 100%)`,
                  position: "relative", overflow: "hidden"
                }}>
                  <span style={{ position: "absolute", top: 12, left: 12, background: "var(--ink)", color: "var(--bg)", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 14, padding: "4px 10px", borderRadius: 6 }}>
                    −{discount}%
                  </span>
                  <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, transparent 0 12px, color-mix(in oklab, var(--bg) 18%, transparent) 12px 13px)" }}/>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Tanta — Pardo</div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>{name || "—"}</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>
                    <span><Icon name="walking" size={11}/> 3 min</span>
                    <span><Icon name="clock" size={11}/> 8 días</span>
                    <span>{stock} disp.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div className="eyebrow">Estimación de impacto</div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Personas en radio", value: "~12,400" },
                { label: "Vistas estimadas",  value: `${Math.round(stock * 14)}` },
                { label: "Reservas esperadas", value: `~${Math.round(stock * 0.65)}` },
                { label: "ROI estimado",      value: "+185%", brand: true },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? "1px solid var(--line)" : "none" }}>
                  <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{row.label}</span>
                  <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, color: row.brand ? "var(--brand-strong)" : "var(--ink)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .nc-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; }
        @media (max-width: 1100px) { .nc-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

interface MerchantAppProps {
  onSwitchRole: () => void;
  mapEngine?: string;
  theme?: string;
}

export function MerchantApp({ onSwitchRole, mapEngine = "osm", theme = "light" }: MerchantAppProps) {
  const [view, setView] = useState("dashboard");

  return (
    <div className="merchant-app">
      <MerchantSidebar view={view} setView={setView} onSwitchRole={onSwitchRole}/>
      <main className="merchant-main">
        {view === "dashboard" && <MerchantDashboard onNew={() => setView("new")} mapEngine={mapEngine} theme={theme}/>}
        {view === "campaigns" && <CampaignsList onNew={() => setView("new")}/>}
        {view === "new" && <NewCampaign onDone={() => setView("campaigns")} onCancel={() => setView("dashboard")}/>}
      </main>
      <style>{`
        .merchant-app { display: grid; grid-template-columns: 232px 1fr; min-height: 100vh; background: var(--bg-sunken); }
        @media (max-width: 880px) { .merchant-app { grid-template-columns: 1fr; } }
        .merchant-main { min-width: 0; min-height: 100vh; overflow-x: hidden; }
      `}</style>
    </div>
  );
}
