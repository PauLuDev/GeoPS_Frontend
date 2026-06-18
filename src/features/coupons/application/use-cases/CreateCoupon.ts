import { Coupon } from "../../domain/entities/Coupon.ts";
import { ICouponRepository, NewCoupon } from "../../domain/repositories/ICouponRepository.ts";

/**
 * caso de uso: crear un cupon (suelto o de campana)
 * el back acepta cupones sin campana (campaignId null); en ese caso las fechas
 * son obligatorias porque el cupon define su propia vigencia
 */
export async function createCoupon(repo: ICouponRepository, data: NewCoupon): Promise<Coupon> {
    if (!data.title.trim()) throw new Error("El título es obligatorio");
    if (data.stock < 1) throw new Error("El stock debe ser al menos 1");
    if (data.discountValue <= 0) throw new Error("El descuento debe ser mayor a 0");
    if (!data.campaignId && (!data.startDate || !data.endDate))
        throw new Error("Un cupón sin campaña necesita fecha de inicio y fin");
    return repo.create(data);
}