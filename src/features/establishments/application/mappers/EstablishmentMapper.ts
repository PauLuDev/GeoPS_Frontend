import { Business, BusinessHours } from "@/shared/types.ts";
import {
    EstablishmentResource,
    CreateEstablishmentResource,
    UpdateEstablishmentResource,
} from "../dtos/EstablishmentResource.ts";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/**
 * DTO -> entidad de dominio Business
 */
export function toBusiness(r: EstablishmentResource): Business {
    const open  = (r.openingTime  ?? "09:00:00").slice(0, 5);
    const close = (r.closingTime ?? "20:00:00").slice(0, 5);
    const hours: BusinessHours[] = DAYS.map(day => ({ day, open, close, closed: false }));

    return {
        id: r.id,
        ruc: r.ruc,
        name: r.name,
        address: r.address,
        district: "",
        category: r.categories[0]?.name ?? "",
        categoryId: r.categories[0]?.id,
        description: "",
        rating: 0,
        totalReviews: 0,
        hours,
        lat: r.latitude,
        lng: r.longitude,
    };
}

/* el id de categoria elegido en el form, o vacio si no hay */
function categoryIdsOf(b: Business): number[] {
    return b.categoryId != null ? [b.categoryId] : [];
}

/* entidad -> body de creacion */
export function toCreateEstablishmentResource(b: Business): CreateEstablishmentResource {
    const { openingTime, closingTime } = firstOpenHours(b.hours);
    return {
        name: b.name,
        ruc: b.ruc,
        address: b.address,
        openingTime,
        closingTime,
        latitude: b.lat,
        longitude: b.lng,
        categoryIds: categoryIdsOf(b),
    };
}

/* entidad -> body de edicion (sin ruc) */
export function toUpdateEstablishmentResource(b: Business): UpdateEstablishmentResource {
    const { openingTime, closingTime } = firstOpenHours(b.hours);
    return {
        name: b.name,
        address: b.address,
        openingTime,
        closingTime,
        latitude: b.lat,
        longitude: b.lng,
        categoryIds: categoryIdsOf(b),
    };
}

/* toma el primer dia abierto como horario unico */
function firstOpenHours(hours: BusinessHours[]): { openingTime: string; closingTime: string } {
    const day = hours.find(h => !h.closed) ?? hours[0];
    return {
        openingTime: day ? `${day.open}:00` : "09:00:00",
        closingTime: day ? `${day.close}:00` : "20:00:00",
    };
}