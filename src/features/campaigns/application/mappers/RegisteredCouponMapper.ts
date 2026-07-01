import { CampaignCoupon } from "../../domain/entities/CampaignCoupon.ts";
import { CouponResource } from "@/features/coupons/application/dtos/CouponResource.ts";
import { discountLabel } from "@/features/coupons/application/mappers/DiscoverCouponMapper.ts";

/*
 arma un item del catalogo "mis cupones registrados" a partir de un cupon
 los precios de display y las metricas van en cero porque no llegan en el cupon
 el expiresIn se completa al asociarlo a una campana -> hereda su vigencia
*/
export function toCampaignCoupon(c: CouponResource): CampaignCoupon {
    const originalPrice = c.originalProductPrice ?? 0;
    let finalPrice = 0;
    if (c.promotionType === "PERCENTAGE") {
        finalPrice = originalPrice * (1 - (c.discountValue ?? 0) / 100);
    } else if (c.promotionType === "FIXED_AMOUNT") {
        finalPrice = originalPrice - (c.discountValue ?? 0);
    }
    finalPrice = Math.max(0, Math.round(finalPrice * 100) / 100);

    return {
        id: c.id,
        title: c.title,
        promotionType: c.promotionType,
        discount: discountLabel(c),
        originalPrice,
        finalPrice,
        stock: c.originalStock,
        expiresIn: "",
        restrictions: c.restrictions ? c.restrictions.split(", ") : [],
        terms: c.terms,
        description: c.description ?? "",
        imageUrl: c.imageUrl,
        views: 0,
        reserved: 0,
        redeemed: 0,
        discountValue: c.discountValue,
        minPurchaseAmount: c.minPurchaseAmount,
        startDate: c.startDate,
        endDate: c.endDate,
    };
}