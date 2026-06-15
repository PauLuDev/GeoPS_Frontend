import { apiClient } from "@/shared/api/apiClient.ts";
import {
    CampaignResource,
    CreateCampaignResource,
    BackendCampaignStatus,
} from "../../application/dtos/CampaignResource.ts";

/* llama a las campanas del dueno */
const BASE = "/marketing/api/v1";

export const campaignApi = {
    /* crea una campana, el id del establecimiento sale del token */
    create: (body: CreateCampaignResource) =>
        apiClient.post<CampaignResource>(`${BASE}/campaigns`, body),

    /* campana por id */
    getById: (id: string) =>
        apiClient.get<CampaignResource>(`${BASE}/campaigns/${id}`),

    /* campanas de un establecimiento */
    listByEstablishment: (establishmentId: string) =>
        apiClient.get<CampaignResource[]>(`${BASE}/campaigns?establishmentId=${establishmentId}`),

    /* campanas del dueno logueado */
    listMine: () =>
        apiClient.get<CampaignResource[]>(`${BASE}/campaigns/mine`),

    /* cambia el estado (SCHEDULED / ACTIVE / PAUSED / EXPIRED) */
    changeStatus: (id: string, status: BackendCampaignStatus) =>
        apiClient.patch<CampaignResource>(`${BASE}/campaigns/${id}/status?status=${status}`),

    /* elimina una campana */
    remove: (id: string) =>
        apiClient.delete<void>(`${BASE}/campaigns/${id}`),
};