import { Coupon } from "../../domain/entities/Coupon.ts";
import { ICouponRepository, NewCoupon } from "../../domain/repositories/ICouponRepository.ts";

/**
 * caso de uso: crear un cupon para una campana
 */
export async function createCoupon(repo: ICouponRepository, data: NewCoupon): Promise<Coupon> {
    if (!data.campaignId) throw new Error("La campaña es obligatoria");
    if (!data.title.trim()) throw new Error("El título es obligatorio");
    if (data.stock < 1) throw new Error("El stock debe ser al menos 1");
    if (data.discountValue <= 0) throw new Error("El descuento debe ser mayor a 0");
    return repo.create(data);
}