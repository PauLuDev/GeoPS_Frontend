export interface Category {
    id: string;
    label: string;
    icon: string;
}

export interface Coupon {
    id: string;
    brand: string;
    category: string;
    x: number;
    y: number;
    lat: number;
    lng: number;
    title: string;
    discount: string;
    originalPrice: number;
    finalPrice: number;
    distance: number;
    walking: number;
    address: string;
    stock: number;
    totalStock: number;
    expiresIn: string;
    rating: number;
    reviews: number;
    featured?: boolean;
    description: string;
    imageUrl?: string;
}

export interface UserCoord {
    lat: number;
    lng: number;
}

export interface BusinessHours {
    day: string;
    open: string;
    close: string;
    closed?: boolean;
}

/* las entidades de campana viven en
 * features/campaigns/domain/entities (Campaign, CampaignCoupon, CampaignStatus)*/

export interface Business {
    id: string;
    ruc: string;
    name: string;
    address: string;
    district: string;
    phone?: string;
    email?: string;
    website?: string;
    category: string;       // nombre de la categoria (para mostrar)
    categoryId?: number;    // id real de la categoria (para crear/editar)
    description: string;
    rating: number;
    totalReviews: number;
    hours: BusinessHours[];
    imageUrl?: string;
    logo?: string;
    photos?: string[];
    lat: number;
    lng: number;
    active?: boolean;   // visibilidad en la plataforma (undefined = activo)
}

export interface UserLocation {
    lat: number;
    lng: number;
    name: string;
    source: "gps" | "manual" | "default";
}