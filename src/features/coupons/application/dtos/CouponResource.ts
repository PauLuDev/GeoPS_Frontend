import { PromotionType } from "../../domain/value-objects/PromotionType.ts";

/**
 * dTOs (marketing-service · coupons)
 */

export interface CouponResource {
    id: string;                 // UUID
    campaignId: string;         // UUID
    title: string;
    description?: string;
    imageUrl?: string;
    originalStock: number;
    currentStock: number;
    promotionType: PromotionType;
    discountValue: number;      // bigDecimal -> number
    buyQuantity?: number | null;
    getQuantity?: number | null;
    minPurchaseAmount?: number | null;
    createdAt?: string;
    updatedAt?: string;
}

/* body de creacion */
export interface CreateCouponResource {
    campaignId: string;
    title: string;
    description?: string;
    imageUrl?: string;
    stock: number;
    promotionType: PromotionType;
    discountValue: number;
    buyQuantity?: number | null;
    getQuantity?: number | null;
    minPurchaseAmount?: number | null;
}