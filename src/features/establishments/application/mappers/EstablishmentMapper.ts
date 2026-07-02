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
        ownerId: r.ownerId,
        ruc: r.ruc,
        name: r.name,
        address: r.address,
        district: r.district ?? "",
        phone: r.phone ?? undefined,
        website: r.web ?? undefined,
        category: r.categories[0]?.name ?? "",
        categoryId: r.categories[0]?.id,
        description: r.description ?? "",
        rating: 0,
        totalReviews: 0,
        hours,
        logo: r.logo ?? undefined,
        photos: r.images ?? undefined,
        imageUrl: r.logo ?? r.images?.[0],
        lat: r.latitude,
        lng: r.longitude,
    };
}

/* el back exige el telefono con exactamente 9 digitos (o nulo); si no, omite */
function normalizePhone(phone?: string): string | undefined {
    if (!phone) return undefined;
    const digits = phone.replace(/\D/g, "");
    return digits.length === 9 ? digits : undefined;
}

/* solo manda la lista de fotos si tiene elementos */
function imagesOf(b: Business): string[] | undefined {
    return b.photos && b.photos.length ? b.photos : undefined;
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
        logo: b.logo || undefined,
        images: imagesOf(b),
        description: b.description || undefined,
        district: b.district || undefined,
        phone: normalizePhone(b.phone),
        web: b.website || undefined,
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
        logo: b.logo || undefined,
        images: imagesOf(b),
        description: b.description || undefined,
        district: b.district || undefined,
        phone: normalizePhone(b.phone),
        web: b.website || undefined,
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