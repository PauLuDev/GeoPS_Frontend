import { PromotionType } from "../../domain/value-objects/PromotionType.ts";

/* estado de una reserva de cupon */
export type ReservationStatus = "RESERVED" | "REDEEMED" | "EXPIRED" | "CANCELLED";

/* reserva de un cupon, lleva el codigo de canje */
export interface CouponReservationResource {
    id: string;
    coupon: CouponResource;
    status: ReservationStatus;
    redemptionCode: string;
    reservedAt?: string;
    redeemedAt?: string;
}

export interface CouponResource {
    id: string;                 
    campaignId: string;         
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
    startDate?: string;         // yyyy-MM-dd
    endDate?: string;           // yyyy-MM-dd
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

/* body de edicion -> sin stock; las fechas son opcionales */
export interface UpdateCouponResource {
    title: string;
    description?: string;
    imageUrl?: string;
    promotionType: PromotionType;
    discountValue: number;
    minPurchaseAmount?: number | null;
    startDate?: string;   // yyyy-MM-dd
    endDate?: string;     // yyyy-MM-dd
}

/* body de creacion -> campaignId null = cupon suelto (ahi startDate y endDate son obligatorios) */
export interface CreateCouponResource {
    establishmentId: string;
    campaignId?: string | null;
    title: string;
    description?: string;
    imageUrl?: string;
    stock: number;
    promotionType: PromotionType;
    discountValue: number;
    minPurchaseAmount?: number | null;
    startDate?: string;   // yyyy-MM-dd
    endDate?: string;     // yyyy-MM-dd
}