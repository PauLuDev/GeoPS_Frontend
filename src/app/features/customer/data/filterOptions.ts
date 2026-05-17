import { UserLocation } from "../../../core/common/types";

export const DEFAULT_LOCATION: UserLocation = { lat: -12.1211, lng: -77.0297, name: "Miraflores", source: "default" };

export const RADIUS_OPTIONS = [
    { label: "1km",  value: 1000 },
    { label: "3km",  value: 3000 },
    { label: "5km",  value: 5000 },
    { label: "10km", value: 10000 },
    { label: "Lima", value: Infinity },
];

export const SORT_OPTIONS = [
    { id: "distance", label: "Más cerca" },
    { id: "discount", label: "Mayor descuento" },
    { id: "expiry",   label: "Por vencer" },
    { id: "featured", label: "Destacados" },
];