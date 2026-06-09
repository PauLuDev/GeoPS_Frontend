/**
 * value object: descuento derivado de un par de precios
 * el negocio no maneja promociones tipo "2x1"; el descuento
 * siempre se expresa como porcentaje calculado desde los precios
 */

/* devuelve el % entero, o null si los precios no forman un descuento valido */
export function calcDiscountPct(originalPrice: number, finalPrice: number): number | null {
    if (isNaN(originalPrice) || isNaN(finalPrice)) return null;
    if (originalPrice <= 0 || finalPrice < 0 || finalPrice >= originalPrice) return null;
    return Math.round((1 - finalPrice / originalPrice) * 100);
}

/* etiqueta visible del descuento, ej. "40%"*/
export function discountLabel(pct: number): string {
    return `${pct}%`;
}

/* ahorro absoluto en soles */
export function savings(originalPrice: number, finalPrice: number): number {
    return +(originalPrice - finalPrice).toFixed(2);
}