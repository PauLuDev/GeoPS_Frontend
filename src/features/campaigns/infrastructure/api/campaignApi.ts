import { apiClient } from "@/shared/api/apiClient.ts";
import {
    CampaignResource,
    CreateCampaignResource,
    UpdateCampaignResource,
    BackendCampaignStatus,
} from "../../application/dtos/CampaignResource.ts";

/* llama a las campanas del dueno */
const BASE = "/marketing/api/v1";

export const campaignApi = {
    /* crea una campana, el id del establecimiento sale del token */
    create: (body: CreateCampaignResource) =>
        apiClient.post<CampaignResource>(`${BASE}/campaigns`, body),

    /* edita una campana (nombre y fechas) */
    update: (id: string, body: UpdateCampaignResource) =>
        apiClient.put<CampaignResource>(`${BASE}/campaigns/${id}`, body),

    /* campanas de un establecimiento */
    listByEstablishment: (establishmentId: string) =>
        apiClient.get<CampaignResource[]>(`${BASE}/campaigns?establishmentId=${establishmentId}`),

    /* cambia el estado (SCHEDULED / ACTIVE / PAUSED / EXPIRED) */
    changeStatus: (id: string, status: BackendCampaignStatus) =>
        apiClient.patch<CampaignResource>(`${BASE}/campaigns/${id}/status?status=${status}`),

    /* elimina una campana */
    remove: (id: string) =>
        apiClient.delete<void>(`${BASE}/campaigns/${id}`),
};