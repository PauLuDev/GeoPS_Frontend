/**
 * dTOs (marketing-service · contexto campaigns)
 */

/* estado de campana */
export type BackendCampaignStatus = "SCHEDULED" | "ACTIVE" | "PAUSED" | "EXPIRED";

export interface CampaignResource {
    id: string;               // UUID
    establishmentId: string;  // UUID (sale del token)
    name: string;
    startDate: string;        // ISO LocalDateTime
    endDate: string;
    status: BackendCampaignStatus;
    createdAt?: string;
    updatedAt?: string;
}

/* body de creacion */
export interface CreateCampaignResource {
    establishmentId: string;
    name: string;
    startDate: string;   // yyyy-MM-dd
    endDate: string;     // yyyy-MM-dd
}

/* body de edicion */
export interface UpdateCampaignResource {
    name: string;
    startDate: string;   // yyyy-MM-dd
    endDate: string;     // yyyy-MM-dd
}
