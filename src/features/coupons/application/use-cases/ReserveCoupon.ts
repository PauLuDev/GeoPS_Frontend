import { Coupon } from "../../domain/entities/Coupon.ts";
import { ICouponRepository } from "../../domain/repositories/ICouponRepository.ts";

/**
 * caso de uso: reservar un cupon
*/
export async function reserveCoupon(repo: ICouponRepository, couponId: string, userId: string): Promise<Coupon> {
    if (!couponId) throw new Error("Cupón inválido");
    if (!userId) throw new Error("Usuario no autenticado");
    return repo.reserve(couponId, userId);
}