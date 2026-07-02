import type { TFunction } from "i18next";

/* tipo de promocion de un cupon */
export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT" | "BUY_X_GET_Y";

/* solo se ofrecen descuento % y monto fijo; 2x1 (BUY_X_GET_Y) queda en el tipo por compatibilidad pero no se muestra */
export const PROMOTION_TYPES: { id: PromotionType; labelKey: string }[] = [
    { id: "PERCENTAGE",   labelKey: "promotionTypes.percentage" },
    { id: "FIXED_AMOUNT", labelKey: "promotionTypes.fixedAmount" },
];

export const DEFAULT_PROMOTION_TYPE: PromotionType = "PERCENTAGE";

/* etiqueta legible del tipo de promocion (sin depender de i18n, para compatibilidad) */
export function promotionLabel(type: PromotionType): string {
    const map: Record<PromotionType, string> = {
        PERCENTAGE: "Descuento %",
        FIXED_AMOUNT: "Monto fijo",
        BUY_X_GET_Y: "2x1",
    };
    return map[type] ?? type;
}

/* etiqueta traducible del tipo de promocion */
export function promotionLabelT(type: PromotionType, t: TFunction): string {
    const found = PROMOTION_TYPES.find(p => p.id === type);
    return found ? t(found.labelKey) : type;
}
