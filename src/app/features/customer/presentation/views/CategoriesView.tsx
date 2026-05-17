import {useEffect, useMemo, useRef, useState} from "react";
import {Coupon} from "@/app/core/common/types.ts";
import { CATEGORIES } from "@/app/core/common/constants";
import { Icon } from "@/app/ui/components/Icon";

interface CategoriesViewProps {
    coupons: Coupon[];
    onPick: (catId: string) => void;
    onOpenCoupon?: (c: Coupon) => void;
}

export function CategoriesView({ coupons, onPick, onOpenCoupon }: CategoriesViewProps) {
    const counts = useMemo(() => {
        const m: Record<string, number> = {};
        coupons.forEach(c => { m[c.category] = (m[c.category] || 0) + 1; });
        return m;
    }, [coupons]);
    const cats = CATEGORIES.filter(c => c.id !== "all");
    const totalDiscount = coupons.reduce((s, c) => s + (c.originalPrice - c.finalPrice), 0);
    const trending = [...coupons].sort((a, b) => b.reviews - a.reviews).slice(0, 3);

    return (
        <div className="cat-view">
            <div className="cat-hero">
                <div>
                    <div className="eyebrow">Explorar</div>
                    <h1 style={{ margin: "6px 0 0", fontSize: 36, fontWeight: 600, letterSpacing: "-0.03em" }}>
                        ¿Qué se te antoja <em style={{ fontStyle: "normal", color: "var(--brand-strong)" }}>hoy</em>?
                    </h1>
                    <p style={{ margin: "10px 0 0", color: "var(--ink-2)", maxWidth: 520 }}>
                        Cupones activos en tu zona, agrupados por categoría. Toca una para ver los locales en el mapa.
                    </p>
                </div>
                <div className="cat-hero-stats">
                    <div>
                        <div className="eyebrow">Cupones activos</div>
                        <div className="mono" style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em" }}>{coupons.length}</div>
                    </div>
                    <div>
                        <div className="eyebrow">Ahorro potencial</div>
                        <div className="mono" style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--brand-strong)" }}>S/{totalDiscount}</div>
                    </div>
                </div>
            </div>

            <div className="cat-grid stagger">
                {cats.map(cat => {
                    const n = counts[cat.id] || 0;
                    const sample = coupons.find(c => c.category === cat.id);
                    return (
                        <button key={cat.id} className="cat-card" onClick={() => onPick(cat.id)} disabled={n === 0}>
                            <div className="cat-card-bg" style={{
                                background: `linear-gradient(135deg, color-mix(in oklab, var(--brand) ${20 + (cat.id.charCodeAt(0) % 30)}%, var(--bg-elev)) 0%, color-mix(in oklab, var(--accent-2) ${10 + (cat.id.charCodeAt(0) % 20)}%, var(--bg-elev)) 100%)`
                            }}/>
                            <div className="cat-card-icon"><Icon name={cat.icon} size={28} stroke={1.4}/></div>
                            <div className="cat-card-body">
                                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>{cat.label}</div>
                                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
                                    {n === 0 ? "Sin ofertas activas" : `${n} ${n === 1 ? "cupón disponible" : "cupones disponibles"}`}
                                </div>
                                {sample && n > 0 && (
                                    <div className="cat-card-sample">
                                        Desde <span className="mono" style={{ color: "var(--ink)", fontWeight: 600 }}>{sample.brand}</span>
                                    </div>
                                )}
                            </div>
                            <div className="cat-card-arrow"><Icon name="arrowRight" size={16}/></div>
                        </button>
                    );
                })}
            </div>

            <div className="cat-section">
                <div className="cat-section-head">
                    <div>
                        <div className="eyebrow">Lo más reservado</div>
                        <h2 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>Trending esta semana</h2>
                    </div>
                    <button className="btn btn-sm" onClick={() => onPick("all")}>Ver todo <Icon name="arrowRight" size={13}/></button>
                </div>
                <div className="cat-trending">
                    {trending.map((c, i) => (
                        <div key={c.id} className="trend-row" onClick={() => onOpenCoupon ? onOpenCoupon(c) : onPick(c.category)}>
                            <div className="trend-rank mono">0{i + 1}</div>
                            <div className="cc-thumb" style={{
                                width: 56, height: 56, borderRadius: 10,
                                background: `linear-gradient(135deg, color-mix(in oklab, var(--brand) ${c.featured ? 70 : 30}%, var(--bg-sunken)) 0%, color-mix(in oklab, var(--accent-2) ${c.featured ? 30 : 10}%, var(--bg-sunken)) 100%)`,
                                display: "grid", placeItems: "center", color: "var(--brand-ink)",
                                fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 14
                            }}>−{c.discount}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{c.brand}</div>
                                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                            </div>
                            <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "right" }}>
                                <Icon name="star" size={11} filled style={{ color: "var(--warn)" }}/> {c.rating}
                                <div style={{ marginTop: 2 }}>{c.reviews} reservas</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}