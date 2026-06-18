import { CampaignCoupon } from "./CampaignCoupon.ts";

export type CampaignStatus = "live" | "scheduled" | "draft" | "ended";

/**
 * campana promocional de un establecimiento
 * agrupa uno o mas cupones con una vigencia comun
 * entidad raiz del bounded context `campaigns`
 */
export interface Campaign {
    id: number;
    name: string;
    startDate: string;       // ISO datetime-local
    endDate: string;
    status: CampaignStatus;
    uuid?: string;           // id real (UUID) del backend
    establishmentId?: string;// dueno/establecimiento (del token)

    /* extras */
    description: string;
    category: string;        // tipo de campana (ocasion)
    coupons: CampaignCoupon[];
    views: number;
    reserved: number;
    redeemed: number;
    stock: number;           // stock disponible (suma de cupones)
    total: number;           // stock total inicial
    end: string;             // etiqueta de tiempo restante para la lista
}