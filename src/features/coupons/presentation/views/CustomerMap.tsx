import {useEffect, useMemo, useState} from "react";
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
import {GeoMap} from "@/features/geolocation/presentation/components/OSMMap.tsx";

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
    const [favorites, setFavorites] = useState(new Set<string>());
    const [reserved, setReserved] = useState(new Set<string>());
    const [search, setSearch] = useState("");
    const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_LOCATION);
    const [radius, setRadius] = useState(5000);
    const [sortBy, setSortBy] = useState("distance");
    const [showLocationModal, setShowLocationModal] = useState(true);
    const showFavorites = tab === "saved";

    useEffect(() => { if (tab === "saved") setActiveCategory("all"); }, [tab]);

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

            <div className="map-shell" style={{ display: tab === "map" || tab === "saved" ? "grid" : "block", overflowY: tab === "map" || tab === "saved" ? "hidden" : "auto" }}>
                {(tab === "map" || tab === "saved") && (
                    <>
                        <div className="map-area">
                            <GeoMap engine={mapEngine} theme={theme}
                                    pins={showLocationModal ? [] : filtered} activePin={detailCoupon?.id}
                                    onPinClick={(p) => setDetailCoupon(p as Coupon)}
                                    userPos={{ x: 520, y: 400 }} userCoord={userLocation}
                                    zoom={radiusToZoom(radius)}/>

                            <div className="map-controls fade-up">
                                <div className="search-wrap">
                                    <Icon name="search" size={16}/>
                                    <input className="search-input" aria-label="Buscar cupones o locales" placeholder="Buscar cupones, locales..."
                                           value={search} onChange={e => setSearch(e.target.value)}/>
                                    {search && (
                                        <button type="button" style={{ appearance: "none", border: 0, background: "transparent", padding: 4, cursor: "pointer" }} onClick={() => setSearch("")}>
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
                                                <span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="map-hud">
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: userLocation.source === "gps" ? "#22c55e" : "var(--brand)", flexShrink: 0 }}/>
                                <span className="mono" style={{ fontSize: 11 }}>{hudCoords}</span>
                                <span style={{ color: "var(--ink-3)" }}>·</span>
                                <span style={{ fontSize: 11 }}>{userLocation.name}</span>
                                {userLocation.source === "gps" && <span style={{ fontSize: 9, background: "#22c55e20", color: "#16a34a", borderRadius: 4, padding: "1px 5px", fontFamily: "var(--font-mono)" }}>GPS</span>}
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
                                    <button type="button" className="btn btn-icon" style={{ borderRadius: "10px 10px 0 0", borderBottom: 0 }}><Icon name="plus" size={16}/></button>
                                    <button type="button" className="btn btn-icon" style={{ borderRadius: "0 0 10px 10px" }}><Icon name="close" size={14}/></button>
                                </div>
                            </div>
                        </div>

                        <aside className="results-pane">
                            {detailCoupon ? (
                                <CouponDetailView
                                    c={detailCoupon}
                                    isFav={favorites.has(detailCoupon.id)}
                                    isReserved={reserved.has(detailCoupon.id)}
                                    onToggleFav={() => toggleFav(detailCoupon.id)}
                                    onReserve={() => reserve(detailCoupon.id)}
                                    onBack={() => setDetailCoupon(null)}
                                    realDist={realDist(detailCoupon)}
                                    realWalk={realWalk(detailCoupon)}
                                />
                            ) : (<>
                                <div className="results-head">
                                    <div>
                                        <div className="eyebrow">{showFavorites ? "Tus guardados" : `Radio: ${radius === Infinity ? "Lima completa" : radius >= 1000 ? `${radius/1000}km` : `${radius}m`}`}</div>
                                        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>
                                            {filtered.length} cupone{filtered.length !== 1 ? "s" : ""}{showFavorites ? " guardados" : " cercanos"}
                                        </div>
                                    </div>
                                </div>

                                {!showFavorites && (
                                    <div style={{ borderBottom: "1px solid var(--line)" }}>
                                        <div className="results-sort" style={{ flexWrap: "nowrap", overflowX: "auto", borderBottom: "1px solid var(--line)" }}>
                                            <span style={{ fontSize: 10, color: "var(--ink-3)", flexShrink: 0, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", paddingRight: 2 }}>Radio</span>
                                            {RADIUS_OPTIONS.map(o => (
                                                <button type="button" key={o.label}
                                                        className={"chip" + (radius === o.value ? " active" : "")}
                                                        style={{ fontSize: 11, padding: "3px 9px", flexShrink: 0 }}
                                                        onClick={() => setRadius(o.value)}>
                                                    {o.label}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="results-sort" style={{ flexWrap: "nowrap", overflowX: "auto" }}>
                                            <span style={{ fontSize: 10, color: "var(--ink-3)", flexShrink: 0, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", paddingRight: 2 }}>Orden</span>
                                            {SORT_OPTIONS.map(o => (
                                                <button type="button" key={o.id}
                                                        className={"chip" + (sortBy === o.id ? " active" : "")}
                                                        style={{ fontSize: 11, padding: "3px 9px", flexShrink: 0 }}
                                                        onClick={() => setSortBy(o.id)}>
                                                    {o.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="results-list">
                                    {filtered.length === 0 ? (
                                        <div style={{ padding: "36px 24px", textAlign: "center" }}>
                                            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-sunken)", display: "grid", placeItems: "center", margin: "0 auto 14px", color: "var(--ink-3)" }}>
                                                <Icon name="location" size={24}/>
                                            </div>
                                            {showFavorites ? (
                                                <>
                                                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Aún no tienes guardados</div>
                                                    <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
                                                        Explora el mapa y guarda los cupones que más te interesen.
                                                    </div>
                                                    <button type="button" className="btn btn-brand btn-sm" style={{ marginTop: 14 }} onClick={() => setTab("map")}>
                                                        Explorar cupones <Icon name="arrowRight" size={13}/>
                                                    </button>
                                                </>
                                            ) : emptyByRadius ? (
                                                <>
                                                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Sin ofertas en este radio</div>
                                                    <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
                                                        No hay cupones{activeCategory !== "all" ? ` de "${CATEGORIES.find(c => c.id === activeCategory)?.label}"` : ""} en un radio de {radius >= 1000 ? `${radius/1000}km` : `${radius}m`} cerca de <strong>{userLocation.name}</strong>.
                                                    </div>
                                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 14 }}>
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
                                                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No hay resultados</div>
                                                    <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                                                        Prueba con otra categoría o ajusta el radio de búsqueda.
                                                    </div>
                                                    <button type="button" className="btn btn-sm" style={{ marginTop: 14 }} onClick={() => { setActiveCategory("all"); setRadius(Infinity); }}>
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
                                                        onClick={() => setDetailCoupon(c)}
                                                        isSelected={detailCoupon !== null && detailCoupon.id === c.id}
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

            <BottomNav tab={tab} setTab={setTab} favCount={favorites.size}/>

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