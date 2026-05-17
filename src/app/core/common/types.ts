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

export interface UserLocation {
    lat: number;
    lng: number;
    name: string;
    source: "gps" | "manual" | "default";
}