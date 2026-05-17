import { Icon } from "@/app/ui/components/Icon";
import { useState } from "react";
import {CATEGORIES} from "@/app/core/common/constants.ts";

export function NewCampaign({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
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