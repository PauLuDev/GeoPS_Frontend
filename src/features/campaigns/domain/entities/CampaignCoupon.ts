/**
 * cupon embebido en el formulario de campana (vista del merchant)
 */
export interface CampaignCoupon {
    id: string;
    title: string;
    stock: number;
    uuid?: string;          // id real (UUID) del backend
    campaignId?: string;    // campana a la que pertenece (UUID)

    /* extras */
    discount: string;       // etiqueta "40%" derivada de los precios
    originalPrice: number;
    finalPrice: number;
    expiresIn: string;      // vigencia heredada de la campana ("1d 3h")
    description?: string;
    imageUrl?: string;
    restrictions: string[];
    terms?: string;
}
