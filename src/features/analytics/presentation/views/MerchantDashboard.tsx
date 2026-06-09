import { Icon } from "@/shared/ui/components/Icon";
import {KPI} from "@/features/analytics/presentation/components/KPI.tsx";
import {HourChart} from "@/features/analytics/presentation/components/HourChart.tsx";
import {GeoMap} from "@/features/geolocation/presentation/components/OSMMap.tsx";
import {COUPONS, USER_COORD} from "@/shared/constants.ts";

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
                    <h1 className="page-title">Hola, Fernando 👋</h1>
                    <p className="page-subtitle">
                        Tus campañas están <strong className="md-hl">26% por encima</strong> del promedio del barrio.
                    </p>
                </div>
                <div className="btn-row">
                    <button type="button" className="btn"><Icon name="chart" size={14}/> Exportar</button>
                    <button type="button" className="btn btn-brand" onClick={onNew}><Icon name="plus" size={14}/> Nueva campaña</button>
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
                    <div className="card-header-top">
                        <div>
                            <div className="eyebrow">Rendimiento por hora</div>
                            <div className="section-title">Cuándo se redimen tus cupones</div>
                        </div>
                        <div className="role-switch md-range-switch">
                            <button type="button" className="active md-range-btn">Hoy</button>
                            <button type="button" className="md-range-btn">7d</button>
                            <button type="button" className="md-range-btn">30d</button>
                        </div>
                    </div>
                    <HourChart/>
                    <div className="md-chart-legend">
                        <div><span className="dot ink"/> Reservados</div>
                        <div><span className="dot brand"/> Redimidos</div>
                        <div className="mono md-legend-spacer">Pico: 13:00 — 14:00</div>
                    </div>
                </div>

                <div className="card md-funnel">
                    <div className="eyebrow">Funnel</div>
                    <div className="section-title md-funnel-title">Del mapa al local</div>
                    {[
                        { label: "Vistos en mapa",      value: 2847, pct: 100 },
                        { label: "Detalle abierto",     value: 891,  pct: 31.3 },
                        { label: "Reservados",          value: 412,  pct: 14.5 },
                        { label: "Redimidos en local",  value: 289,  pct: 10.2 },
                    ].map((row, i) => (
                        <div key={row.label} className="funnel-row">
                            <div className="funnel-row-head">
                                <span className="funnel-label">{row.label}</span>
                                <span className="mono tnum funnel-value">
                                    {row.value.toLocaleString()} <span className="funnel-pct">· {row.pct}%</span>
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
                    <div className="card-header md-heatmap-header">
                        <div>
                            <div className="eyebrow">Mapa de calor</div>
                            <div className="section-title">De dónde vienen tus clientes</div>
                        </div>
                        <span className="badge badge-line">Radio de impacto · 800m</span>
                    </div>
                    <div className="md-heatmap-map">
                        <GeoMap engine={mapEngine} theme={theme} interactive={false} zoom={14}
                                pins={COUPONS.slice(0, 4).map(c => ({ ...c }))}
                                userPos={{ x: 460, y: 380 }} userCoord={USER_COORD} showRadar={false}/>
                    </div>
                </div>

                <div className="card md-top-card">
                    <div className="card-header">
                        <div>
                            <div className="eyebrow">Top campañas</div>
                            <div className="section-title">Activas ahora</div>
                        </div>
                        <button type="button" className="btn btn-ghost btn-sm">Ver todas</button>
                    </div>
                    <div className="md-top-list">
                        {[
                            { name: "2x1 lomo saltado",    views: 1240, rate: "38%", stock: "23/60", color: "var(--brand)" },
                            { name: "Almuerzo ejecutivo",   views: 892,  rate: "24%", stock: "41/80", color: "var(--accent-2)" },
                            { name: "Postre gratis",        views: 512,  rate: "12%", stock: "18/30", color: "oklch(0.72 0.16 35)" },
                        ].map((c) => (
                            <div key={c.name} className="md-top-row">
                                <div className="md-top-color" style={{ background: c.color }}/>
                                <div className="md-top-main">
                                    <div className="md-top-name">{c.name}</div>
                                    <div className="mono md-top-meta">
                                        {c.views} vistas · {c.rate} conv. · stock {c.stock}
                                    </div>
                                </div>
                                <Icon name="chevron" size={14}/>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}