import {useState} from "react";
import {Icon} from "@/shared/ui/components/Icon.tsx";

interface KPIProps {
    label: string;
    value: string;
    delta: string;
    trend: string;
    sparkData: number[];
}

export function KPI({ label, value, delta, trend, sparkData }: KPIProps) {
    const max = Math.max(0, ...sparkData) || 1;
    const w = 110, h = 36;
    const slug = label.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
    const path = sparkData.map((v, i) => {
        const x = (i / (sparkData.length - 1)) * w;
        const y = h - (v / max) * h;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
    return (
        <div className="card kpi-card">
            <div className="eyebrow">{label}</div>
            <div className="kpi-row">
                <div className="mono tnum kpi-value">{value}</div>
                {delta && (
                    <div className={"kpi-delta" + (trend === "up" ? " up" : " down")}>
                        <Icon name="trending" size={11}/> {delta}
                    </div>
                )}
            </div>
            <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="36" className="kpi-spark">
                <defs>
                    <linearGradient id={`grad-${slug}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="var(--brand)" stopOpacity="0"/>
                    </linearGradient>
                </defs>
                <path className="kpi-spark-fill" d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={`url(#grad-${slug})`}/>
                <path className="kpi-spark-line" d={path} pathLength={1} fill="none" stroke="var(--brand-strong)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    );
}