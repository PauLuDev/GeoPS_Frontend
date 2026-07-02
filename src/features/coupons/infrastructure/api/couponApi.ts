import { apiClient } from "@/shared/api/apiClient.ts";
import {
    CouponResource, CreateCouponResource, UpdateCouponResource,
    CouponReservationResource, ReservationStatus,
} from "../../application/dtos/CouponResource.ts";

/* llama a los cupones y sus reservas */
const BASE = "/marketing/api/v1";

export const couponApi = {
    /* crea un cupon en una campana */
    create: (body: CreateCouponResource) =>
        apiClient.post<CouponResource>(`${BASE}/coupons`, body),

    /* edita un cupon (no incluye stock) */
    update: (couponId: string, body: UpdateCouponResource) =>
        apiClient.put<CouponResource>(`${BASE}/coupons/${couponId}`, body),

    /* reasigna el cupon a otra campana o lo deja sin campana (campaignId null) */
    changeCampaign: (couponId: string, campaignId: string | null) =>
        apiClient.patch<CouponResource>(`${BASE}/coupons/${couponId}/campaign`, { campaignId }),

    /* cupones de una campana */
    listByCampaign: (campaignId: string) =>
        apiClient.get<CouponResource[]>(`${BASE}/campaigns/${campaignId}/coupons`),

    /* cupones de un establecimiento (incluye los independientes) */
    listByEstablishment: (establishmentId: string) =>
        apiClient.get<CouponResource[]>(`${BASE}/coupons/establishment/${establishmentId}`),

    /* reserva un cupon, devuelve el cupon con el stock actualizado */
    reserve: (couponId: string) =>
        apiClient.post<CouponResource>(`${BASE}/coupons/${couponId}/reservations`),

    /* reservas de un usuario, cada una con su codigo de canje y estado */
    reservedByUser: (userId: string) =>
        apiClient.get<CouponReservationResource[]>(`${BASE}/users/${userId}/coupons`),

    /* elimina un cupon */
    remove: (couponId: string) =>
        apiClient.delete<void>(`${BASE}/coupons/${couponId}`),

    /* canjea por codigo, el dueno pasa el codigo y el nuevo estado (REDEEMED) */
    changeReservationStatus: (redemptionCode: string, status: ReservationStatus) =>
        apiClient.patch<CouponReservationResource>(`${BASE}/coupons/reservations/${redemptionCode}/status?status=${status}`),
};