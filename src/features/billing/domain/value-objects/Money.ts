/**
 * value object: dinero (importe + moneda)
 */
export interface Money {
    amount: number;
    currency: string;   // "PEN", "USD", ...
}

/* formatea para mostrar, ej. "S/ 29.00" */
export function formatMoney(m: Money): string {
    const symbol = m.currency === "PEN" ? "S/ " : m.currency === "USD" ? "$ " : `${m.currency} `;
    return `${symbol}${m.amount.toFixed(2)}`;
}