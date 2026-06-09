import { Coupon } from "../entities/Coupon.ts";

/* datos para crear un cupon */
export interface NewCoupon {
    campaignId: string;
    title: string;
    description?: string;
    imageUrl?: string;
    stock: number;
    promotionType: Coupon["promotionType"];
    discountValue: number;
    buyQuantity?: number | null;
    getQuantity?: number | null;
    minPurchaseAmount?: number | null;
}

/**
 * puerto (interface) del repositorio de cupones
 * el dominio define el contrato; infraestructura lo implementa (HTTP)
 */
export interface ICouponRepository {
    create(data: NewCoupon): Promise<Coupon>;
    getByCampaign(campaignId: string): Promise<Coupon[]>;
    getById(id: string): Promise<Coupon | null>;
    reserve(couponId: string, userId: string): Promise<Coupon>;
    getReservedByUser(userId: string): Promise<Coupon[]>;
}