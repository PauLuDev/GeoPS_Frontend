import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { BottomNav } from "../components/BottomNav.tsx";
import { Coupon, UserLocation } from "@/shared/types.ts";
import { DEFAULT_LOCATION } from "@/features/geolocation/domain/value-objects/defaultLocation.ts";
import { RADIUS_OPTIONS, SORT_OPTIONS } from "@/features/coupons/domain/value-objects/filterConfig.ts";
import { haversine, parseDiscount, parseExpiry, radiusToZoom } from "@/shared/utils/mapUtils.ts";
import { establishmentApi } from "@/features/establishments/infrastructure/api/establishmentApi.ts";
import { CategoryResource } from "@/features/establishments/application/dtos/EstablishmentResource.ts";
import { CustomerTopbar } from "../components/CustomerTopbar.tsx";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { CouponCard } from "@/features/coupons/presentation/components/CouponCard.tsx";
import { FilterDropdown } from "@/features/coupons/presentation/components/FilterDropdown.tsx";
import { CategoriesView } from "@/features/coupons/presentation/views/CategoriesView.tsx";
import { ProfileView } from "@/features/coupons/presentation/views/ProfileView.tsx";
import { LocationModal } from "@/features/geolocation/presentation/components/LocationModal.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { CouponDetailView } from "@/features/coupons/presentation/components/CouponDetailView.tsx";
import { BusinessDetailView } from "@/features/coupons/presentation/components/BusinessDetailView.tsx";
import { GeoMap, type MapApi } from "@/features/geolocation/presentation/components/OSMMap.tsx";
import { Business } from "@/shared/types.ts";
import { useNearbyCoupons } from "@/features/coupons/presentation/hooks/useNearbyCoupons.ts";
import { useReservations } from "@/features/coupons/presentation/hooks/useReservations.ts";
import { getCurrentUser } from "@/features/auth/application/session.ts";
import { useProfile } from "@/features/auth/presentation/hooks/useProfile.ts";
import { analyticsApi } from "@/features/analytics/infrastructure/api/analyticsApi.ts";

/* anclajes de la hoja deslizable movil -> fraccion del alto que baja el panel */
const SHEET_SNAPS = { peek: 0.82, half: 0.46, full: 0.06 } as const;
type SheetSnap = keyof typeof SHEET_SNAPS;

/* el back necesita UUIDs reales; evitamos mandar ids stub o vacios */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const asUuid = (v?: string): string | undefined => (v && UUID_RE.test(v) ? v : undefined);

/* arma un nombre legible calle + distrito desde la respuesta de nominatim */
function placeNameFromAddress(a: Record<string, string> | undefined): string {
    if (!a) return "";
    const road = a.road || a.pedestrian || a.footway || a.residential || "";
    const district = a.suburb || a.city_district || a.district || a.city || a.town || a.village || "";
    if (road && district) return `${road}, ${district}`;
    return road || district || "";
}

