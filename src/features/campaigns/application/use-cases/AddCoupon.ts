import { CampaignCoupon } from "../../domain/entities/CampaignCoupon.ts";
import { calcDiscountPct, discountLabel } from "../../domain/value-objects/Discount.ts";
import { CouponDraftInput, CouponErrors } from "../dtos/CampaignDraft.ts";

/**
 * caso de uso: validar y construir un cupon a partir del formulario
 */

export function validateCoupon(draft: CouponDraftInput): CouponErrors {
    const orig  = parseFloat(draft.originalPrice);
    const final = parseFloat(draft.finalPrice);
    return {
        title:    !draft.title.trim(),
        original: !draft.originalPrice || isNaN(orig) || orig <= 0,
        final:    !draft.finalPrice    || isNaN(final) || final < 0 || final >= orig,
        stock:    !draft.stock         || isNaN(Number(draft.stock)) || Number(draft.stock) < 1,
    };
}

export function isCouponValid(errors: CouponErrors): boolean {
    return !Object.values(errors).some(Boolean);
}

/**
 * construye el cupon
 * `expiresIn` se hereda de la vigencia de la campana
 * asume que el draft ya fue validado
 */
export function buildCoupon(draft: CouponDraftInput, expiresIn: string): CampaignCoupon {
    const orig  = parseFloat(draft.originalPrice);
    const final = parseFloat(draft.finalPrice);
    const pct   = calcDiscountPct(orig, final) ?? 0;
    return {
        id:            `cc-${Date.now()}`,
        title:         draft.title.trim(),
        promotionType: draft.promotionType,
        discount:      discountLabel(pct),
        originalPrice: orig,
        finalPrice:    final,
        stock:         parseInt(draft.stock, 10),
        expiresIn,
        description:   draft.description.trim() || undefined,
        imageUrl:      draft.imageUrl || undefined,
        restrictions:  draft.restrictions,
        terms:         draft.terms.trim() || undefined,
        views: 0, reserved: 0, redeemed: 0,   // cupon recien creado, sin metricas aun
    };
}