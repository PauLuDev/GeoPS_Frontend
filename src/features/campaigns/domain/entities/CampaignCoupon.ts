import { PromotionType } from "../value-objects/PromotionType.ts";

/* cupon embebido en una campana (vista del dueño) */
export interface CampaignCoupon {
    id: string;
    title: string;
    promotionType: PromotionType;   // descuento, monto fijo o 2x1
    stock: number;
    uuid?: string;          // id real
    campaignId?: string;    // campana a la que pertenece

    /* extras */
    discount: string;       // etiqueta "%" derivada de los precios
    originalPrice: number;
    finalPrice: number;
    expiresIn: string;      // vigencia heredada de la campana
    description?: string;
    imageUrl?: string;
    restrictions: string[];
    terms?: string;

    /* valores reales del back, para editar el cupon */
    discountValue?: number;
    minPurchaseAmount?: number | null;
    startDate?: string;
    endDate?: string;

    /* metricas de rendimiento del cupon dentro de la campana */
    views: number;
    reserved: number;
    redeemed: number;
}