/* local de respaldo cuando el cupon no trae su establecimiento resuelto */
function stubBusiness(c: Coupon): Business {
    return {
        id: `b-stub-${c.id}`,
        ruc: "No disponible",
        name: c.brand,
        address: c.address,
        district: c.address.split(",").pop()?.trim() ?? "Lima",
        category: c.category,
        description: "",
        rating: c.rating,
        totalReviews: c.reviews,
        lat: c.lat,
        lng: c.lng,
        hours: [],
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
    /* perfil compartido (nombre/foto) para el topbar y la vista de perfil */
    const { profile, setProfile } = useProfile();
    const { reservedIds, statusByCoupon, reserve, codeFor, reservations, hasBeenReservedBefore } = useReservations(me?.id ?? "");
    /* radio de la pestaña "Cupones": por defecto Lima (todos), filtra por distancia */
    const [savedRadius, setSavedRadius] = useState(Infinity);

    /* Categorías reales para los chips de filtro */
    const [categories, setCategories] = useState<CategoryResource[]>([]);
    useEffect(() => {
        establishmentApi.listCategories().then(setCategories).catch(() => setCategories([]));
    }, []);

    /* al abrir el detalle de un cupon -> registra la vista (VIEW) en analytics.
       fire-and-forget: si falla no afecta la UI */
    useEffect(() => {
        const establishmentId = asUuid(detailCoupon?.establishmentId);
        if (!detailCoupon || !establishmentId) return;
        void analyticsApi.recordCouponView({
            couponId: detailCoupon.id,
            establishmentId,
            campaignId: asUuid(detailCoupon.campaignId),
            userId: asUuid(me?.id),
            latitude: detailCoupon.lat,
            longitude: detailCoupon.lng,
        }).catch(() => {});
    }, [detailCoupon, me?.id]);

    const [search, setSearch] = useState("");
    const [userLocation, setUserLocation] = useState<UserLocation>(() => {
        try {
            const raw = localStorage.getItem("geops_location");
            return raw ? (JSON.parse(raw) as UserLocation) : DEFAULT_LOCATION;
        } catch {
            return DEFAULT_LOCATION;
        }
    });
    /* viewCenter es lo que mueve el mapa y filtra cupones. userLocation queda anclada al GPS real */
    const [viewCenter, setViewCenter] = useState<UserLocation>(() => {
        try {
            const raw = localStorage.getItem("geops_viewcenter");
            if (raw) return JSON.parse(raw) as UserLocation;
            const u = localStorage.getItem("geops_location");
            return u ? (JSON.parse(u) as UserLocation) : DEFAULT_LOCATION;
        } catch {
            return DEFAULT_LOCATION;
        }
    });
    const [radius, setRadius] = useState(100);
    const [sortBy, setSortBy] = useState("distance");
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showWelcomePrompt, setShowWelcomePrompt] = useState(false);
    const [pickingOnMap, setPickingOnMap] = useState(false);
    const [pickedPoint, setPickedPoint] = useState<{ lat: number; lng: number; name: string } | null>(null);
    /* centro del mapa mientras se marca punto (modo marcador-centrado) + su direccion resuelta */
    const [pickCenter, setPickCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [pickCenterName, setPickCenterName] = useState<string | null>(null);
    /* Permiso real de compartir ubicación: alimenta el dot del usuario y el switch del perfil */
    const [shareLocation, setShareLocation] = useState<boolean>(() => {
        try {
            const raw = localStorage.getItem("geops_prefs");
            if (raw) return !!JSON.parse(raw).shareLocation;
        } catch { /* ignore */ }
        return false;
    });
    const persistShareLocation = (val: boolean) => {
        setShareLocation(val);
        try {
            const raw = localStorage.getItem("geops_prefs");
            const prefs = raw ? JSON.parse(raw) : {};
            prefs.shareLocation = val;
            localStorage.setItem("geops_prefs", JSON.stringify(prefs));
        } catch { /* ignore */ }
    };

    /* Pide GPS y, según la respuesta, prende/apaga shareLocation. Devuelve true si se concedió. */
    const requestGpsAndSync = (silent = false): Promise<boolean> => {
        /* Solo en peticiones explícitas (no el sync silencioso del init) quitamos la protección manual */
        if (!silent) hasManualSelectionRef.current = false;
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                persistShareLocation(false);
                if (!silent && !localStorage.getItem("geops_viewcenter")) setShowLocationModal(true);
                resolve(false);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    let districtName = t("location.currentLocation", { defaultValue: "Ubicación actual" });
                    try {
                        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es`);
                        const data = await r.json();
                        districtName = placeNameFromAddress(data?.address) || districtName;
                    } catch { /* ignore */ }
                    const newLoc: UserLocation = { lat, lng, name: districtName, source: "gps" };
                    setUserLocation(newLoc);
                    try { localStorage.setItem("geops_location", JSON.stringify(newLoc)); } catch { /* ignore */ }
                    /* Solo actualiza viewCenter si el usuario NO seleccionó algo manualmente mientras esperaba el GPS */
                    if (!hasManualSelectionRef.current) {
                        setViewCenter(newLoc);
                        try { localStorage.setItem("geops_viewcenter", JSON.stringify(newLoc)); } catch { /* ignore */ }
                    }
                    persistShareLocation(true);
                    setShowLocationModal(false);
                    resolve(true);
                },
                () => {
                    persistShareLocation(false);
                    if (!silent && !localStorage.getItem("geops_viewcenter")) setShowLocationModal(true);
                    resolve(false);
                }
            );
        });
    };

    /* Handlers del prompt de bienvenida */
    const handleWelcomeGps = async () => {
        setShowWelcomePrompt(false);
        await requestGpsAndSync();
    };
    const handleWelcomeManual = () => {
        setShowWelcomePrompt(false);
        setShowLocationModal(true);
    };

    // FLUJO DE BIENVENIDA: usa la Permissions API en lugar de un flag localStorage
    useEffect(() => {
        const init = async () => {
            let permState: PermissionState = "prompt";
            try {
                const status = await navigator.permissions.query({ name: "geolocation" });
                permState = status.state;
            } catch { /* browser no soporta permissions API */ }

            const hasViewCenter = !!localStorage.getItem("geops_viewcenter");

            if (permState === "denied") {
                /* GPS bloqueado por el usuario en el navegador */
                persistShareLocation(false);
                if (!hasViewCenter) setShowLocationModal(true);
            } else if (permState === "granted" && shareLocation) {
                /* Permiso ya concedido y usuario quería compartir → refrescar GPS silenciosamente */
                requestGpsAndSync(true);
            } else if (permState === "prompt") {
                /* Permiso no decidido todavía → mostrar nuestro propio modal de bienvenida */
                setShowWelcomePrompt(true);
            } else if (!hasViewCenter) {
                /* GPS concedido pero sharing apagado, y sin ubicación guardada */
                setShowLocationModal(true);
            }
        };
        init().catch(() => {
            if (!localStorage.getItem("geops_viewcenter")) setShowLocationModal(true);
        });
    }, []);

    /* cupones cerca del centro de exploración (no del usuario), armados juntando varias fuentes */
    /* en la pestaña Cupones traemos con el radio propio (default Lima) para que se
       carguen los cupones reservados aunque esten lejos; en el mapa usa su radio */
    const fetchRadius = tab === "saved" ? savedRadius : radius;
    const { coupons, resolveBusiness, loading: couponsLoading } = useNearbyCoupons(viewCenter.lat, viewCenter.lng, fetchRadius);
    const openBusiness = (c: Coupon): Business => resolveBusiness(c.brand, stubBusiness(c));
    const [showFilter, setShowFilter] = useState("all"); 
    const [panelCollapsed, setPanelCollapsed] = useState(false);
    const { t } = useTranslation();
    const showSaved = tab === "saved";
    const radiusText = radius === Infinity ? t("map.radiusFull") : radius >= 1000 ? `${radius / 1000}km` : `${radius}m`;

    const selectTab = (t: string) => {
        if (t === "saved") setActiveCategory("all");
        setDetailCoupon(null);
        setDetailBusiness(null);
        setActivePinId(undefined);
        setTab(t);
    };

    const realDist = (c: Coupon) => Math.round(haversine(viewCenter.lat, viewCenter.lng, c.lat, c.lng));
    const realWalk = (c: Coupon) => Math.round(realDist(c) / 80);

    /* Lista plana filtrada de cupones */
    const filtered = useMemo(() => {
        /* el mapa usa su radio; la pestaña Cupones usa su propio radio (savedRadius) */
        const r = showSaved ? savedRadius : (radius === Infinity ? Infinity : radius);
        const list = coupons.filter((c) => {
            if (activeCategory !== "all" && c.category !== activeCategory) return false;
            if (search && !`${c.brand} ${c.title}`.toLowerCase().includes(search.toLowerCase())) return false;
            if (showSaved && !reservedIds.has(c.id)) return false;
            if (r !== Infinity && haversine(viewCenter.lat, viewCenter.lng, c.lat, c.lng) > r) return false;
            return true;
        });
        /* reservas de un cupon = stock original - stock actual */
        const reservedCount = (c: Coupon) => (c.totalStock ?? 0) - (c.stock ?? 0);
        return list.sort((a, b) => {
            /* MOSTRAR prioriza: Top = mejor calificacion, Mas populares = mas reservas */
            if (!showSaved && showFilter === "top") return b.rating - a.rating;
            if (!showSaved && showFilter === "popular") return reservedCount(b) - reservedCount(a);
            if (sortBy === "discount") return parseDiscount(b.discount) - parseDiscount(a.discount);
            if (sortBy === "expiry") return parseExpiry(a.expiresIn) - parseExpiry(b.expiresIn);
            if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
            return haversine(viewCenter.lat, viewCenter.lng, a.lat, a.lng) - haversine(viewCenter.lat, viewCenter.lng, b.lat, b.lng);
        });
    }, [coupons, activeCategory, search, showSaved, reservedIds, viewCenter, radius, savedRadius, sortBy, showFilter]);

    /* pestaña "Cupones": separa reservados de redimidos */
    const savedGroups = useMemo(() => ({
        reserved: filtered.filter(c => statusByCoupon.get(c.id) !== "REDEEMED"),
        redeemed: filtered.filter(c => statusByCoupon.get(c.id) === "REDEEMED"),
    }), [filtered, statusByCoupon]);

    /* render de una card de cupon (reusada en el mapa y en la pestaña Cupones) */
    const renderCouponCard = (c: Coupon) => (
        <CouponCard
            key={c.id}
            c={c}
            isReserved={reservedIds.has(c.id)}
            isRedeemed={statusByCoupon.get(c.id) === "REDEEMED"}
            onToggleSaved={() => {}}
            onClick={() => { setDetailCoupon(c); setActivePinId(`est-${c.brand}`); setDetailBusiness(null); }}
            isSelected={activePinId === `est-${c.brand}`}
            realDist={realDist(c)}
            realWalk={realWalk(c)}
        />
    );

    /* 🌟 AGRUPACIÓN COMPLETA: Transforma cupones sueltos en Establecimientos con sub-cupones */
    const establishmentPins = useMemo(() => {
        const groups: Record<string, any> = {};

        filtered.forEach((c) => {
            const key = c.brand; 
            if (!groups[key]) {
                groups[key] = {
                    id: `est-${key}`,
                    lat: c.lat,
                    lng: c.lng,
                    brand: c.brand,
                    featured: false,
                    coupons: [],
                };
            }
            groups[key].coupons.push(c);
            if (c.featured) groups[key].featured = true;
        });

        return Object.values(groups).map((g: any) => ({
            id: g.id,
            lat: g.lat,
            lng: g.lng,
            featured: g.featured,
            discount: `${g.coupons.length}`, // Enviamos la cantidad de campañas vigentes en vez del %
            isEstablishment: true,
            coupons: g.coupons,
        }));
    }, [filtered]);

    const countWithoutRadius = useMemo(() => {
        return coupons.filter((c) => {
            if (activeCategory !== "all" && c.category !== activeCategory) return false;
            if (search && !`${c.brand} ${c.title}`.toLowerCase().includes(search.toLowerCase())) return false;
            if (showSaved && !reservedIds.has(c.id)) return false;
            return true;
        }).length;
    }, [coupons, activeCategory, search, showSaved, reservedIds]);

    const emptyByRadius = filtered.length === 0 && countWithoutRadius > 0;

    const handleReserve = async (id: string) => {
        await reserve(id);
    };

    const handleSelectLocation = (loc: UserLocation) => {
        /* GPS = ubicación real → mueve userLocation y viewCenter. Manual = solo explora → solo mueve el mapa */
        if (loc.source === "gps") {
            setUserLocation(loc);
            try { localStorage.setItem("geops_location", JSON.stringify(loc)); } catch { /* ignore */ }
        } else {
            /* Selección manual: protege viewCenter de ser sobreescrito por callback GPS pendiente */
            hasManualSelectionRef.current = true;
        }
        /* Limpia el pin manual anterior si el usuario elige por texto/sugerencia */
        setPickedPoint(null);
        setPickingOnMap(false);
        setPickCenter(null);
        setPickCenterName(null);
        setViewCenter(loc);
        try { localStorage.setItem("geops_viewcenter", JSON.stringify(loc)); } catch { /* ignore */ }
        setShowLocationModal(false);
    };

    const startPickOnMap = () => {
        setShowLocationModal(false);
        setPickedPoint(null);
        setPickCenter({ lat: viewCenter.lat, lng: viewCenter.lng });
        setPickCenterName(viewCenter.name || null);
        setPickingOnMap(true);
    };

    /* el mapa reporta su centro al dejar de moverse -> lo guardamos y marcamos "resolviendo" */
    const handlePickCenterChange = (lat: number, lng: number) => {
        setPickCenter({ lat, lng });
        setPickCenterName(null);
    };

    /* confirma el punto bajo el pin central (boton "Listo") */
    const confirmPickOnMap = () => {
        const c = pickCenter;
        if (!c) return;
        const knownName = pickCenterName;
        const loc: UserLocation = { lat: c.lat, lng: c.lng, name: knownName || t("location.mapPoint", { defaultValue: "Punto en el mapa" }), source: "manual" };
        hasManualSelectionRef.current = true;
        setViewCenter(loc);
        try { localStorage.setItem("geops_viewcenter", JSON.stringify(loc)); } catch { /* ignore */ }
        setPickingOnMap(false);
        setPickCenter(null);
        setPickCenterName(null);
        setPickedPoint(null);
        /* si aun no teniamos la direccion resuelta, la buscamos en segundo plano */
        if (!knownName) {
            (async () => {
                try {
                    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${c.lat}&lon=${c.lng}&accept-language=es`);
                    const data = await r.json();
                    const name = placeNameFromAddress(data?.address);
                    if (name) {
                        const namedLoc: UserLocation = { lat: c.lat, lng: c.lng, name, source: "manual" };
                        setViewCenter(namedLoc);
                        try { localStorage.setItem("geops_viewcenter", JSON.stringify(namedLoc)); } catch { /* ignore */ }
                    }
                } catch { /* ignore */ }
            })();
        }
    };

    const cancelPickOnMap = () => {
        setPickingOnMap(false);
        setPickedPoint(null);
        setPickCenter(null);
        setPickCenterName(null);
    };

    /* reverse-geocode con debounce del centro mientras se marca punto -> alimenta la burbuja */
    const pickGeoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (!pickingOnMap || !pickCenter) return;
        const { lat, lng } = pickCenter;
        const controller = new AbortController();
        if (pickGeoTimerRef.current) clearTimeout(pickGeoTimerRef.current);
        pickGeoTimerRef.current = setTimeout(async () => {
            try {
                const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es`, { signal: controller.signal });
                const data = await r.json();
                const name = placeNameFromAddress(data?.address);
                if (name) setPickCenterName(name);
            } catch { /* ignore */ }
        }, 450);
        return () => {
            if (pickGeoTimerRef.current) clearTimeout(pickGeoTimerRef.current);
            controller.abort();
        };
    }, [pickCenter?.lat, pickCenter?.lng, pickingOnMap]);

    /* volver a mi / quitar marcador -> si hay ubicacion real vuelve a ella; si no, abre el selector para elegir zona */
    const returnToMe = () => {
        setPickedPoint(null);
        setPickingOnMap(false);
        setPickCenter(null);
        setPickCenterName(null);
        if (shareLocation && userLocation.source === "gps") {
            hasManualSelectionRef.current = false;
            setViewCenter(userLocation);
            try { localStorage.setItem("geops_viewcenter", JSON.stringify(userLocation)); } catch { /* ignore */ }
        } else {
            setShowLocationModal(true);
        }
    };

    const mapApiRef = useRef<MapApi | null>(null);
    /* Inicializado según la fuente del viewCenter guardado: si el usuario eligió manual antes, protegemos de GPS */
    const hasManualSelectionRef = useRef(viewCenter.source === "manual");

    /* mantiene el nombre del centro (chip de arriba + hud) al dia -> calle/distrito reales de la api */
    const lastGeocodeRef = useRef("");
    useEffect(() => {
        const key = `${viewCenter.lat.toFixed(5)},${viewCenter.lng.toFixed(5)}`;
        if (lastGeocodeRef.current === key) return;
        lastGeocodeRef.current = key;
        let cancelled = false;
        (async () => {
            try {
                const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${viewCenter.lat}&lon=${viewCenter.lng}&accept-language=es`);
                const data = await r.json();
                if (cancelled) return;
                const name = placeNameFromAddress(data?.address);
                if (!name) return;
                setViewCenter((prev) => {
                    if (prev.name === name) return prev;
                    const next = { ...prev, name };
                    try { localStorage.setItem("geops_viewcenter", JSON.stringify(next)); } catch { /* ignore */ }
                    return next;
                });
            } catch { /* ignore */ }
        })();
        return () => { cancelled = true; };
    }, [viewCenter.lat, viewCenter.lng]);

    /* Cuando se cierra el modal o se cambia de modo, fuerza al mapa a recalcular tamaño + redibujar tiles */
    useEffect(() => {
        const t1 = setTimeout(() => mapApiRef.current?.invalidate(), 60);
        const t2 = setTimeout(() => mapApiRef.current?.invalidate(), 250);
        const t3 = setTimeout(() => mapApiRef.current?.invalidate(), 600);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [showLocationModal, pickingOnMap, panelCollapsed]);

    /* Botón "centrar": vuelve la camara al punto activo de busqueda (el que elegiste o tu gps) */
    const handleCenter = () => {
        /* centrar en el punto activo -> siempre acerca a nivel ~100 m (zoom 17), sin importar el radio del filtro */
        mapApiRef.current?.flyTo(viewCenter.lat, viewCenter.lng, radiusToZoom(100));
    };
    const handleZoomIn = () => mapApiRef.current?.zoomIn();
    const handleZoomOut = () => mapApiRef.current?.zoomOut();

    const isExploring = viewCenter.lat !== userLocation.lat || viewCenter.lng !== userLocation.lng;
    const hudCoords = `${viewCenter.lat.toFixed(4)}, ${viewCenter.lng.toFixed(4)}`;

    /* ---------- hoja deslizable del panel de cupones (solo movil) ---------- */
    const shellRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== "undefined" && window.matchMedia("(max-width: 980px)").matches
    );
    const [shellH, setShellH] = useState(0);
    const [sheetSnap, setSheetSnap] = useState<SheetSnap>("half");
    const [dragY, setDragY] = useState<number | null>(null);
    const dragRef = useRef<{ startY: number; base: number } | null>(null);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 980px)");
        const sync = () => setIsMobile(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    /* medimos el alto del contenedor -> convertir los anclajes a pixeles */
    useEffect(() => {
        const el = shellRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setShellH(el.clientHeight));
        ro.observe(el);
        setShellH(el.clientHeight);
        return () => ro.disconnect();
    }, []);

    /* al abrir un detalle en movil -> subir el panel para leerlo completo */
    useEffect(() => {
        if (isMobile && (detailCoupon || detailBusiness)) setSheetSnap("full");
    }, [detailCoupon, detailBusiness, isMobile]);

    const snapPx = (s: SheetSnap) => SHEET_SNAPS[s] * shellH;
    const sheetTranslate = dragY != null ? dragY : snapPx(sheetSnap);
    const sheetStyle = isMobile && shellH > 0
        ? { transform: `translateY(${sheetTranslate}px)`, transition: dragY != null ? "none" : undefined }
        : undefined;

    const onSheetDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (!isMobile) return;
        dragRef.current = { startY: e.clientY, base: snapPx(sheetSnap) };
        setDragY(snapPx(sheetSnap));
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onSheetMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        const y = dragRef.current.base + (e.clientY - dragRef.current.startY);
        setDragY(Math.max(snapPx("full"), Math.min(snapPx("peek"), y)));
    };
    const onSheetUp = () => {
        if (!dragRef.current) return;
        const base = dragRef.current.base;
        const y = dragY ?? base;
        if (Math.abs(y - base) < 8) {
            /* tap -> alterna entre expandido y medio */
            setSheetSnap((s) => (s === "full" ? "half" : "full"));
        } else {
            const nearest = (Object.keys(SHEET_SNAPS) as SheetSnap[])
                .reduce((a, b) => (Math.abs(snapPx(b) - y) < Math.abs(snapPx(a) - y) ? b : a));
            setSheetSnap(nearest);
        }
        setDragY(null);
        dragRef.current = null;
    };
    /* se puede arrastrar desde el asa o desde toda la cabecera del panel */
    const sheetDragHandlers = {
        onPointerDown: onSheetDown,
        onPointerMove: onSheetMove,
        onPointerUp: onSheetUp,
        onPointerCancel: onSheetUp,
    };

    return (
        <div className="customer-app">
            <CustomerTopbar
                onProfileClick={() => setTab("profile")}
                onSignOut={onSignOut}
                locationName={viewCenter.name}
                onLocationClick={() => setShowLocationModal(true)}
                profile={profile}
            />

            <div ref={shellRef} className={"map-shell" + (tab === "map" || tab === "saved" ? "" : " stacked") + (panelCollapsed ? " panel-collapsed" : "")}>
                {(tab === "map" || tab === "saved") && (
                    <>
                        <div className={"map-area" + (pickingOnMap ? " picking" : "")}>
                            <GeoMap
                                engine={mapEngine}
                                theme={theme}
                                pins={showLocationModal ? [] : establishmentPins}
                                activePin={activePinId}
                                onPinClick={(p) => {
                                    const estPin = p as any;
                                    setActivePinId(estPin.id);
                                    if (estPin.coupons && estPin.coupons.length > 0) {
                                        setDetailBusiness(openBusiness(estPin.coupons[0]));
                                        setDetailCoupon(null);
                                    }
                                }}
                                userPos={{ x: 520, y: 400 }}
                                userCoord={shareLocation && !isExploring ? userLocation : undefined}
                                centerCoord={viewCenter}
                                searchCenter={isExploring && !pickingOnMap && !pickedPoint ? viewCenter : null}
                                zoom={radiusToZoom(radius)}
                                pickingOnMap={pickingOnMap}
                                pickedCoord={pickedPoint}
                                onPickCenterChange={handlePickCenterChange}
                                pickCenterLabel={pickingOnMap ? (pickCenterName ?? t("map.pickResolving", { defaultValue: "Buscando dirección…" })) : null}
                                onMapReady={(api) => { mapApiRef.current = api; }}
                            />

                            {pickingOnMap && (
                                <>
                                    <button
                                        type="button"
                                        className="pick-back-btn"
                                        onClick={cancelPickOnMap}
                                        aria-label={t("common.cancel", { defaultValue: "Cancelar" })}
                                    >
                                        <Icon name="arrowLeft" size={20}/>
                                    </button>
                                    <div className="map-pick-confirm">
                                        <span className="pick-confirm-hint">
                                            {t("map.pickHint", { defaultValue: "Mueve el mapa para ubicar tu punto" })}
                                        </span>
                                        <button type="button" className="btn btn-brand btn-sm" onClick={confirmPickOnMap}>
                                            <Icon name="check" size={14}/>
                                            {t("common.done", { defaultValue: "Listo" })}
                                        </button>
                                    </div>
                                </>
                            )}

                            <div className="map-controls fade-up">
                                <div className="search-wrap">
                                    <Icon name="search" size={16} />
                                    <input
                                        className="search-input"
                                        aria-label={t("map.searchAria")}
                                        placeholder={t("map.searchPlaceholder")}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    {search && (
                                        <button type="button" className="map-search-clear" onClick={() => setSearch("")}>
                                            <Icon name="close" size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="cat-row">
                                    <button
                                        type="button"
                                        className={"chip " + (activeCategory === "all" ? "active" : "")}
                                        onClick={() => setActiveCategory("all")}
                                    >
                                        <Icon name="grid" size={14} />
                                        {t("cat.all")}
                                        <span className="mono chip-count">{coupons.length}</span>
                                    </button>
                                    {categories.map((cat) => {
                                        const count = coupons.filter((c) => c.category === cat.name).length;
                                        return (
                                            <button
                                                type="button"
                                                key={cat.id}
                                                className={"chip " + (activeCategory === cat.name ? "active" : "")}
                                                onClick={() => setActiveCategory(cat.name)}
                                            >
                                                <Icon name="store" size={14} />
                                                {cat.name}
                                                <span className="mono chip-count">{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="map-hud">
                                <div className={"hud-dot" + (shareLocation && !isExploring && userLocation.source === "gps" ? " gps" : "")} />
                                <span className="mono hud-coords">{hudCoords}</span>
                                <span className="hud-sep">·</span>
                                <span className="hud-name">{viewCenter.name}</span>
                                {shareLocation && !isExploring && userLocation.source === "gps" && <span className="hud-gps-badge">GPS</span>}
                            </div>

                            <div className="map-tools">
                                <button
                                    type="button"
                                    className="btn btn-icon tip"
                                    data-tip={t("map.centerLocation")}
                                    onClick={handleCenter}
                                >
                                    <Icon name="navigation" size={16} />
                                </button>
                                <div className="zoom-stack">
                                    <button
                                        type="button"
                                        className="btn btn-icon zoom-btn-top tip"
                                        data-tip={t("map.zoomIn", { defaultValue: "Acercar" })}
                                        onClick={handleZoomIn}
                                    >
                                        <Icon name="plus" size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-icon zoom-btn-bot tip"
                                        data-tip={t("map.zoomOut", { defaultValue: "Alejar" })}
                                        onClick={handleZoomOut}
                                    >
                                        <Icon name="minus" size={14} />
                                    </button>
                                </div>
                                {(isExploring || pickingOnMap) && (
                                    <button
                                        type="button"
                                        className="btn btn-icon tip"
                                        data-tip={t("map.clearMarker", { defaultValue: "Quitar marcador" })}
                                        onClick={returnToMe}
                                    >
                                        <Icon name="close" size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <aside className="results-pane" style={sheetStyle}>
                            <div className="sheet-handle" {...sheetDragHandlers}>
                                <span className="sheet-grip" />
                            </div>
                            {detailBusiness ? (
                                <BusinessDetailView
                                    business={detailBusiness}
                                    coupons={coupons.filter((c) => c.brand === detailBusiness.name)}
                                    reserved={reservedIds}
                                    onToggleSaved={() => {}}
                                    onBack={() => {
                                        setDetailBusiness(null);
                                        setActivePinId(undefined);
                                    }}
                                    onViewCoupon={(c) => {
                                        setDetailCoupon(c);
                                        setDetailBusiness(null);
                                    }}
                                    realDist={realDist}
                                    realWalk={realWalk}
                                />
                            ) : detailCoupon ? (
                                <CouponDetailView
                                    c={detailCoupon}
                                    isReserved={reservedIds.has(detailCoupon.id)}
                                    hasBeenReservedBefore={hasBeenReservedBefore(detailCoupon.id)}
                                    onReserve={() => handleReserve(detailCoupon.id)}
                                    redemptionCode={codeFor(detailCoupon.id)}
                                    onBack={() => {
                                        setDetailCoupon(null);
                                        setActivePinId(undefined);
                                    }}
                                    onViewBusiness={() => setDetailBusiness(openBusiness(detailCoupon))}
                                    realDist={realDist(detailCoupon)}
                                    realWalk={realWalk(detailCoupon)}
                                />
                            ) : (
                                <>
                                    <div className="results-head sheet-grab" {...sheetDragHandlers}>
                                        <div>
                                            <div className="eyebrow">
                                                {showSaved ? t("map.yourCoupons") : t("map.radiusLabel", { value: radiusText })}
                                            </div>
                                            <div className="rp-count">
                                                {showSaved
                                                    ? t("map.countSaved", { count: filtered.length })
                                                    : t("map.countNear", { count: filtered.length })}
                                            </div>
                                        </div>
                                    </div>

                                    {!showSaved && (
                                        <div className="rp-filters">
                                            <div className="rp-filter-row">
                                                <FilterDropdown
                                                    label={t("map.radius")}
                                                    display={radius === Infinity ? t("map.radiusAll") : radiusText}
                                                    items={RADIUS_OPTIONS.map((o) => ({
                                                        key: o.label,
                                                        label: o.value === Infinity ? t("map.radiusAll") : o.label,
                                                        active: radius === o.value,
                                                        onSelect: () => setRadius(o.value),
                                                    }))}
                                                />
                                                <FilterDropdown
                                                    label={t("map.sort")}
                                                    display={t(`map.sortOpt.${sortBy}`)}
                                                    items={SORT_OPTIONS.map((o) => ({
                                                        key: o.id,
                                                        label: t(`map.sortOpt.${o.id}`),
                                                        active: sortBy === o.id,
                                                        onSelect: () => setSortBy(o.id),
                                                    }))}
                                                />
                                                <FilterDropdown
                                                    label={t("map.show")}
                                                    display={t(`map.showOpt.${showFilter}`)}
                                                    items={["all", "top", "popular"].map((id) => ({
                                                        key: id,
                                                        label: t(`map.showOpt.${id}`),
                                                        active: showFilter === id,
                                                        onSelect: () => setShowFilter(id),
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {showSaved && (
                                        <div className="rp-filters">
                                            <div className="rp-filter-row">
                                                <FilterDropdown
                                                    label={t("map.radius")}
                                                    display={savedRadius === Infinity ? t("map.radiusAll") : (savedRadius >= 1000 ? `${savedRadius / 1000}km` : `${savedRadius}m`)}
                                                    items={RADIUS_OPTIONS.map((o) => ({
                                                        key: o.label,
                                                        label: o.value === Infinity ? t("map.radiusAll") : o.label,
                                                        active: savedRadius === o.value,
                                                        onSelect: () => setSavedRadius(o.value),
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="results-list">
                                        {couponsLoading ? (
                                            <div className="rp-empty">
                                                <div className="rp-empty-icon">
                                                    <span className="rp-spinner" />
                                                </div>
                                                <div className="rp-empty-title">{t("map.loadingCoupons")}</div>
                                            </div>
                                        ) : filtered.length === 0 ? (
                                            <div className="rp-empty">
                                                <div className="rp-empty-icon">
                                                    <Icon name={showSaved ? "ticket" : "frown"} size={24} />
                                                </div>
                                                {showSaved ? (
                                                    <>
                                                        <div className="rp-empty-title">{t("map.emptySavedTitle")}</div>
                                                        <div className="rp-empty-text">{t("map.emptySavedText")}</div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-brand btn-sm rp-empty-cta"
                                                            onClick={() => setTab("map")}
                                                        >
                                                            {t("map.exploreCoupons")} <Icon name="arrowRight" size={13} />
                                                        </button>
                                                    </>
                                                ) : emptyByRadius ? (
                                                    <>
                                                        <div className="rp-empty-title">{t("map.emptyRadiusTitle")}</div>
                                                        <div className="rp-empty-text">
                                                            {t("map.emptyRadiusText", {
                                                                cat:
                                                                    activeCategory !== "all"
                                                                        ? t("map.emptyRadiusCat", { label: t(`cat.${activeCategory}`) })
                                                                        : "",
                                                                radius: radius >= 1000 ? `${radius / 1000}km` : `${radius}m`,
                                                                name: userLocation.name,
                                                            })}
                                                        </div>
                                                        <div className="rp-empty-actions">
                                                            <button
                                                                type="button"
                                                                className="btn btn-brand btn-sm"
                                                                onClick={() => setRadius(Infinity)}
                                                            >
                                                                {t("map.seeAllLima")} <Icon name="arrowRight" size={13} />
                                                            </button>
                                                            {activeCategory !== "all" && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm"
                                                                    onClick={() => setActiveCategory("all")}
                                                                >
                                                                    {t("map.removeFilter")}
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm"
                                                                onClick={() => setShowLocationModal(true)}
                                                            >
                                                                <Icon name="location" size={13} /> {t("map.changeZone")}
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="rp-empty-title">{t("map.noResultsTitle")}</div>
                                                        <div className="rp-empty-text">{t("map.noResultsText")}</div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm rp-empty-cta"
                                                            onClick={() => {
                                                                setActiveCategory("all");
                                                                setRadius(Infinity);
                                                            }}
                                                        >
                                                            {t("map.seeAllCoupons")}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ) : showSaved ? (
                                            <div className="rp-saved-groups">
                                                {savedGroups.reserved.length > 0 && (
                                                    <div className="rp-saved-group">
                                                        <div className="rp-saved-group-head">
                                                            {t("map.groupReserved", { defaultValue: "Reservados" })} <span className="rp-saved-count">{savedGroups.reserved.length}</span>
                                                        </div>
                                                        {savedGroups.reserved.map(renderCouponCard)}
                                                    </div>
                                                )}
                                                {savedGroups.redeemed.length > 0 && (
                                                    <div className="rp-saved-group">
                                                        <div className="rp-saved-group-head">
                                                            {t("map.groupRedeemed", { defaultValue: "Redimidos" })} <span className="rp-saved-count">{savedGroups.redeemed.length}</span>
                                                        </div>
                                                        {savedGroups.redeemed.map(renderCouponCard)}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            filtered.map(renderCouponCard)
                                        )}
                                    </div>
                                </>
                            )}
                        </aside>

                        <button
                            type="button"
                            className="panel-toggle"
                            onClick={() => setPanelCollapsed((c) => !c)}
                            aria-label={panelCollapsed ? t("map.panelExpand") : t("map.panelCollapse")}
                            title={panelCollapsed ? t("map.panelExpand") : t("map.panelCollapse")}
                        >
                            <Icon name="chevron" size={16} />
                        </button>
                    </>
                )}

                {tab === "categories" && (
                    <CategoriesView
                        coupons={coupons}
                        categories={categories}
                        radius={radius}
                        onRadiusChange={setRadius}
                        loading={couponsLoading}
                        onPick={(catName) => {
                            setActiveCategory(catName);
                            setTab("map");
                        }}
                        onOpenCoupon={(c) => {
                            setDetailCoupon(c);
                            setTab("map");
                        }}
                    />
                )}

                {tab === "profile" && (
                    <ProfileView
                        reservedCount={reservations.length}
                        reservedCoupons={coupons.filter((c) => reservedIds.has(c.id))}
                        profileData={profile}
                        onProfileSaved={setProfile}
                        theme={theme}
                        onThemeChange={onThemeChange}
                        onSignOut={onSignOut}
                        shareLocation={shareLocation}
                        onShareLocationChange={async (next) => {
                            if (next) {
                                /* encender → pedir permiso real */
                                await requestGpsAndSync(true);
                            } else {
                                persistShareLocation(false);
                            }
                        }}
                    />
                )}
            </div>

            <BottomNav tab={tab} setTab={selectTab} savedCount={reservations.length} />

            {showWelcomePrompt && (
                <Modal onClose={() => {}} ariaLabel={t("gps.welcomeTitle", { defaultValue: "¿Dónde estás?" })} className="lm-modal" dismissable={false}>
                    <div className="lm-header">
                        <div className="lm-header-top">
                            <div className="lm-title-row">
                                <div className="loc-icon">
                                    <Icon name="location" size={22}/>
                                </div>
                                <div>
                                    <div className="lm-title">{t("gps.welcomeTitle", { defaultValue: "¿Dónde estás?" })}</div>
                                    <div className="lm-subtitle">{t("gps.welcomeSubtitle", { defaultValue: "Para mostrarte cupones y ofertas cerca de ti." })}</div>
                                </div>
                            </div>
                        </div>
                        <button type="button" className="lm-gps-btn" onClick={handleWelcomeGps}>
                            <Icon name="location" size={16}/>
                            <span>{t("gps.welcomeAllow", { defaultValue: "Usar mi ubicación actual" })}</span>
                        </button>
                        <button type="button" className="lm-pick-btn" style={{ marginTop: 10 }} onClick={handleWelcomeManual}>
                            <Icon name="search" size={16}/>
                            <span>{t("gps.welcomeManual", { defaultValue: "Elegir ubicación manualmente" })}</span>
                        </button>
                    </div>
                </Modal>
            )}

            {showLocationModal && (
                <LocationModal
                    onSelect={handleSelectLocation}
                    onClose={() => setShowLocationModal(false)}
                    onPickOnMap={startPickOnMap}
                    onUseCurrentLocation={() => { void requestGpsAndSync(); }}
                    isFirst={viewCenter.source === "default"}
                    currentName={viewCenter.name}
                />
            )}
        </div>
    );
}