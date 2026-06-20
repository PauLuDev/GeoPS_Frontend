import { Campaign, CampaignStatus } from "../../domain/entities/Campaign.ts";
import { CampaignCoupon } from "../../domain/entities/CampaignCoupon.ts";
import { CampaignResource, CreateCampaignResource, UpdateCampaignResource, BackendCampaignStatus } from "../dtos/CampaignResource.ts";
import { EditCampaign } from "../../domain/repositories/ICampaignRepository.ts";
import { NewCoupon } from "@/features/coupons/domain/repositories/ICouponRepository.ts";
import { CouponResource } from "@/features/coupons/application/dtos/CouponResource.ts";

/**
 * mapeo de estados entre backend y display del frontend
 */
const FROM_BACKEND: Record<BackendCampaignStatus, CampaignStatus> = {
    SCHEDULED: "scheduled",
    ACTIVE:    "live",
    PAUSED:    "draft",
    EXPIRED:   "ended",
};
const TO_BACKEND: Record<CampaignStatus, BackendCampaignStatus> = {
    scheduled: "SCHEDULED",
    live:      "ACTIVE",
    draft:     "PAUSED",
    ended:     "EXPIRED",
};

export function mapStatusFromBackend(s: BackendCampaignStatus): CampaignStatus { return FROM_BACKEND[s]; }
export function mapStatusToBackend(s: CampaignStatus): BackendCampaignStatus { return TO_BACKEND[s]; }

/**
 * los extras solo-UI (categoria, cupones, metricas) se rellenan con
 * valores por defecto; vendran de otros servicios (analytics, coupons)
 */
export function toCampaign(r: CampaignResource): Campaign {
    return {
        id: numericId(r.id),
        uuid: r.id,
        establishmentId: r.establishmentId,
        name: r.name,
        startDate: r.startDate,
        endDate: r.endDate,
        status: mapStatusFromBackend(r.status),
        // extras solo-UI
        description: "",
        category: "",
        coupons: [],   // los rellena el repo pidiendolos por campana -> couponApi.listByCampaign

        views: 0, reserved: 0, redeemed: 0,
        stock: 0, total: 0, end: "",
    };
}

/* fecha datetime-local "2026-06-15T14:00" -> LocalDate "2026-06-15" */
function toLocalDate(s: string): string {
    return s ? s.slice(0, 10) : s;
}

/* entidad -> body de creacion (el establishmentId sale del establecimiento del dueno) */
export function toCreateCampaignResource(c: Campaign): CreateCampaignResource {
    return {
        establishmentId: c.establishmentId ?? "",
        name: c.name,
        startDate: toLocalDate(c.startDate),
        endDate: toLocalDate(c.endDate),
    };
}

/* entidad -> body de edicion */
export function toUpdateCampaignResource(data: EditCampaign): UpdateCampaignResource {
    return {
        name: data.name,
        startDate: toLocalDate(data.startDate),
        endDate: toLocalDate(data.endDate),
    };
}

/* cupon de la campana -> datos para crearlo en el back (deriva el discountValue de los precios) */
export function toNewCoupon(cc: CampaignCoupon, establishmentId: string, campaignId: string): NewCoupon {
    let discountValue = 0;
    if (cc.promotionType === "PERCENTAGE") {
        discountValue = cc.originalPrice > 0 ? Math.round((cc.originalPrice - cc.finalPrice) / cc.originalPrice * 100) : 0;
    } else if (cc.promotionType === "FIXED_AMOUNT") {
        discountValue = Math.max(0, cc.originalPrice - cc.finalPrice);
    }
    return {
        establishmentId,
        campaignId,
        title: cc.title,
        description: cc.description,
        imageUrl: cc.imageUrl,
        stock: cc.stock,
        promotionType: cc.promotionType,
        discountValue,
    };
}

/* cupon del back -> cupon embebido en la campana (vista del dueno) */
export function toCampaignCoupon(r: CouponResource): CampaignCoupon {
    return {
        id: r.id,
        uuid: r.id,
        campaignId: r.campaignId,
        title: r.title,
        promotionType: r.promotionType,
        stock: r.currentStock,
        // etiqueta del descuento segun el tipo (el back no manda precios de display todavia)
        discount: discountLabel(r),
        originalPrice: 0,
        finalPrice: 0,
        expiresIn: "",
        description: r.description,
        imageUrl: r.imageUrl,
        restrictions: [],
        // valores reales para editar el cupon
        discountValue: r.discountValue,
        minPurchaseAmount: r.minPurchaseAmount,
        startDate: r.startDate,
        endDate: r.endDate,
        // metricas vienen de analytics -> por ahora en cero
        views: 0, reserved: 0, redeemed: 0,
    };
}

/* etiqueta corta del descuento -> "30%" o "S/ 10" segun el tipo */
function discountLabel(r: CouponResource): string {
    if (r.promotionType === "PERCENTAGE") return `${r.discountValue}%`;
    if (r.promotionType === "FIXED_AMOUNT") return `S/ ${r.discountValue}`;
    return "";
}

/* deriva un id numerico estable desde el UUID (la UI usa number para keys) */
function numericId(uuid: string): number {
    let h = 0;
    for (let i = 0; i < uuid.length; i++) h = (h * 31 + uuid.charCodeAt(i)) | 0;
    return Math.abs(h);
}