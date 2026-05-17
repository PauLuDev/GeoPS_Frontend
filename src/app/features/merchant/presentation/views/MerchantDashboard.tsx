import { Icon } from "@/app/ui/components/Icon";
import {useState} from "react";
import {KPI} from "@/app/features/merchant/presentation/components/KPI.tsx";
import {HourChart} from "@/app/features/merchant/presentation/components/HourChart.tsx";
import {GeoMap} from "@/app/features/map/presentation/components/OSMMap.tsx";
import {COUPONS, USER_COORD} from "@/app/core/common/constants.ts";

interface DashboardProps {
    onNew: () => void;
    mapEngine?: string;
    theme?: string;
}

export function MerchantDashboard({ onNew, mapEngine = "osm", theme = "light" }: DashboardProps) {
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