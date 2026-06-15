import { Coupon } from "../../domain/entities/Coupon.ts";
import { ICouponRepository, NewCoupon } from "../../domain/repositories/ICouponRepository.ts";
import { toCoupon, toCreateCouponResource } from "../../application/mappers/CouponMapper.ts";
import { couponApi } from "../api/couponApi.ts";
import { ApiError } from "@/shared/api/apiClient.ts";

/* repositorio de cupones -> crear, listar por campana, reservar y ver mis reservas */
export class HttpCouponRepository implements ICouponRepository {

    async create(data: NewCoupon): Promise<Coupon> {
        const resource = await couponApi.create(toCreateCouponResource(data));
        return toCoupon(resource);
    }

    async getByCampaign(campaignId: string): Promise<Coupon[]> {
        const list = await couponApi.listByCampaign(campaignId);
        return list.map(toCoupon);
    }

    async getById(id: string): Promise<Coupon | null> {
        try {
            return toCoupon(await couponApi.getById(id));
        } catch (e) {
            if (e instanceof ApiError && e.status === 404) return null;
            throw e;
        }
    }

    async reserve(couponId: string, userId: string): Promise<Coupon> {
        void userId; // el dueno de la reserva sale del token
        const resource = await couponApi.reserve(couponId);
        return toCoupon(resource);
    }

    async getReservedByUser(userId: string): Promise<Coupon[]> {
        const reservations = await couponApi.reservedByUser(userId);
        return reservations.map(r => toCoupon(r.coupon));
    }
}