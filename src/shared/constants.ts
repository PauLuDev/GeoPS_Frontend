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


export const PERU_AREA_CODES: Record<string, string> = {
    "Lima": "1", "Callao": "1",
    "Arequipa": "54",
    "La Libertad": "44",
    "Lambayeque": "74",
    "Piura": "73",
    "Cusco": "84",
    "Junín": "64",
    "Ica": "56",
    "Tacna": "52",
    "Cajamarca": "76",
    "Áncash": "43",
    "Puno": "51",
    "Moquegua": "53",
    "Loreto": "65",
    "San Martín": "42",
    "Ucayali": "61",
    "Huánuco": "62",
    "Pasco": "63",
    "Apurímac": "83",
    "Ayacucho": "66",
    "Huancavelica": "67",
    "Tumbes": "72",
    "Amazonas": "41",
};

export const DEFAULT_AREA_CODE = "1";

export function areaCodeForRegion(region?: string): string {
    return (region && PERU_AREA_CODES[region]) || DEFAULT_AREA_CODE;
}
