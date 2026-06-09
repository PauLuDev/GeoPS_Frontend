import { ReservationStatus } from "../value-objects/ReservationStatus.ts";

/**
 * reserva de un cupon por parte de un cliente
 */
export interface CouponReservation {
    id: string;             // UUID
    couponId: string;       // UUID
    userId: string;         // UUID
    status: ReservationStatus;
    createdAt?: string;
}