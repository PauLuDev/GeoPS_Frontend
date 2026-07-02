import {useMemo} from "react";
import {useTranslation} from "react-i18next";
import {Coupon} from "@/shared/types.ts";
import { CategoryResource } from "@/features/establishments/application/dtos/EstablishmentResource.ts";
import { Icon } from "@/shared/ui/components/Icon";
import { FilterDropdown } from "@/features/coupons/presentation/components/FilterDropdown.tsx";
import { RADIUS_OPTIONS } from "@/features/coupons/domain/value-objects/filterConfig.ts";

interface CategoriesViewProps {
    coupons: Coupon[];
    categories: CategoryResource[];
    radius: number;
    onRadiusChange: (r: number) => void;
    loading?: boolean;
    onPick: (catName: string) => void;
    onOpenCoupon?: (c: Coupon) => void;
}

export function CategoriesView({ coupons, categories, radius, onRadiusChange, loading = false, onPick, onOpenCoupon }: CategoriesViewProps) {
    const { t } = useTranslation();
    const radiusText = radius === Infinity ? t("map.radiusAll") : radius >= 1000 ? `${radius / 1000}km` : `${radius}m`;
    const counts = useMemo(() => {
        const m: Record<string, number> = {};
        coupons.forEach(c => { m[c.category] = (m[c.category] || 0) + 1; });
        return m;
    }, [coupons]);
    const cats = categories;
    const totalDiscount = coupons.reduce((s, c) => s + (c.originalPrice - c.finalPrice), 0);
    const trending = [...coupons].sort((a, b) => b.reviews - a.reviews).slice(0, 3);

    return (
        <div className="cat-view">
            <div className="cat-hero">
                <div>
                    <div className="eyebrow">{t("categories.explore")}</div>
                    <h1 className="cat-h1">
                        {t("categories.headingPre")}<em className="cat-h1-em">{t("categories.headingEm")}</em>{t("categories.headingPost")}
                    </h1>
                    <p className="cat-intro">
                        {t("categories.intro")}
                    </p>
                </div>
                <div className="cat-hero-stats">
                    <div>
                        <div className="eyebrow">{t("categories.activeCoupons")}</div>
                        <div className="mono cat-stat-num">{coupons.length}</div>
                    </div>
                    <div>
                        <div className="eyebrow">{t("categories.potentialSavings")}</div>
                        <div className="mono cat-stat-num accent">S/{totalDiscount}</div>
                    </div>
                </div>
            </div>

            <div className="cat-filter-row">
                <FilterDropdown
                    label={t("map.radius")}
                    display={radiusText}
                    items={RADIUS_OPTIONS.map((o) => ({
                        key: o.label,
                        label: o.value === Infinity ? t("map.radiusAll") : o.label,
                        active: radius === o.value,
                        onSelect: () => onRadiusChange(o.value),
                    }))}
                />
                <span className="cat-filter-hint">
                    {loading
                        ? t("map.loadingCoupons")
                        : t("categories.radiusHint", { value: radiusText })}
                </span>
            </div>

            <div className="cat-grid stagger">
                {cats.map(cat => {
                    const n = counts[cat.name] || 0;
                    const sample = coupons.find(c => c.category === cat.name);
                    const seed = cat.name.charCodeAt(0) || 65;
                    return (
                        <button type="button" key={cat.id} className="cat-card" onClick={() => onPick(cat.name)} disabled={n === 0}>
                            <div className="cat-card-bg" style={{
                                background: `linear-gradient(135deg, color-mix(in oklab, var(--brand) ${20 + (seed % 30)}%, var(--bg-elev)) 0%, color-mix(in oklab, var(--accent-2) ${10 + (seed % 20)}%, var(--bg-elev)) 100%)`
                            }}/>
                            <div className="cat-card-icon"><Icon name="store" size={28} stroke={1.4}/></div>
                            <div className="cat-card-body">
                                <div className="cat-card-title">{cat.name}</div>
                                <div className="cat-card-sub">
                                    {n === 0 ? t("categories.noOffers") : t("categories.available", { count: n })}
                                </div>
                                {sample && n > 0 && (
                                    <div className="cat-card-sample">
                                        {t("categories.from")} <span className="mono cat-card-sample-brand">{sample.brand}</span>
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
                        <div className="eyebrow">{t("categories.mostReserved")}</div>
                        <h2 className="cat-section-title">{t("categories.trending")}</h2>
                    </div>
                    <button type="button" className="btn btn-sm" onClick={() => onPick("all")}>{t("common.seeAll")} <Icon name="arrowRight" size={13}/></button>
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
                                <div className="trend-reservas">{t("categories.reservations", { count: c.reviews })}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}