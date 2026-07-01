import { Coupon } from "../../domain/entities/Coupon.ts";
import { CouponReservation } from "../../domain/entities/CouponReservation.ts";
import { ICouponRepository, NewCoupon, EditCoupon } from "../../domain/repositories/ICouponRepository.ts";
import { toCoupon, toCreateCouponResource, toUpdateCouponResource, toCouponReservation } from "../../application/mappers/CouponMapper.ts";
import { couponApi } from "../api/couponApi.ts";

/* repositorio de cupones -> crear, editar, eliminar, reservar y ver mis reservas */
export class HttpCouponRepository implements ICouponRepository {

    async create(data: NewCoupon): Promise<Coupon> {
        const resource = await couponApi.create(toCreateCouponResource(data));
        return toCoupon(resource);
    }

    async update(couponId: string, data: EditCoupon): Promise<Coupon> {
        const resource = await couponApi.update(couponId, toUpdateCouponResource(data));
        return toCoupon(resource);
    }

    async changeCampaign(couponId: string, campaignId: string | null): Promise<Coupon> {
        const resource = await couponApi.changeCampaign(couponId, campaignId);
        return toCoupon(resource);
    }

    async reserve(couponId: string, userId: string): Promise<Coupon> {
        void userId; // el dueno de la reserva sale del token
        const resource = await couponApi.reserve(couponId);
        return toCoupon(resource);
    }

    async getReservations(userId: string): Promise<CouponReservation[]> {
        const reservations = await couponApi.reservedByUser(userId);

        return reservations.filter(r => r.coupon).map(toCouponReservation);
    }

    async remove(couponId: string): Promise<void> {
        await couponApi.remove(couponId);
    }
}