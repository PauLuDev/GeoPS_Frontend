import { Campaign, CampaignStatus } from "../../domain/entities/Campaign.ts";
import { CampaignResource, CreateCampaignResource, BackendCampaignStatus } from "../dtos/CampaignResource.ts";

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
        coupons: [],
        views: 0, reserved: 0, redeemed: 0,
        stock: 0, total: 0, end: "",
    };
}

/* entidad -> body de creacion (solo lo que el backend acepta) */
export function toCreateCampaignResource(c: Campaign): CreateCampaignResource {
    return { name: c.name, startDate: c.startDate, endDate: c.endDate };
}

/* deriva un id numerico estable desde el UUID (la UI usa number para keys) */
function numericId(uuid: string): number {
    let h = 0;
    for (let i = 0; i < uuid.length; i++) h = (h * 31 + uuid.charCodeAt(i)) | 0;
    return Math.abs(h);
}