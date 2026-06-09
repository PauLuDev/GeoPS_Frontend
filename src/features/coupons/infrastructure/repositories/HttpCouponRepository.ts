import { Coupon } from "../../domain/entities/Coupon.ts";
import { ICouponRepository, NewCoupon } from "../../domain/repositories/ICouponRepository.ts";
import { CouponResource } from "../../application/dtos/CouponResource.ts";
import { toCoupon } from "../../application/mappers/CouponMapper.ts";

/* base del API marketing */
const API_BASE = import.meta.env.VITE_MARKETING_URL ?? "http://localhost:8082/api/v1";

/* cupon mock con la forma real (CouponResource) */
function demo(campaignId: string, title: string, discountValue: number, stock: number): CouponResource {
    return {
        id: cryptoRandomId(), campaignId, title,
        originalStock: stock, currentStock: stock,
        promotionType: "PERCENTAGE", discountValue,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
}

/**
 * implementacion del repositorio de cupones contra el backend (HTTP)
 */
export class HttpCouponRepository implements ICouponRepository {
    private coupons: CouponResource[] = [
        demo("camp-1", "Sushi rolls 2x1 al mediodía", 50, 30),
        demo("camp-1", "Postre gratis con plato fuerte", 100, 20),
    ];
    private reservations: { couponId: string; userId: string }[] = [];

    async create(data: NewCoupon): Promise<Coupon> {
        const resource = demo(data.campaignId, data.title, data.discountValue, data.stock);
        resource.description = data.description;
        resource.imageUrl = data.imageUrl;
        resource.promotionType = data.promotionType;
        this.coupons = [resource, ...this.coupons];
        return toCoupon(resource);
    }

    async getByCampaign(campaignId: string): Promise<Coupon[]> {
        void API_BASE;
        return this.coupons.filter(c => c.campaignId === campaignId).map(toCoupon);
    }

    async getById(id: string): Promise<Coupon | null> {
        const found = this.coupons.find(c => c.id === id);
        return found ? toCoupon(found) : null;
    }

    async reserve(couponId: string, userId: string): Promise<Coupon> {
        const resource = this.coupons.find(c => c.id === couponId);
        if (!resource) throw new Error("Cupón no encontrado");
        if (resource.currentStock <= 0) throw new Error("Sin stock disponible");
        resource.currentStock -= 1;
        this.reservations.push({ couponId, userId });
        return toCoupon(resource);
    }

    async getReservedByUser(userId: string): Promise<Coupon[]> {
        const ids = this.reservations.filter(r => r.userId === userId).map(r => r.couponId);
        return this.coupons.filter(c => ids.includes(c.id)).map(toCoupon);
    }
}

function cryptoRandomId(): string {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `cp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}