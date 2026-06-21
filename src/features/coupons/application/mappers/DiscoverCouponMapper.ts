import { Coupon as UICoupon, Business } from "@/shared/types.ts";
import { CouponResource } from "../dtos/CouponResource.ts";

/* arma la etiqueta de descuento segun el tipo de promocion */
export function discountLabel(c: CouponResource): string {
    if (c.promotionType === "FIXED_AMOUNT") return `S/${c.discountValue}`;
    if (c.promotionType === "BUY_X_GET_Y") return `${c.buyQuantity ?? 2}x${c.getQuantity ?? 1}`;
    return `${c.discountValue}%`;
}

/* arma la etiqueta de cuenta regresiva usando la fecha de fin de la campana */
export function expiresInLabel(endDate?: string): string {
    if (!endDate) return "";
    const ms = new Date(endDate).getTime() - Date.now();
    if (Number.isNaN(ms)) return "";
    if (ms <= 0) return "vencido";
    const mins = ms / 60000;
    if (mins < 60) return `${Math.round(mins)}m`;
    const hrs = mins / 60;
    if (hrs < 24) return `${Math.floor(hrs)}h`;
    return `${Math.round(hrs / 24)}d`;
}

/*
 arma el cupon que ve el cliente -> junta el cupon con su local y la vigencia de la campana
 los precios de display, el destacado y las coords x/y del mapa estilizado van en cero porque no llegan en el cupon
 la distancia se calcula en vivo en el mapa
*/
export function toUICoupon(c: CouponResource, business: Business, endDate?: string): UICoupon {
    return {
        id: c.id,
        establishmentId: business.id,
        campaignId: c.campaignId ?? undefined,
        brand: business.name,
        category: business.category,
        x: 0, y: 0,
        lat: business.lat,
        lng: business.lng,
        title: c.title,
        discount: discountLabel(c),
        originalPrice: 0,
        finalPrice: 0,
        distance: 0,
        walking: 0,
        address: business.address,
        stock: c.currentStock,
        totalStock: c.originalStock,
        expiresIn: expiresInLabel(endDate),
        rating: business.rating,
        reviews: business.totalReviews,
        featured: false,
        verified: !!business.ruc && business.ruc !== "No disponible",
        description: c.description ?? "",
        imageUrl: c.imageUrl,
    };
}