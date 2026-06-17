import { Money } from "../value-objects/Money.ts";

/**
 * plan de suscripcion (subscription-service)
 */
export interface Plan {
    id: string;            // UUID
    name: string;          // ej. "Premium"
    price: Money;
    durationDays: number;
    couponLimit: number;   // maximo de cupones del plan (-1 = ilimitado)
    campaignLimit: number; // maximo de campanas activas a la vez (-1 = ilimitado)
}