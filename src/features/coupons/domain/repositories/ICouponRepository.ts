import { Coupon } from "../entities/Coupon.ts";
import { CouponReservation } from "../entities/CouponReservation.ts";

/* datos para crear un cupon -> sin campaignId es un cupon suelto y necesita fechas */
export interface NewCoupon {
    establishmentId: string;
    campaignId?: string | null;
    title: string;
    description?: string;
    imageUrl?: string;
    stock: number;
    promotionType: Coupon["promotionType"];
    discountValue: number;
    minPurchaseAmount?: number | null;
    startDate?: string;   // yyyy-MM-dd, obligatorio si no hay campana
    endDate?: string;
}

/* datos para editar un cupon -> sin stock; las fechas son opcionales */
export interface EditCoupon {
    title: string;
    description?: string;
    imageUrl?: string;
    promotionType: Coupon["promotionType"];
    discountValue: number;
    minPurchaseAmount?: number | null;
    startDate?: string;
    endDate?: string;
}

/**
 * puerto (interface) del repositorio de cupones
 * el dominio define el contrato; infraestructura lo implementa (HTTP)
 */
export interface ICouponRepository {
    create(data: NewCoupon): Promise<Coupon>;
    update(couponId: string, data: EditCoupon): Promise<Coupon>;
    /* reasigna el cupon a otra campana o lo deja sin campana (campaignId null) */
    changeCampaign(couponId: string, campaignId: string | null): Promise<Coupon>;
    reserve(couponId: string, userId: string): Promise<Coupon>;
    getReservations(userId: string): Promise<CouponReservation[]>;
    remove(couponId: string): Promise<void>;
}