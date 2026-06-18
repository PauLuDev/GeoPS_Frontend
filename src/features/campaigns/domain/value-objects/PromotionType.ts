/* tipo de promocion de un cupon */
export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT" | "BUY_X_GET_Y";

/* solo se ofrecen descuento % y monto fijo; 2x1 (BUY_X_GET_Y) queda en el tipo por compatibilidad pero no se muestra */
export const PROMOTION_TYPES: { id: PromotionType; label: string }[] = [
    { id: "PERCENTAGE",   label: "Descuento %" },
    { id: "FIXED_AMOUNT", label: "Monto fijo" },
];

export const DEFAULT_PROMOTION_TYPE: PromotionType = "PERCENTAGE";

/* etiqueta legible del tipo de promocion */
export function promotionLabel(type: PromotionType): string {
    return PROMOTION_TYPES.find(p => p.id === type)?.label ?? type;
}