import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/shared/ui/components/Icon";
import { KPI } from "@/features/analytics/presentation/components/KPI.tsx";
import { HourChart } from "@/features/analytics/presentation/components/HourChart.tsx";
import { useDashboard } from "@/features/analytics/presentation/hooks/useDashboard.ts";
import { toReportSnapshot } from "@/features/analytics/application/mappers/DashboardReportMapper.ts";
import { HourlyRange, RANGE_TO_TIMEFRAME } from "@/features/analytics/domain/value-objects/reportData.ts";
import { getCurrentUser } from "@/features/auth/application/session.ts";

interface DashboardProps {
    onNew: () => void;
    establishmentId: string;
    establishmentName: string;
}

const TOP_COLORS = ["var(--brand)", "var(--accent-2)", "oklch(0.72 0.16 35)"];
const RANGES: { id: HourlyRange; label: string }[] = [
    { id: "today", label: "Hoy" },
    { id: "7d",    label: "7d" },
    { id: "30d",   label: "30d" },
];

export function MerchantDashboard({ onNew, establishmentId, establishmentName }: DashboardProps) {
    const [exportOpen, setExportOpen] = useState(false);
    const [range, setRange] = useState<HourlyRange>("today");
    const exportRef = useRef<HTMLDivElement>(null);

    /* metricas del dashboard segun el rango elegido */
    const { stats, loading, error } = useDashboard(establishmentId, RANGE_TO_TIMEFRAME[range]);

    /* foto del reporte que usan la vista y la exportacion */
    const report = useMemo(
        () => (stats ? toReportSnapshot(stats, establishmentName, range) : null),
        [stats, establishmentName, range],
    );

    /* hora pico segun los datos del grafico */
    const peakHour = report && report.hourly.length > 0
        ? report.hourly.reduce((b, h) => h.reserved > b.reserved ? h : b, report.hourly[0]).hour
        : "—";

    /* cierra el menu al hacer clic fuera */
    useEffect(() => {
        if (!exportOpen) return;
        const onDoc = (e: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [exportOpen]);

    /* carga diferida -> las librerias de exportacion solo se bajan cuando el dueno exporta, no en el bundle inicial */
    const runExport = async (which: "pdf" | "excel" | "csv") => {
        setExportOpen(false);
        if (!report) return;
        const mod = await import("@/features/analytics/application/exportReport.ts");
        if (which === "pdf")   mod.exportReportPDF(report);
        if (which === "excel") mod.exportReportExcel(report);
        if (which === "csv")   mod.exportReportCSV(report);
    };

    return (
        <div className="md">
            <header className="md-head">
                <div>
                    <div className="eyebrow">Resumen · {establishmentName || "tu negocio"}</div>
                    <h1 className="page-title">Hola{getCurrentUser()?.username ? `, ${getCurrentUser()?.username}` : ""} 👋</h1>
                    <p className="page-subtitle">
                        Revisa el rendimiento de tus campañas y exporta el reporte cuando lo necesites.
                    </p>
                </div>
                <div className="btn-row">
                    <div className="md-export" ref={exportRef}>
                        <button type="button" className="btn" disabled={!report} onClick={() => setExportOpen(o => !o)}>
                            <Icon name="chart" size={14}/> Exportar <Icon name="chevronDown" size={13}/>
                        </button>
                        {exportOpen && (
                            <div className="md-export-menu" role="menu">
                                <button type="button" role="menuitem" className="md-export-item" onClick={() => runExport("pdf")}>
                                    <Icon name="filePdf" size={15}/> Descargar PDF
                                </button>
                                <button type="button" role="menuitem" className="md-export-item" onClick={() => runExport("excel")}>
                                    <Icon name="fileExcel" size={15}/> Descargar Excel (.xlsx)
                                </button>
                                <button type="button" role="menuitem" className="md-export-item" onClick={() => runExport("csv")}>
                                    <Icon name="fileCsv" size={15}/> Descargar CSV
                                </button>
                            </div>
                        )}
                    </div>
                    <button type="button" className="btn btn-brand" onClick={onNew}><Icon name="plus" size={14}/> Nueva campaña</button>
                </div>
            </header>

            {/* sin establecimiento no hay de donde sacar metricas */}
            {!establishmentId ? (
                <div className="card md-state">Registra un establecimiento para ver sus métricas.</div>
            ) : loading ? (
                <div className="card md-state">Cargando métricas…</div>
            ) : error ? (
                <div className="card md-state">No se pudieron cargar las métricas: {error}</div>
            ) : !report ? (
                <div className="card md-state">Aún no hay métricas para este rango.</div>
            ) : (
                <>
                    {/* selector de rango */}
                    <div className="role-switch md-range-switch md-range-top">
                        {RANGES.map(r => (
                            <button type="button" key={r.id}
                                    className={"md-range-btn" + (range === r.id ? " active" : "")}
                                    onClick={() => setRange(r.id)}>
                                {r.label}
                            </button>
                        ))}
                    </div>

                    <section className="md-kpis stagger">
                        {report.kpis.map(k => (
                            <KPI key={k.label} label={k.label} value={k.value} delta={k.delta} trend={k.trend} sparkData={k.spark}/>
                        ))}
                    </section>

                    <section className="md-grid">
                        <div className="card md-chart">
                            <div className="card-header-top">
                                <div>
                                    <div className="eyebrow">Rendimiento</div>
                                    <div className="section-title">Cuándo se redimen tus cupones</div>
                                </div>
                            </div>
                            <HourChart data={report.hourly}/>
                            <div className="md-chart-legend">
                                <div><span className="dot dot-reserved"/> Reservados</div>
                                <div><span className="dot dot-redeemed"/> Redimidos</div>
                                <div className="mono md-legend-spacer">Pico: {peakHour}</div>
                            </div>
                        </div>

                        <div className="card md-funnel">
                            <div className="eyebrow">Funnel</div>
                            <div className="section-title md-funnel-title">Del mapa al local</div>
                            {report.funnel.map((row, i) => (
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
                                            background: i === 0 ? "var(--ink)" : i === report.funnel.length - 1 ? "var(--brand)" : `color-mix(in oklab, var(--ink) ${100 - i * 30}%, var(--brand))`
                                        }}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="card md-top-card">
                            <div className="card-header">
                                <div>
                                    <div className="eyebrow">Top campañas</div>
                                    <div className="section-title">Activas ahora</div>
                                </div>
                                <button type="button" className="btn btn-ghost btn-sm">Ver todas</button>
                            </div>
                            <div className="md-top-list">
                                {report.topCampaigns.length === 0 ? (
                                    <div className="md-state">Sin campañas en este rango.</div>
                                ) : report.topCampaigns.map((c, i) => (
                                    <div key={c.name} className="md-top-row">
                                        <div className="md-top-color" style={{ background: TOP_COLORS[i % TOP_COLORS.length] }}/>
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
                </>
            )}
        </div>
    );
}