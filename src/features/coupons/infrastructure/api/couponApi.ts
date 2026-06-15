import { apiClient } from "@/shared/api/apiClient.ts";
import {
    CouponResource, CreateCouponResource,
    CouponReservationResource, ReservationStatus,
} from "../../application/dtos/CouponResource.ts";

/* llama a los cupones y sus reservas */
const BASE = "/marketing/api/v1";

export const couponApi = {
    /* crea un cupon en una campana */
    create: (body: CreateCouponResource) =>
        apiClient.post<CouponResource>(`${BASE}/coupons`, body),

    /* cupon por id */
    getById: (couponId: string) =>
        apiClient.get<CouponResource>(`${BASE}/coupons/${couponId}`),

    /* cupones de una campana */
    listByCampaign: (campaignId: string) =>
        apiClient.get<CouponResource[]>(`${BASE}/campaigns/${campaignId}/coupons`),

    /* reserva un cupon, devuelve el cupon con el stock actualizado */
    reserve: (couponId: string) =>
        apiClient.post<CouponResource>(`${BASE}/coupons/${couponId}/reservations`),

    /* reservas de un usuario, cada una con su codigo de canje */
    reservedByUser: (userId: string) =>
        apiClient.get<CouponReservationResource[]>(`${BASE}/users/${userId}/coupons`),

    /* ids de usuarios que reservaron un cupon */
    usersWhoReserved: (couponId: string) =>
        apiClient.get<string[]>(`${BASE}/coupons/${couponId}/reservations`),

    /* elimina un cupon */
    remove: (couponId: string) =>
        apiClient.delete<void>(`${BASE}/coupons/${couponId}`),

    /* canjea por codigo, el dueno pasa el codigo y el nuevo estado (REDEEMED) */
    changeReservationStatus: (redemptionCode: string, status: ReservationStatus) =>
        apiClient.patch<CouponReservationResource>(`${BASE}/coupons/reservations/${redemptionCode}/status?status=${status}`),
};