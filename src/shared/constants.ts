import { Category, UserCoord } from "./types";

/* categorias de negocio para los filtros del mapa */
export const CATEGORIES: Category[] = [
    { id: "all",      label: "Todo",      icon: "grid" },
    { id: "food",     label: "Comida",    icon: "food" },
    { id: "cafe",     label: "Café",      icon: "cafe" },
    { id: "shop",     label: "Tiendas",   icon: "cart" },
    { id: "health",   label: "Salud",     icon: "health" },
    { id: "services", label: "Servicios", icon: "sparkles" },
];

/* punto por defecto del mapa hasta que el usuario elija su ubicacion */
export const USER_COORD: UserCoord = { lat: -12.1211, lng: -77.0297 };
