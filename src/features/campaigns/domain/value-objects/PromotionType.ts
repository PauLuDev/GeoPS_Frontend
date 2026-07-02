import type { TFunction } from "i18next";

/* tipo de promocion de un cupon */
export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT";

/* solo se ofrecen descuento % y monto fijo */
export const PROMOTION_TYPES: { id: PromotionType; labelKey: string }[] = [
    { id: "PERCENTAGE",   labelKey: "promotionTypes.percentage" },
    { id: "FIXED_AMOUNT", labelKey: "promotionTypes.fixedAmount" },
];

export const DEFAULT_PROMOTION_TYPE: PromotionType = "PERCENTAGE";

/* etiqueta legible y traducible del tipo de promocion */
export function promotionLabel(type: PromotionType, t?: TFunction): string {
    if (t) {
        if (type === "PERCENTAGE") return t("promotionTypes.percentage");
        if (type === "FIXED_AMOUNT") return t("promotionTypes.fixedAmount");
    }
    const map: Record<PromotionType, string> = {
        PERCENTAGE: "Descuento %",
        FIXED_AMOUNT: "Monto fijo",
    };
    return map[type] ?? type;
}

/* etiqueta traducible del tipo de promocion */
export function promotionLabelT(type: PromotionType, t: TFunction): string {
    const found = PROMOTION_TYPES.find(p => p.id === type);
    return found ? t(found.labelKey) : type;
}
