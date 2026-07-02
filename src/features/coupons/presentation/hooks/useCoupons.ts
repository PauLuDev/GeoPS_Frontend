import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Coupon } from "../../domain/entities/Coupon.ts";
import { ICouponRepository, NewCoupon, EditCoupon } from "../../domain/repositories/ICouponRepository.ts";
import { HttpCouponRepository } from "../../infrastructure/repositories/HttpCouponRepository.ts";
import { createCoupon } from "../../application/use-cases/CreateCoupon.ts";
import { mapApiError, AppError } from "@/shared/api/errorMapper.ts";

/* hook de presentacion: crear, editar y eliminar cupones del dueno */
export function useCoupons(repository?: ICouponRepository) {
    const { t } = useTranslation();
    const repoRef = useRef<ICouponRepository>(repository ?? new HttpCouponRepository());
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<AppError | null>(null);

    const run = async <T>(action: () => Promise<T>): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            return await action();
        } catch (e) {
            setError(mapApiError(e, t));
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        create:  (data: NewCoupon) => run(() => createCoupon(repoRef.current, data)),
        update:  (couponId: string, data: EditCoupon): Promise<Coupon | null> => run(() => repoRef.current.update(couponId, data)),
        changeCampaign: (couponId: string, campaignId: string | null): Promise<Coupon | null> => run(() => repoRef.current.changeCampaign(couponId, campaignId)),
        remove:  (couponId: string): Promise<void | null> => run(() => repoRef.current.remove(couponId)),
    };
}