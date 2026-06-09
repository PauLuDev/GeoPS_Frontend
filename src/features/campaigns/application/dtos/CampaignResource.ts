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
    name: string;
    startDate: string;
    endDate: string;
}
