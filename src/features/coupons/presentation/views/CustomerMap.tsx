import {useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import { BottomNav } from "../components/BottomNav.tsx"
import { Coupon, UserLocation } from "@/shared/types.ts";
import { DEFAULT_LOCATION } from "@/features/geolocation/domain/value-objects/defaultLocation.ts";
import { RADIUS_OPTIONS, SORT_OPTIONS } from "@/features/coupons/domain/value-objects/filterConfig.ts";
import { haversine, parseDiscount, parseExpiry, radiusToZoom } from "@/shared/utils/mapUtils.ts";
import { establishmentApi } from "@/features/establishments/infrastructure/api/establishmentApi.ts";
import { CategoryResource } from "@/features/establishments/application/dtos/EstablishmentResource.ts";
import { CustomerTopbar } from "../components/CustomerTopbar.tsx";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import {CouponCard} from "@/features/coupons/presentation/components/CouponCard.tsx";
import {FilterDropdown} from "@/features/coupons/presentation/components/FilterDropdown.tsx";
import {CategoriesView} from "@/features/coupons/presentation/views/CategoriesView.tsx";
import {ProfileView} from "@/features/coupons/presentation/views/ProfileView.tsx";
import {LocationModal} from "@/features/geolocation/presentation/components/LocationModal.tsx";
import {CouponDetailView} from "@/features/coupons/presentation/components/CouponDetailView.tsx";
import {BusinessDetailView} from "@/features/coupons/presentation/components/BusinessDetailView.tsx";
import {GeoMap} from "@/features/geolocation/presentation/components/OSMMap.tsx";
import { Business } from "@/shared/types.ts";
import { useNearbyCoupons } from "@/features/coupons/presentation/hooks/useNearbyCoupons.ts";
import { useReservations } from "@/features/coupons/presentation/hooks/useReservations.ts";
import { getCurrentUser } from "@/features/auth/application/session.ts";

/* local de respaldo cuando el cupon no trae su establecimiento resuelto */
function stubBusiness(c: Coupon): Business {
    return {
        id: `b-stub-${c.id}`, ruc: "No disponible", name: c.brand,
        address: c.address, district: c.address.split(",").pop()?.trim() ?? "Lima",
        category: c.category, description: "", rating: c.rating, totalReviews: c.reviews,
        lat: c.lat, lng: c.lng, hours: [],
    };
}

interface CustomerMapProps {
    onSwitchRole: () => void;
    onSignOut?: () => void;
    mapEngine?: string;
    theme?: string;
    onThemeChange?: (t: string) => void;
}

export function CustomerMap({ onSwitchRole, onSignOut, mapEngine = "osm", theme = "light", onThemeChange }: CustomerMapProps) {
    const [tab, setTab] = useState("map");
    const [activeCategory, setActiveCategory] = useState("all");
    const [detailCoupon, setDetailCoupon] = useState<Coupon | null>(null);
    const [detailBusiness, setDetailBusiness] = useState<Business | null>(null);
    const [activePinId, setActivePinId] = useState<string | undefined>(undefined);
    const me = getCurrentUser();
    const { reservedIds, reserve, codeFor, reservations } = useReservations(me?.id ?? "");

    /* categorias reales para los chips de filtro (se filtra por nombre de categoria) */
    const [categories, setCategories] = useState<CategoryResource[]>([]);
    useEffect(() => {
        establishmentApi.listCategories().then(setCategories).catch(() => setCategories([]));
    }, []);
    const [search, setSearch] = useState("");
    const [userLocation, setUserLocation] = useState<UserLocation>(() => {
        try { const raw = localStorage.getItem("geops_location"); return raw ? JSON.parse(raw) as UserLocation : DEFAULT_LOCATION; }
        catch { return DEFAULT_LOCATION; }
    });
    const [radius, setRadius] = useState(100);
    const [sortBy, setSortBy] = useState("distance");

    /* cupones cerca del usuario, armados juntando varias fuentes */
    const { coupons, resolveBusiness, loading: couponsLoading } = useNearbyCoupons(userLocation.lat, userLocation.lng, radius);
    const openBusiness = (c: Coupon): Business => resolveBusiness(c.brand, stubBusiness(c));
    const [showFilter, setShowFilter] = useState("all");   // all | top | popular
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    /* solo fuerza el modal en la primera visita (sin ubicacion guardada) */
    const [showLocationModal, setShowLocationModal] = useState(() => !localStorage.getItem("geops_location"));
    const { t } = useTranslation();
    const showSaved = tab === "saved";
    const radiusText = radius === Infinity ? t("map.radiusFull") : radius >= 1000 ? `${radius / 1000}km` : `${radius}m`;

    /* cambia de tab; limpia el detalle abierto y, al entrar a "guardados", resetea la categoria */
    const selectTab = (t: string) => {
        if (t === "saved") setActiveCategory("all");
        setDetailCoupon(null);
        setDetailBusiness(null);
        setActivePinId(undefined);
        setTab(t);
    };

    const realDist = (c: Coupon) => Math.round(haversine(userLocation.lat, userLocation.lng, c.lat, c.lng));
    const realWalk = (c: Coupon) => Math.round(realDist(c) / 80);

    const filtered = useMemo(() => {
        const r = radius === Infinity ? Infinity : radius;
        const list = coupons.filter(c => {
            if (activeCategory !== "all" && c.category !== activeCategory) return false;
            if (search && !`${c.brand} ${c.title}`.toLowerCase().includes(search.toLowerCase())) return false;
            if (showSaved && !reservedIds.has(c.id)) return false;
            if (r !== Infinity && haversine(userLocation.lat, userLocation.lng, c.lat, c.lng) > r) return false;
            if (showFilter === "top" && !c.featured) return false;        // solo destacados
            if (showFilter === "popular" && c.reviews < 100) return false; // solo los mas reseñados
            return true;
        });
        return list.sort((a, b) => {
            if (sortBy === "discount") return parseDiscount(b.discount) - parseDiscount(a.discount);
            if (sortBy === "expiry")   return parseExpiry(a.expiresIn) - parseExpiry(b.expiresIn);
            if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
            return haversine(userLocation.lat, userLocation.lng, a.lat, a.lng)
                - haversine(userLocation.lat, userLocation.lng, b.lat, b.lng);
        });
    }, [coupons, activeCategory, search, showSaved, reservedIds, userLocation, radius, sortBy, showFilter]);

    const countWithoutRadius = useMemo(() => coupons.filter(c => {
        if (activeCategory !== "all" && c.category !== activeCategory) return false;
        if (search && !`${c.brand} ${c.title}`.toLowerCase().includes(search.toLowerCase())) return false;
        if (showSaved && !reservedIds.has(c.id)) return false;
        return true;
    }).length, [coupons, activeCategory, search, showSaved, reservedIds]);

    const emptyByRadius = filtered.length === 0 && countWithoutRadius > 0;

    /* reservar = guardar: alterna el cupon en la seccion Guardados */
    /* reservar = llamar al back; la reserva no se puede deshacer desde el cliente */
    const handleReserve = async (id: string) => { await reserve(id); };

    const handleSelectLocation = (loc: UserLocation) => {
        setUserLocation(loc);
        try { localStorage.setItem("geops_location", JSON.stringify(loc)); } catch { /* ignore */ }
        setShowLocationModal(false);
    };

    const hudCoords = `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;

    return (
        <div className="customer-app">
            <CustomerTopbar
                onProfileClick={() => setTab("profile")}
                onSignOut={onSignOut}
                locationName={userLocation.name}
                onLocationClick={() => setShowLocationModal(true)}
            />

            <div className={"map-shell" + (tab === "map" || tab === "saved" ? "" : " stacked") + (panelCollapsed ? " panel-collapsed" : "")}>
                {(tab === "map" || tab === "saved") && (
                    <>
                        <div className="map-area">
                            <GeoMap engine={mapEngine} theme={theme}
                                    pins={showLocationModal ? [] : filtered}
                                    activePin={activePinId}
                                    onPinClick={(p) => {
                                        const coupon = p as Coupon;
                                        setActivePinId(coupon.id);
                                        setDetailBusiness(openBusiness(coupon));
                                        setDetailCoupon(null);
                                    }}
                                    userPos={{ x: 520, y: 400 }} userCoord={userLocation}
                                    zoom={radiusToZoom(radius)}/>

                            <div className="map-controls fade-up">
                                <div className="search-wrap">
                                    <Icon name="search" size={16}/>
                                    <input className="search-input" aria-label={t("map.searchAria")} placeholder={t("map.searchPlaceholder")}
                                           value={search} onChange={e => setSearch(e.target.value)}/>
                                    {search && (
                                        <button type="button" className="map-search-clear" onClick={() => setSearch("")}>
                                            <Icon name="close" size={14}/>
                                        </button>
                                    )}
                                </div>
                                <div className="cat-row">
                                    <button type="button"
                                            className={"chip " + (activeCategory === "all" ? "active" : "")}
                                            onClick={() => setActiveCategory("all")}>
                                        <Icon name="grid" size={14}/>
                                        {t("cat.all")}
                                        <span className="mono chip-count">{coupons.length}</span>
                                    </button>
                                    {categories.map(cat => {
                                        const count = coupons.filter(c => c.category === cat.name).length;
                                        return (
                                            <button type="button" key={cat.id}
                                                    className={"chip " + (activeCategory === cat.name ? "active" : "")}
                                                    onClick={() => setActiveCategory(cat.name)}>
                                                <Icon name="store" size={14}/>
                                                {cat.name}
                                                <span className="mono chip-count">{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="map-hud">
                                <div className={"hud-dot" + (userLocation.source === "gps" ? " gps" : "")}/>
                                <span className="mono hud-coords">{hudCoords}</span>
                                <span className="hud-sep">·</span>
                                <span className="hud-name">{userLocation.name}</span>
                                {userLocation.source === "gps" && <span className="hud-gps-badge">GPS</span>}
                            </div>

                            <div className="map-tools">
                                <button type="button" className="btn btn-icon tip" data-tip={t("map.centerLocation")}
                                        onClick={() => setShowLocationModal(true)}>
                                    <Icon name="location" size={16}/>
                                </button>
                                <button type="button" className="btn btn-icon tip" data-tip={t("map.layers")}>
                                    <Icon name="layers" size={16}/>
                                </button>
                                <div className="zoom-stack">
                                    <button type="button" className="btn btn-icon zoom-btn-top"><Icon name="plus" size={16}/></button>
                                    <button type="button" className="btn btn-icon zoom-btn-bot"><Icon name="close" size={14}/></button>
                                </div>
                            </div>
                        </div>

                        <aside className="results-pane">
                            {detailBusiness ? (
                                <BusinessDetailView
                                    business={detailBusiness}
                                    coupons={coupons.filter(c => c.brand === detailBusiness.name)}
                                    reserved={reservedIds}
                                    onToggleSaved={() => {}}
                                    onBack={() => setDetailBusiness(null)}
                                    onViewCoupon={(c) => { setDetailCoupon(c); setDetailBusiness(null); }}
                                    realDist={realDist}
                                    realWalk={realWalk}
                                />
                            ) : detailCoupon ? (
                                <CouponDetailView
                                    c={detailCoupon}
                                    isReserved={reservedIds.has(detailCoupon.id)}
                                    onReserve={() => handleReserve(detailCoupon.id)}
                                    redemptionCode={codeFor(detailCoupon.id)}
                                    onBack={() => setDetailCoupon(null)}
                                    onViewBusiness={() => setDetailBusiness(openBusiness(detailCoupon))}
                                    realDist={realDist(detailCoupon)}
                                    realWalk={realWalk(detailCoupon)}
                                />
                            ) : (<>
                                <div className="results-head">
                                    <div>
                                        <div className="eyebrow">{showSaved ? t("map.yourCoupons") : t("map.radiusLabel", { value: radiusText })}</div>
                                        <div className="rp-count">
                                            {showSaved ? t("map.countSaved", { count: filtered.length }) : t("map.countNear", { count: filtered.length })}
                                        </div>
                                    </div>
                                </div>

                                {!showSaved && (
                                    <div className="rp-filters">
                                        <div className="rp-filter-row">
                                            <FilterDropdown
                                                label={t("map.radius")}
                                                display={radius === Infinity ? t("map.radiusAll") : radiusText}
                                                items={RADIUS_OPTIONS.map(o => ({
                                                    key: o.label,
                                                    label: o.value === Infinity ? t("map.radiusAll") : o.label,
                                                    active: radius === o.value,
                                                    onSelect: () => setRadius(o.value),
                                                }))}
                                            />
                                            <FilterDropdown
                                                label={t("map.sort")}
                                                display={t(`map.sortOpt.${sortBy}`)}
                                                items={SORT_OPTIONS.map(o => ({
                                                    key: o.id,
                                                    label: t(`map.sortOpt.${o.id}`),
                                                    active: sortBy === o.id,
                                                    onSelect: () => setSortBy(o.id),
                                                }))}
                                            />
                                            <FilterDropdown
                                                label={t("map.show")}
                                                display={t(`map.showOpt.${showFilter}`)}
                                                items={["all", "top", "popular"].map(id => ({
                                                    key: id,
                                                    label: t(`map.showOpt.${id}`),
                                                    active: showFilter === id,
                                                    onSelect: () => setShowFilter(id),
                                                }))}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="results-list">
                                    {couponsLoading ? (
                                        <div className="rp-empty">
                                            <div className="rp-empty-icon"><Icon name="location" size={24}/></div>
                                            <div className="rp-empty-title">{t("map.loadingCoupons")}</div>
                                        </div>
                                    ) : filtered.length === 0 ? (
                                        <div className="rp-empty">
                                            <div className="rp-empty-icon">
                                                <Icon name={showSaved ? "ticket" : "location"} size={24}/>
                                            </div>
                                            {showSaved ? (
                                                <>
                                                    <div className="rp-empty-title">{t("map.emptySavedTitle")}</div>
                                                    <div className="rp-empty-text">
                                                        {t("map.emptySavedText")}
                                                    </div>
                                                    <button type="button" className="btn btn-brand btn-sm rp-empty-cta" onClick={() => setTab("map")}>
                                                        {t("map.exploreCoupons")} <Icon name="arrowRight" size={13}/>
                                                    </button>
                                                </>
                                            ) : emptyByRadius ? (
                                                <>
                                                    <div className="rp-empty-title">{t("map.emptyRadiusTitle")}</div>
                                                    <div className="rp-empty-text">
                                                        {t("map.emptyRadiusText", {
                                                            cat: activeCategory !== "all" ? t("map.emptyRadiusCat", { label: t(`cat.${activeCategory}`) }) : "",
                                                            radius: radius >= 1000 ? `${radius / 1000}km` : `${radius}m`,
                                                            name: userLocation.name,
                                                        })}
                                                    </div>
                                                    <div className="rp-empty-actions">
                                                        <button type="button" className="btn btn-brand btn-sm" onClick={() => setRadius(Infinity)}>
                                                            {t("map.seeAllLima")} <Icon name="arrowRight" size={13}/>
                                                        </button>
                                                        {activeCategory !== "all" && (
                                                            <button type="button" className="btn btn-sm" onClick={() => setActiveCategory("all")}>
                                                                {t("map.removeFilter")}
                                                            </button>
                                                        )}
                                                        <button type="button" className="btn btn-sm" onClick={() => setShowLocationModal(true)}>
                                                            <Icon name="location" size={13}/> {t("map.changeZone")}
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="rp-empty-title">{t("map.noResultsTitle")}</div>
                                                    <div className="rp-empty-text">
                                                        {t("map.noResultsText")}
                                                    </div>
                                                    <button type="button" className="btn btn-sm rp-empty-cta" onClick={() => { setActiveCategory("all"); setRadius(Infinity); }}>
                                                        {t("map.seeAllCoupons")}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        filtered.map(c => (
                                            <CouponCard key={c.id} c={c}
                                                        isReserved={reservedIds.has(c.id)}
                                                        onToggleSaved={() => {}}
                                                        onClick={() => { setDetailCoupon(c); setActivePinId(c.id); setDetailBusiness(null); }}
                                                        isSelected={activePinId === c.id}
                                                        realDist={realDist(c)}
                                                        realWalk={realWalk(c)}/>
                                        ))
                                    )}
                                </div>
                            </>)}
                        </aside>

                        {/* contraer / expandir el panel lateral */}
                        <button type="button" className="panel-toggle"
                                onClick={() => setPanelCollapsed(c => !c)}
                                aria-label={panelCollapsed ? t("map.panelExpand") : t("map.panelCollapse")}
                                title={panelCollapsed ? t("map.panelExpand") : t("map.panelCollapse")}>
                            <Icon name="chevron" size={16}/>
                        </button>
                    </>
                )}

                {tab === "categories" && (
                    <CategoriesView
                        coupons={coupons}
                        categories={categories}
                        onPick={catName => { setActiveCategory(catName); setTab("map"); }}
                        onOpenCoupon={c => { setDetailCoupon(c); setTab("map"); }}
                    />
                )}

                {tab === "profile" && (
                    <ProfileView
                        reservedCount={reservations.length}
                        reservedCoupons={coupons.filter(c => reservedIds.has(c.id))}
                        theme={theme}
                        onThemeChange={onThemeChange}
                        onSignOut={onSignOut}
                    />
                )}
            </div>

            <BottomNav tab={tab} setTab={selectTab} savedCount={reservations.length}/>

            {showLocationModal && (
                <LocationModal
                    onSelect={handleSelectLocation}
                    onClose={() => setShowLocationModal(false)}
                    isFirst={userLocation.source === "default"}
                />
            )}

        </div>
    );
}