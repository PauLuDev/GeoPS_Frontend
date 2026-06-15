import { ReportHour } from "@/features/analytics/domain/value-objects/reportData.ts";

interface HourChartProps {
    data: ReportHour[];
}

/* etiqueta corta del eje -> si es una hora 08:00 muestra 08, si no la recorta */
function shortLabel(label: string): string {
    return label.includes(":") ? label.slice(0, 2) : label.slice(0, 5);
}

export function HourChart({ data }: HourChartProps) {
    if (data.length === 0) {
        return <div className="hc-chart hc-empty">Sin datos en este rango</div>;
    }

    const max = Math.max(...data.map(h => h.reserved), 1);
    const peakIdx = data.reduce((best, h, i) => h.reserved > data[best].reserved ? i : best, 0);

    return (
        <div className="hc-chart">
            {data.map((h, i) => (
                <div key={h.hour} className="hc-col"
                     title={`${h.hour} · ${h.reserved} reservados · ${h.redeemed} redimidos`}>
                    <div className="hc-bars">
                        <div className="hc-bar hc-bar-reserved" style={{ height: `${(h.reserved / max) * 100}%`, transitionDelay: `${i * 30}ms` }}/>
                        <div className="hc-bar hc-bar-redeemed" style={{ height: `${(h.redeemed / max) * 100}%`, transitionDelay: `${i * 30 + 80}ms` }}/>
                    </div>
                    <div className={"hc-label" + (i === peakIdx ? " peak" : "")}>
                        {shortLabel(h.hour)}
                    </div>
                </div>
            ))}
        </div>
    );
}