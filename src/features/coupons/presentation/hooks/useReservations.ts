import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CouponReservation } from "../../domain/entities/CouponReservation.ts";
import { ICouponRepository } from "../../domain/repositories/ICouponRepository.ts";
import { HttpCouponRepository } from "../../infrastructure/repositories/HttpCouponRepository.ts";

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

    /* ids de cupones ya reservados, para marcar las cards */
    const reservedIds = useMemo(() => new Set(reservations.map(r => r.couponId)), [reservations]);

    /* reserva el cupon en el back y recarga la lista */
    const reserve = async (couponId: string) => {
        await repoRef.current.reserve(couponId, userId);
        await reload();
    };

    /* codigo de canje real de un cupon reservado */
    const codeFor = (couponId: string): string | undefined =>
        reservations.find(r => r.couponId === couponId)?.redemptionCode;

    return { reservations, reservedIds, reserve, codeFor, reload, error };
}
