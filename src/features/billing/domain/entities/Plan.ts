import { Money } from "../value-objects/Money.ts";

/**
 * plan de suscripcion (subscription-service)
 */
export interface Plan {
    id: string;            // UUID
    name: string;          // ej. "Premium"
    price: Money;
    durationDays: number;
}