import { couponApi } from "../infrastructure/api/couponApi.ts";
import { discountLabel } from "./mappers/DiscoverCouponMapper.ts";
import { ApiError } from "@/shared/api/apiClient.ts";

/*
 canjea un cupon con el codigo de reserva que muestra el cliente
 el dueno ingresa el codigo -> se valida al marcarlo como redimido
*/

/* cupon ya canjeado, datos minimos para mostrar el resultado */
export interface RedeemedCoupon {
    id: string;
    title: string;
    discount: string;
}

export type RedeemOutcome =
    | { kind: "success"; coupon: RedeemedCoupon }
    | { kind: "already" }
    | { kind: "notfound" }
    | { kind: "error"; error: unknown };

/* el codigo va tal cual lo muestra el cliente, solo sin espacios de mas */
const cleanCode = (s: string): string => s.trim();

/* canjea el cupon cuyo codigo de reserva coincide con lo ingresado */
export async function redeemByCode(input: string): Promise<RedeemOutcome> {
    const code = cleanCode(input);
    if (!code) return { kind: "notfound" };
    try {
        const res = await couponApi.changeReservationStatus(code, "REDEEMED");
        return {
            kind: "success",
            coupon: { id: res.coupon.id, title: res.coupon.title, discount: discountLabel(res.coupon) },
        };
    } catch (e) {
        if (e instanceof ApiError) {
            if (e.status === 404) return { kind: "notfound" };
            if (e.status === 409 || e.status === 400) return { kind: "already" };
        }
        return { kind: "error", error: e };
    }
}