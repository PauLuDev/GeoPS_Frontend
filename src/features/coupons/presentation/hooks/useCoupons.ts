import { useRef, useState } from "react";
import { Coupon } from "../../domain/entities/Coupon.ts";
import { ICouponRepository, NewCoupon } from "../../domain/repositories/ICouponRepository.ts";
import { HttpCouponRepository } from "../../infrastructure/repositories/HttpCouponRepository.ts";
import { createCoupon } from "../../application/use-cases/CreateCoupon.ts";
import { listCouponsByCampaign } from "../../application/use-cases/ListCouponsByCampaign.ts";
import { reserveCoupon } from "../../application/use-cases/ReserveCoupon.ts";
import { listReservedByUser } from "../../application/use-cases/ListReservedByUser.ts";

/**
 * hook de presentacion: acciones del BC coupons (crear, listar, reservar),
 * apoyandose en los use-cases y el repositorio
 */
export function useCoupons(repository?: ICouponRepository) {
    const repoRef = useRef<ICouponRepository>(repository ?? new HttpCouponRepository());
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    const run = async <T>(action: () => Promise<T>): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            return await action();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error en cupones");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        create:           (data: NewCoupon) => run(() => createCoupon(repoRef.current, data)),
        listByCampaign:   (campaignId: string) => run(() => listCouponsByCampaign(repoRef.current, campaignId)),
        reserve:          (couponId: string, userId: string): Promise<Coupon | null> => run(() => reserveCoupon(repoRef.current, couponId, userId)),
        listReservedByUser: (userId: string) => run(() => listReservedByUser(repoRef.current, userId)),
    };
}