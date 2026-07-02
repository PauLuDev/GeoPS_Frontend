import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CouponReservation } from "../../domain/entities/CouponReservation.ts";
import { ICouponRepository } from "../../domain/repositories/ICouponRepository.ts";
import { HttpCouponRepository } from "../../infrastructure/repositories/HttpCouponRepository.ts";
import { useAutoRefresh } from "@/shared/hooks/useAutoRefresh.ts";
import { mapApiError, AppError } from "@/shared/api/errorMapper.ts";

/*
 hook de presentacion: reservas reales del cliente
 expone los ids reservados, el codigo de canje de cada uno y la accion de reservar
*/
export function useReservations(userId: string, repository?: ICouponRepository) {
    const { t } = useTranslation();
    const repoRef = useRef<ICouponRepository>(repository ?? new HttpCouponRepository());
    const [reservations, setReservations] = useState<CouponReservation[]>([]);
    const [error, setError] = useState<AppError | null>(null);

    const [historyIds, setHistoryIds] = useState<Set<string>>(() => {
        try {
            const raw = localStorage.getItem(`geops_reserved_history_${userId}`);
            return raw ? new Set(JSON.parse(raw)) : new Set();
        } catch {
            return new Set();
        }
    });

    const reload = useCallback(async () => {
        if (!userId) { setReservations([]); return; }
        try {
            setReservations(await repoRef.current.getReservations(userId));
        } catch (e) {
            setError(mapApiError(e, t));
            setReservations([]);
        }
    }, [userId, t]);

    useEffect(() => { void reload(); }, [reload]);

    useEffect(() => {
        if (!userId) return;
        try {
            const raw = localStorage.getItem(`geops_reserved_history_${userId}`);
            const currentHistory = raw ? (JSON.parse(raw) as string[]) : [];
            const historySet = new Set(currentHistory);
            
            let changed = false;
            reservations.forEach(r => {
                if (!historySet.has(r.couponId)) {
                    historySet.add(r.couponId);
                    changed = true;
                }
            });
            
            if (changed) {
                const arr = Array.from(historySet);
                localStorage.setItem(`geops_reserved_history_${userId}`, JSON.stringify(arr));
                setHistoryIds(historySet);
            }
        } catch { /* ignore */ }
    }, [reservations, userId]);

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

    const hasBeenReservedBefore = useCallback((couponId: string) => {
        return reservedIds.has(couponId) || historyIds.has(couponId);
    }, [reservedIds, historyIds]);

    /* estado de la reserva por cupon (RESERVED / REDEEMED / ...), para separarlos */
    const statusByCoupon = useMemo(
        () => new Map(reservations.map(r => [r.couponId, r.status])),
        [reservations],
    );

    /* reserva el cupon en el back y recarga la lista */
    const reserve = async (couponId: string) => {
        await repoRef.current.reserve(couponId, userId);
        setHistoryIds(prev => {
            const next = new Set(prev);
            next.add(couponId);
            try {
                localStorage.setItem(`geops_reserved_history_${userId}`, JSON.stringify(Array.from(next)));
            } catch { /* ignore */ }
            return next;
        });
        await reload();
    };

    /* codigo de canje real de un cupon reservado */
    const codeFor = (couponId: string): string | undefined =>
        reservations.find(r => r.couponId === couponId)?.redemptionCode;

    return { reservations, reservedIds, statusByCoupon, reserve, codeFor, reload, error, hasBeenReservedBefore };
}
