import { Coupon } from "../../domain/entities/Coupon.ts";
import { CouponReservation } from "../../domain/entities/CouponReservation.ts";
import { ReservationStatus } from "../../domain/value-objects/ReservationStatus.ts";
import { NewCoupon, EditCoupon } from "../../domain/repositories/ICouponRepository.ts";
import { CouponResource, CreateCouponResource, UpdateCouponResource, CouponReservationResource } from "../dtos/CouponResource.ts";

/* DTO -> entidad de dominio */
export function toCoupon(r: CouponResource): Coupon {
    return {
        id: r.id,
        campaignId: r.campaignId,
        title: r.title,
        description: r.description,
        imageUrl: r.imageUrl,
        originalStock: r.originalStock,
        currentStock: r.currentStock,
        promotionType: r.promotionType,
        discountValue: r.discountValue,
        buyQuantity: r.buyQuantity,
        getQuantity: r.getQuantity,
        minPurchaseAmount: r.minPurchaseAmount,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
    };
}

/* reserva (dto) -> entidad de dominio con el codigo de canje */
export function toCouponReservation(r: CouponReservationResource): CouponReservation {
    return {
        id: r.id,
        couponId: r.coupon.id,
        status: r.status as ReservationStatus,
        redemptionCode: r.redemptionCode,
        reservedAt: r.reservedAt,
        redeemedAt: r.redeemedAt,
    };
}

/* datos de edicion -> body de la api */
export function toUpdateCouponResource(data: EditCoupon): UpdateCouponResource {
    return {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        promotionType: data.promotionType,
        discountValue: data.discountValue,
        minPurchaseAmount: data.minPurchaseAmount ?? null,
        startDate: data.startDate,
        endDate: data.endDate,
    };
}

/* datos de creacion -> body de la api */
export function toCreateCouponResource(data: NewCoupon): CreateCouponResource {
    return {
        establishmentId: data.establishmentId,
        campaignId: data.campaignId ?? null,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        stock: data.stock,
        promotionType: data.promotionType,
        discountValue: data.discountValue,
        minPurchaseAmount: data.minPurchaseAmount ?? null,
        startDate: data.startDate,
        endDate: data.endDate,
    };
}