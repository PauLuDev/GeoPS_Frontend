import {useMemo, useState} from "react";
import { BottomNav } from "../components/BottomNav.tsx"
import { Coupon, UserLocation } from "@/shared/types.ts";
import { DEFAULT_LOCATION } from "@/features/geolocation/domain/value-objects/defaultLocation.ts";
import { RADIUS_OPTIONS, SORT_OPTIONS } from "@/features/coupons/domain/value-objects/filterConfig.ts";
import { haversine, parseDiscount, parseExpiry, radiusToZoom } from "@/shared/utils/mapUtils.ts";
import {CATEGORIES, COUPONS} from "@/shared/constants.ts";
import { CustomerTopbar } from "../components/CustomerTopbar.tsx";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import {CouponCard} from "@/features/coupons/presentation/components/CouponCard.tsx";
import {CategoriesView} from "@/features/coupons/presentation/views/CategoriesView.tsx";
import {ProfileView} from "@/features/coupons/presentation/views/ProfileView.tsx";
import {LocationModal} from "@/features/geolocation/presentation/components/LocationModal.tsx";
import {CouponDetailView} from "@/features/coupons/presentation/components/CouponDetailView.tsx";
import {BusinessDetailView} from "@/features/coupons/presentation/components/BusinessDetailView.tsx";
import {GeoMap} from "@/features/geolocation/presentation/components/OSMMap.tsx";
import { Business } from "@/shared/types.ts";
import { getBusinessForCoupon } from "@/shared/constants.ts";

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
    const [favorites, setFavorites] = useState(new Set<string>());
    const [reserved, setReserved] = useState(new Set<string>());
    const [search, setSearch] = useState("");
    const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_LOCATION);
    const [radius, setRadius] = useState(5000);
    const [sortBy, setSortBy] = useState("distance");
    const [showLocationModal, setShowLocationModal] = useState(true);
    const showFavorites = tab === "saved";

    /* cambia de tab; al entrar a "guardados" resetea la categoria (en el handler, no en un effect) */
    const selectTab = (t: string) => {
        if (t === "saved") setActiveCategory("all");
        setTab(t);
    };

    const realDist = (c: Coupon) => Math.round(haversine(userLocation.lat, userLocation.lng, c.lat, c.lng));
    const realWalk = (c: Coupon) => Math.round(realDist(c) / 80);

    const filtered = useMemo(() => {
        const r = radius === Infinity ? Infinity : radius;
        const list = COUPONS.filter(c => {
            if (activeCategory !== "all" && c.category !== activeCategory) return false;
            if (search && !`${c.brand} ${c.title}`.toLowerCase().includes(search.toLowerCase())) return false;
            if (showFavorites && !favorites.has(c.id)) return false;
            if (r !== Infinity && haversine(userLocation.lat, userLocation.lng, c.lat, c.lng) > r) return false;
            return true;
        });
        return list.sort((a, b) => {
            if (sortBy === "discount") return parseDiscount(b.discount) - parseDiscount(a.discount);
            if (sortBy === "expiry")   return parseExpiry(a.expiresIn) - parseExpiry(b.expiresIn);
            if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
            return haversine(userLocation.lat, userLocation.lng, a.lat, a.lng)
                - haversine(userLocation.lat, userLocation.lng, b.lat, b.lng);
        });
    }, [activeCategory, search, showFavorites, favorites, userLocation, radius, sortBy]);

    const countWithoutRadius = useMemo(() => COUPONS.filter(c => {
        if (activeCategory !== "all" && c.category !== activeCategory) return false;
        if (search && !`${c.brand} ${c.title}`.toLowerCase().includes(search.toLowerCase())) return false;
        if (showFavorites && !favorites.has(c.id)) return false;
        return true;
    }).length, [activeCategory, search, showFavorites, favorites]);

    const emptyByRadius = filtered.length === 0 && countWithoutRadius > 0;

    const toggleFav = (id: string) => {
        setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    };
    const reserve = (id: string) => {
        setReserved(prev => new Set(prev).add(id));
    };

    const handleSelectLocation = (loc: UserLocation) => {
        setUserLocation(loc);
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

            <div className={"map-shell" + (tab === "map" || tab === "saved" ? "" : " stacked")}>
                {(tab === "map" || tab === "saved") && (
                    <>
                        <div className="map-area">
                            <GeoMap engine={mapEngine} theme={theme}
                                    pins={showLocationModal ? [] : filtered}
                                    activePin={activePinId}
                                    onPinClick={(p) => {
                                        const coupon = p as Coupon;
                                        setActivePinId(coupon.id);
                                        setDetailBusiness(getBusinessForCoupon(coupon));
                                        setDetailCoupon(null);
                                    }}
                                    userPos={{ x: 520, y: 400 }} userCoord={userLocation}
                                    zoom={radiusToZoom(radius)}/>

                            <div className="map-controls fade-up">
                                <div className="search-wrap">
                                    <Icon name="search" size={16}/>
                                    <input className="search-input" aria-label="Buscar cupones o locales" placeholder="Buscar cupones, locales..."
                                           value={search} onChange={e => setSearch(e.target.value)}/>
                                    {search && (
                                        <button type="button" className="map-search-clear" onClick={() => setSearch("")}>
                                            <Icon name="close" size={14}/>
                                        </button>
                                    )}
                                </div>
                                <div className="cat-row">
                                    {CATEGORIES.map(cat => {
                                        const count = cat.id === "all"
                                            ? COUPONS.length
                                            : COUPONS.filter(c => c.category === cat.id).length;
                                        return (
                                            <button type="button" key={cat.id}
                                                    className={"chip " + (activeCategory === cat.id ? "active" : "")}
                                                    onClick={() => setActiveCategory(cat.id)}>
                                                <Icon name={cat.icon} size={14}/>
                                                {cat.label}
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
                                <button type="button" className="btn btn-icon tip" data-tip="Centrar en mi ubicación"
                                        onClick={() => setShowLocationModal(true)}>
                                    <Icon name="location" size={16}/>
                                </button>
                                <button type="button" className="btn btn-icon tip" data-tip="Capas">
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
                                    coupons={COUPONS.filter(c => c.brand === detailBusiness.name)}
                                    favorites={favorites}
                                    reserved={reserved}
                                    onToggleFav={toggleFav}
                                    onBack={() => setDetailBusiness(null)}
                                    onViewCoupon={(c) => { setDetailCoupon(c); setDetailBusiness(null); }}
                                    realDist={realDist}
                                    realWalk={realWalk}
                                />
                            ) : detailCoupon ? (
                                <CouponDetailView
                                    c={detailCoupon}
                                    isFav={favorites.has(detailCoupon.id)}
                                    isReserved={reserved.has(detailCoupon.id)}
                                    onToggleFav={() => toggleFav(detailCoupon.id)}
                                    onReserve={() => reserve(detailCoupon.id)}
                                    onBack={() => setDetailCoupon(null)}
                                    onViewBusiness={() => setDetailBusiness(getBusinessForCoupon(detailCoupon))}
                                    realDist={realDist(detailCoupon)}
                                    realWalk={realWalk(detailCoupon)}
                                />
                            ) : (<>
                                <div className="results-head">
                                    <div>
                                        <div className="eyebrow">{showFavorites ? "Tus guardados" : `Radio: ${radius === Infinity ? "Lima completa" : radius >= 1000 ? `${radius/1000}km` : `${radius}m`}`}</div>
                                        <div className="rp-count">
                                            {filtered.length} cupone{filtered.length !== 1 ? "s" : ""}{showFavorites ? " guardados" : " cercanos"}
                                        </div>
                                    </div>
                                </div>

                                {!showFavorites && (
                                    <div className="rp-filters">
                                        <div className="results-sort rp-sort-row rp-sort-divided">
                                            <span className="rp-sort-label">Radio</span>
                                            {RADIUS_OPTIONS.map(o => (
                                                <button type="button" key={o.label}
                                                        className={"chip chip-sm" + (radius === o.value ? " active" : "")}
                                                        onClick={() => setRadius(o.value)}>
                                                    {o.label}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="results-sort rp-sort-row">
                                            <span className="rp-sort-label">Orden</span>
                                            {SORT_OPTIONS.map(o => (
                                                <button type="button" key={o.id}
                                                        className={"chip chip-sm" + (sortBy === o.id ? " active" : "")}
                                                        onClick={() => setSortBy(o.id)}>
                                                    {o.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="results-list">
                                    {filtered.length === 0 ? (
                                        <div className="rp-empty">
                                            <div className="rp-empty-icon">
                                                <Icon name="location" size={24}/>
                                            </div>
                                            {showFavorites ? (
                                                <>
                                                    <div className="rp-empty-title">Aún no tienes guardados</div>
                                                    <div className="rp-empty-text">
                                                        Explora el mapa y guarda los cupones que más te interesen.
                                                    </div>
                                                    <button type="button" className="btn btn-brand btn-sm rp-empty-cta" onClick={() => setTab("map")}>
                                                        Explorar cupones <Icon name="arrowRight" size={13}/>
                                                    </button>
                                                </>
                                            ) : emptyByRadius ? (
                                                <>
                                                    <div className="rp-empty-title">Sin ofertas en este radio</div>
                                                    <div className="rp-empty-text">
                                                        No hay cupones{activeCategory !== "all" ? ` de "${CATEGORIES.find(c => c.id === activeCategory)?.label}"` : ""} en un radio de {radius >= 1000 ? `${radius/1000}km` : `${radius}m`} cerca de <strong>{userLocation.name}</strong>.
                                                    </div>
                                                    <div className="rp-empty-actions">
                                                        <button type="button" className="btn btn-brand btn-sm" onClick={() => setRadius(Infinity)}>
                                                            Ver toda Lima <Icon name="arrowRight" size={13}/>
                                                        </button>
                                                        {activeCategory !== "all" && (
                                                            <button type="button" className="btn btn-sm" onClick={() => setActiveCategory("all")}>
                                                                Quitar filtro
                                                            </button>
                                                        )}
                                                        <button type="button" className="btn btn-sm" onClick={() => setShowLocationModal(true)}>
                                                            <Icon name="location" size={13}/> Cambiar zona
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="rp-empty-title">No hay resultados</div>
                                                    <div className="rp-empty-text">
                                                        Prueba con otra categoría o ajusta el radio de búsqueda.
                                                    </div>
                                                    <button type="button" className="btn btn-sm rp-empty-cta" onClick={() => { setActiveCategory("all"); setRadius(Infinity); }}>
                                                        Ver todos los cupones
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        filtered.map(c => (
                                            <CouponCard key={c.id} c={c}
                                                        isFav={favorites.has(c.id)}
                                                        isReserved={reserved.has(c.id)}
                                                        onToggleFav={() => toggleFav(c.id)}
                                                        onClick={() => { setDetailCoupon(c); setActivePinId(c.id); setDetailBusiness(null); }}
                                                        isSelected={activePinId === c.id}
                                                        realDist={realDist(c)}
                                                        realWalk={realWalk(c)}/>
                                        ))
                                    )}
                                </div>
                            </>)}
                        </aside>
                    </>
                )}

                {tab === "categories" && (
                    <CategoriesView
                        coupons={COUPONS}
                        onPick={catId => { setActiveCategory(catId); setTab("map"); }}
                        onOpenCoupon={c => { setDetailCoupon(c); setTab("map"); }}
                    />
                )}

                {tab === "profile" && (
                    <ProfileView
                        favCount={favorites.size}
                        reservedCount={reserved.size}
                        reservedCoupons={COUPONS.filter(c => reserved.has(c.id))}
                        onOpenCoupon={c => { setDetailCoupon(c); setTab("map"); }}
                        theme={theme}
                        onThemeChange={onThemeChange}
                        onSignOut={onSignOut}
                    />
                )}
            </div>

            <BottomNav tab={tab} setTab={selectTab} favCount={favorites.size}/>

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