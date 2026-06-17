import { ReservationStatus } from "../value-objects/ReservationStatus.ts";

/* reserva de un cupon por parte de un cliente, lleva el codigo de canje real */
export interface CouponReservation {
    id: string;             // UUID
    couponId: string;       // UUID del cupon reservado
    status: ReservationStatus;
    redemptionCode: string; // codigo que el merchant valida al canjear
    reservedAt?: string;
    redeemedAt?: string;
}
