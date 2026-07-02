import { PromotionType } from "../value-objects/PromotionType.ts";

/**
 * cupon (marketing-service · coupons)
 * distinto del `Coupon` de shared/types.ts, que es el *read-model*
 * de la card del cliente (con lat/lng, brand, distancia, precios)
 * este es el modelo de negocio que viaja con la API
 */
export interface Coupon {
    id: string;             // UUID
    campaignId: string;     // UUID
    title: string;
    description?: string;
    imageUrl?: string;
    originalStock: number;
    currentStock: number;
    promotionType: PromotionType;
    discountValue: number;  // ej. 40 para -40%
    buyQuantity?: number | null;
    getQuantity?: number | null;
    minPurchaseAmount?: number | null;
    createdAt?: string;
    updatedAt?: string;
    restrictions?: string;
    terms?: string;
    originalProductPrice?: number;
}