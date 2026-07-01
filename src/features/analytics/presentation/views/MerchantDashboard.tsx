import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/shared/ui/components/Icon";
import { useAutoRefresh } from "@/shared/hooks/useAutoRefresh.ts";
import { Select } from "@/shared/ui/components/Select.tsx";
import { KPI } from "@/features/analytics/presentation/components/KPI.tsx";
import { HourChart } from "@/features/analytics/presentation/components/HourChart.tsx";
import { useDashboard } from "@/features/analytics/presentation/hooks/useDashboard.ts";
import { toReportSnapshot } from "@/features/analytics/application/mappers/DashboardReportMapper.ts";
import { HourlyRange, RANGE_TO_TIMEFRAME, periodLabel, ReportSnapshot, ReportKpi } from "@/features/analytics/domain/value-objects/reportData.ts";
import { listCampaignAnalytics } from "@/features/analytics/application/use-cases/ListCampaignAnalytics.ts";
import { CampaignAnalytics } from "@/features/analytics/domain/entities/CampaignAnalytics.ts";
import { getCurrentUser } from "@/features/auth/application/session.ts";

interface DashboardEstablishment { id: string; name: string; }
interface DashboardProps {
    onNew: () => void;
    establishments: DashboardEstablishment[];
}

const TOP_COLORS = ["var(--brand)", "var(--accent-2)", "oklch(0.72 0.16 35)"];
const RANGES: { id: HourlyRange; label: string }[] = [
    { id: "today", label: "Hoy" },
    { id: "7d",    label: "7d" },
    { id: "30d",   label: "30d" },
];

