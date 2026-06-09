import { Coupon } from "../../domain/entities/Coupon.ts";
import { ICouponRepository } from "../../domain/repositories/ICouponRepository.ts";

/* caso de uso: listar los cupones reservados por un usuario */
export async function listReservedByUser(repo: ICouponRepository, userId: string): Promise<Coupon[]> {
    return repo.getReservedByUser(userId);
}