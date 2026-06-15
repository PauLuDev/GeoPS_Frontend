/* tipo de promocion de un cupon */
export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT" | "BUY_X_GET_Y";

export const PROMOTION_TYPES: { id: PromotionType; label: string }[] = [
    { id: "PERCENTAGE",   label: "Descuento %" },
    { id: "FIXED_AMOUNT", label: "Monto fijo" },
    { id: "BUY_X_GET_Y",  label: "2x1" },
];

export const DEFAULT_PROMOTION_TYPE: PromotionType = "PERCENTAGE";

/* etiqueta legible del tipo de promocion */
export function promotionLabel(type: PromotionType): string {
    return PROMOTION_TYPES.find(p => p.id === type)?.label ?? type;
}