import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CouponReservation } from "../../domain/entities/CouponReservation.ts";
import { ICouponRepository } from "../../domain/repositories/ICouponRepository.ts";
import { HttpCouponRepository } from "../../infrastructure/repositories/HttpCouponRepository.ts";
import { useAutoRefresh } from "@/shared/hooks/useAutoRefresh.ts";

/*
 hook de presentacion: reservas reales del cliente
 expone los ids reservados, el codigo de canje de cada uno y la accion de reservar
*/
export function useReservations(userId: string, repository?: ICouponRepository) {
    const repoRef = useRef<ICouponRepository>(repository ?? new HttpCouponRepository());
    const [reservations, setReservations] = useState<CouponReservation[]>([]);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        if (!userId) { setReservations([]); return; }
        try {
            setReservations(await repoRef.current.getReservations(userId));
        } catch (e) {
            setError(e instanceof Error ? e.message : "no se pudieron cargar las reservas");
            setReservations([]);
        }
    }, [userId]);

    useEffect(() => { void reload(); }, [reload]);

    /* refresco silencioso: actualiza el estado de las reservas (p.ej. cuando el
       dueño canjea un cupon -> pasa a REDEEMED) sin vaciar la lista si falla */
    const refresh = useCallback(async () => {
        if (!userId) return;
        try {
            setReservations(await repoRef.current.getReservations(userId));
        } catch { /* mantiene lo que ya hay */ }
    }, [userId]);
    useAutoRefresh(refresh, 15000);

    /* ids de cupones ya reservados, para marcar las cards */
    const reservedIds = useMemo(() => new Set(reservations.map(r => r.couponId)), [reservations]);

    /* estado de la reserva por cupon (RESERVED / REDEEMED / ...), para separarlos */
    const statusByCoupon = useMemo(
        () => new Map(reservations.map(r => [r.couponId, r.status])),
        [reservations],
    );

    /* reserva el cupon en el back y recarga la lista */
    const reserve = async (couponId: string) => {
        await repoRef.current.reserve(couponId, userId);
        await reload();
    };

    /* codigo de canje real de un cupon reservado */
    const codeFor = (couponId: string): string | undefined =>
        reservations.find(r => r.couponId === couponId)?.redemptionCode;

    return { reservations, reservedIds, statusByCoupon, reserve, codeFor, reload, error };
}