export function MerchantDashboard({ onNew, establishments }: DashboardProps) {
    const [exportOpen, setExportOpen] = useState(false);
    const [range, setRange] = useState<HourlyRange>("today");
    const exportRef = useRef<HTMLDivElement>(null);

    /* establecimiento elegido (para duenos con mas de uno) */
    const [selectedEstId, setSelectedEstId] = useState(establishments[0]?.id ?? "");
    useEffect(() => {
        if (establishments.length && !establishments.some(e => e.id === selectedEstId)) {
            setSelectedEstId(establishments[0].id);
        }
    }, [establishments, selectedEstId]);
    const establishmentId = selectedEstId;
    const establishmentName = establishments.find(e => e.id === selectedEstId)?.name ?? "";

    /* modo de vista: resumen del establecimiento o desglose por campana */
    const [mode, setMode] = useState<"summary" | "campaigns">("summary");

    /* metricas del dashboard segun el rango elegido */
    const { stats, loading, error } = useDashboard(establishmentId, RANGE_TO_TIMEFRAME[range]);

    /* metricas por campana (modo "campaigns") */
    const [campaignStats, setCampaignStats] = useState<CampaignAnalytics[]>([]);
    const [campaignsLoading, setCampaignsLoading] = useState(false);
    useEffect(() => {
        if (!establishmentId) { setCampaignStats([]); return; }
        let alive = true;
        setCampaignsLoading(true);
        listCampaignAnalytics(establishmentId)
            .then(cs => { if (alive) setCampaignStats(cs); })
            .catch(() => { if (alive) setCampaignStats([]); })
            .finally(() => { if (alive) setCampaignsLoading(false); });
        return () => { alive = false; };
    }, [establishmentId]);

    /* refresco silencioso de las metricas por campana, en linea con el dashboard */
    const refreshCampaignStats = useCallback(() => {
        if (!establishmentId) return;
        listCampaignAnalytics(establishmentId).then(setCampaignStats).catch(() => { /* mantiene lo actual */ });
    }, [establishmentId]);
    useAutoRefresh(refreshCampaignStats, 30000);

    /* abre una campana puntual en la pestaña "Por campaña" */
    const openCampaign = (id: string) => { setSelectedCampaignId(id); setMode("campaigns"); };

    /* campana elegida en el modo "por campana" */
    const [selectedCampaignId, setSelectedCampaignId] = useState("");
    useEffect(() => {
        if (campaignStats.length && !campaignStats.some(c => c.id === selectedCampaignId)) {
            setSelectedCampaignId(campaignStats[0].id);
        }
    }, [campaignStats, selectedCampaignId]);
    const selectedCampaign = campaignStats.find(c => c.id === selectedCampaignId);

    /* foto del reporte que usan la vista y la exportacion */
    const report = useMemo(
        () => (stats ? toReportSnapshot(stats, establishmentName, range) : null),
        [stats, establishmentName, range],
    );

    /* reporte de la campana elegida (KPIs + funnel + export). el back no expone
       datos horarios por campana, por eso el grafico horario queda solo en "Resumen" */
    const campaignReport = useMemo<ReportSnapshot | null>(() => {
        if (!selectedCampaign) return null;
        const a = selectedCampaign.analytics;
        const maxStep = Math.max(a.viewsCount, a.reservationsCount, a.redemptionsCount, 1);
        const pct = (n: number) => Math.round((n / maxStep) * 100);
        const flat = [0, 0];
        const kpis: ReportKpi[] = [
            { label: "Cupones vistos", value: String(a.viewsCount), delta: "", trend: "up", spark: flat },
            { label: "Redimidos", value: String(a.redemptionsCount), delta: "", trend: "up", spark: flat },
            { label: "Reservados", value: String(a.reservationsCount), delta: "", trend: "up", spark: flat },
            { label: "Tasa conversión", value: `${a.conversionRate.toFixed(1)}%`, delta: "", trend: "up", spark: flat },
        ];
        return {
            meta: { businessName: `${establishmentName} · ${selectedCampaign.name}`, period: "Histórico" },
            kpis,
            funnel: [
                { label: "Abrieron el cupón", value: a.viewsCount, pct: pct(a.viewsCount) },
                { label: "Reservaron", value: a.reservationsCount, pct: pct(a.reservationsCount) },
                { label: "Canjearon en el local", value: a.redemptionsCount, pct: pct(a.redemptionsCount) },
            ],
            topCampaigns: [],
            hourly: [],
        };
    }, [selectedCampaign, establishmentName]);

    /* reporte activo segun el modo (lo usan exportacion y el boton) */
    const activeReport = mode === "campaigns" ? campaignReport : report;

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
        if (!activeReport) return;
        const mod = await import("@/features/analytics/application/exportReport.ts");
        if (which === "pdf")   mod.exportReportPDF(activeReport);
        if (which === "excel") mod.exportReportExcel(activeReport);
        if (which === "csv")   mod.exportReportCSV(activeReport);
    };

    return (
        <div className="md">
            <header className="md-head">
                <div>
                    <div className="eyebrow">Resumen · {establishmentName || "tu negocio"}</div>
                    <h1 className="page-title">Hola{(establishmentName || getCurrentUser()?.username) ? `, ${establishmentName || getCurrentUser()?.username}` : ""} 👋</h1>
                    <p className="page-subtitle">
                        Revisa el rendimiento de tus campañas y exporta el reporte cuando lo necesites.
                    </p>
                </div>
                <div className="btn-row">
                    <div className="md-export" ref={exportRef}>
                        <button type="button" className="btn" disabled={!activeReport} onClick={() => setExportOpen(o => !o)}>
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

            {/* controles: establecimiento (si hay mas de uno) + modo de vista */}
            <div className="md-controls">
                {establishments.length > 1 && (
                    <div className="md-control">
                        <span className="md-control-label">Establecimiento</span>
                        <Select
                            value={selectedEstId}
                            options={establishments.map(e => ({ value: e.id, label: e.name }))}
                            onChange={setSelectedEstId}
                        />
                    </div>
                )}
                <div className="role-switch md-mode-switch">
                    <button type="button" className={"md-range-btn" + (mode === "summary" ? " active" : "")}
                            onClick={() => setMode("summary")}>Resumen</button>
                    <button type="button" className={"md-range-btn" + (mode === "campaigns" ? " active" : "")}
                            onClick={() => setMode("campaigns")}>Por campaña</button>
                </div>
                {mode === "campaigns" && campaignStats.length > 0 && (
                    <div className="md-control">
                        <span className="md-control-label">Campaña</span>
                        <Select
                            value={selectedCampaignId}
                            options={campaignStats.map(c => ({ value: c.id, label: c.name }))}
                            onChange={setSelectedCampaignId}
                        />
                    </div>
                )}
            </div>

            {/* sin establecimiento no hay de donde sacar metricas */}
            {!establishmentId ? (
                <div className="card md-state">Registra un establecimiento para ver sus métricas.</div>
            ) : mode === "campaigns" ? (
                campaignsLoading ? (
                    <div className="card md-state">Cargando métricas…</div>
                ) : !campaignReport ? (
                    <div className="card md-state">Aún no hay campañas con métricas en este establecimiento.</div>
                ) : (
                    <>
                        <section className="md-kpis stagger">
                            {campaignReport.kpis.map(k => (
                                <KPI key={k.label} label={k.label} value={k.value} delta={k.delta} trend={k.trend} sparkData={k.spark}/>
                            ))}
                        </section>

                        <section className="md-grid">
                            <div className="card md-funnel">
                                <div className="eyebrow">Funnel</div>
                                <div className="section-title md-funnel-title">Del mapa al local</div>
                                {campaignReport.funnel.map((row, i) => (
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
                                                background: i === 0 ? "var(--ink)" : i === campaignReport.funnel.length - 1 ? "var(--brand)" : `color-mix(in oklab, var(--ink) ${100 - i * 30}%, var(--brand))`
                                            }}/>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="card md-funnel">
                                <div className="eyebrow">Campaña</div>
                                <div className="section-title md-funnel-title">{selectedCampaign?.name}</div>
                                <p className="page-subtitle">
                                    Métricas históricas de esta campaña. El gráfico por hora está disponible en la pestaña “Resumen” (a nivel establecimiento).
                                </p>
                            </div>
                        </section>
                    </>
                )
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
                                    <div className="section-title">Tus campañas</div>
                                </div>
                                {campaignStats.length > 0 && (
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMode("campaigns")}>Ver todas</button>
                                )}
                            </div>
                            <div className="md-top-list">
                                {campaignStats.length === 0 ? (
                                    <div className="md-state">Aún no tienes campañas en este establecimiento.</div>
                                ) : campaignStats.map((c, i) => (
                                    <button type="button" key={c.id} className="md-top-row md-top-row-btn"
                                            onClick={() => openCampaign(c.id)}>
                                        <div className="md-top-color" style={{ background: TOP_COLORS[i % TOP_COLORS.length] }}/>
                                        <div className="md-top-main">
                                            <div className="md-top-name">{c.name}</div>
                                            <div className="mono md-top-meta">
                                                {c.analytics.viewsCount} vistos · {c.analytics.reservationsCount} reservados · {c.analytics.redemptionsCount} redimidos · {Math.round(c.analytics.conversionRate)}% conv.
                                            </div>
                                        </div>
                                        <Icon name="chevron" size={14}/>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}