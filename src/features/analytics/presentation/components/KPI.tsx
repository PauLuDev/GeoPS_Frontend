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