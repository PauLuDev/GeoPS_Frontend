import { Coupon } from "../../domain/entities/Coupon.ts";
import { NewCoupon } from "../../domain/repositories/ICouponRepository.ts";
import { CouponResource, CreateCouponResource } from "../dtos/CouponResource.ts";

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

/* datos de creacion -> body de la API */
export function toCreateCouponResource(data: NewCoupon): CreateCouponResource {
    return {
        campaignId: data.campaignId,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        stock: data.stock,
        promotionType: data.promotionType,
        discountValue: data.discountValue,
        buyQuantity: data.buyQuantity ?? null,
        getQuantity: data.getQuantity ?? null,
        minPurchaseAmount: data.minPurchaseAmount ?? null,
    };
}