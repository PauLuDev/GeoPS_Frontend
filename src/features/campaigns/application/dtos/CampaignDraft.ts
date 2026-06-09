import { CampaignCoupon } from "../../domain/entities/CampaignCoupon.ts";

/* datos crudos del formulario de un cupon (antes de validar/construir) */
export interface CouponDraftInput {
    title: string;
    originalPrice: string;
    finalPrice: string;
    stock: string;
    description: string;
    imageUrl: string;
    restrictions: string[];
    terms: string;
}

/* datos crudos del formulario de una campana */
export interface CampaignDraftInput {
    name: string;
    description: string;
    category: string;
    startDate: string;
    endDate: string;
    coupons: CampaignCoupon[];
}

export interface CampaignErrors {
    name: boolean;
    category: boolean;
    start: boolean;
    end: boolean;
    coupons: boolean;
}

export interface CouponErrors {
    title: boolean;
    original: boolean;
    final: boolean;
    stock: boolean;
}