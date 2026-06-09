import {useEffect, useMemo, useRef, useState} from "react";
import {Coupon} from "@/shared/types.ts";
import { CATEGORIES } from "@/shared/constants";
import { Icon } from "@/shared/ui/components/Icon";

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
                    <h1 className="cat-h1">
                        ¿Qué se te antoja <em className="cat-h1-em">hoy</em>?
                    </h1>
                    <p className="cat-intro">
                        Cupones activos en tu zona, agrupados por categoría. Toca una para ver los locales en el mapa.
                    </p>
                </div>
                <div className="cat-hero-stats">
                    <div>
                        <div className="eyebrow">Cupones activos</div>
                        <div className="mono cat-stat-num">{coupons.length}</div>
                    </div>
                    <div>
                        <div className="eyebrow">Ahorro potencial</div>
                        <div className="mono cat-stat-num accent">S/{totalDiscount}</div>
                    </div>
                </div>
            </div>

            <div className="cat-grid stagger">
                {cats.map(cat => {
                    const n = counts[cat.id] || 0;
                    const sample = coupons.find(c => c.category === cat.id);
                    return (
                        <button type="button" key={cat.id} className="cat-card" onClick={() => onPick(cat.id)} disabled={n === 0}>
                            <div className="cat-card-bg" style={{
                                background: `linear-gradient(135deg, color-mix(in oklab, var(--brand) ${20 + (cat.id.charCodeAt(0) % 30)}%, var(--bg-elev)) 0%, color-mix(in oklab, var(--accent-2) ${10 + (cat.id.charCodeAt(0) % 20)}%, var(--bg-elev)) 100%)`
                            }}/>
                            <div className="cat-card-icon"><Icon name={cat.icon} size={28} stroke={1.4}/></div>
                            <div className="cat-card-body">
                                <div className="cat-card-title">{cat.label}</div>
                                <div className="cat-card-sub">
                                    {n === 0 ? "Sin ofertas activas" : `${n} ${n === 1 ? "cupón disponible" : "cupones disponibles"}`}
                                </div>
                                {sample && n > 0 && (
                                    <div className="cat-card-sample">
                                        Desde <span className="mono cat-card-sample-brand">{sample.brand}</span>
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
                        <h2 className="cat-section-title">Trending esta semana</h2>
                    </div>
                    <button type="button" className="btn btn-sm" onClick={() => onPick("all")}>Ver todo <Icon name="arrowRight" size={13}/></button>
                </div>
                <div className="cat-trending">
                    {trending.map((c, i) => (
                        <button type="button" key={c.id} className="trend-row" onClick={() => onOpenCoupon ? onOpenCoupon(c) : onPick(c.category)}>
                            <div className="trend-rank mono">0{i + 1}</div>
                            <div className={"trend-thumb" + (c.featured ? " featured" : "")}>−{c.discount}</div>
                            <div className="trend-main">
                                <div className="trend-brand">{c.brand}</div>
                                <div className="trend-title">{c.title}</div>
                            </div>
                            <div className="mono trend-rating">
                                <div className="trend-rating-val"><Icon name="star" size={11} filled/> {c.rating}</div>
                                <div className="trend-reservas">{c.reviews} reservas</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}