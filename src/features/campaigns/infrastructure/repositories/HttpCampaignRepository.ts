import { Campaign } from "../../domain/entities/Campaign.ts";
import { ICampaignRepository } from "../../domain/repositories/ICampaignRepository.ts";
import { toCampaign, toCreateCampaignResource } from "../../application/mappers/CampaignMapper.ts";
import { campaignApi } from "../api/campaignApi.ts";
import { ApiError } from "@/shared/api/apiClient.ts";

/*
 repositorio de campanas del dueno -> listar, crear y dar de baja
 solo guarda nombre, fechas y estado -> los cupones y las metricas viven aparte
*/
export class HttpCampaignRepository implements ICampaignRepository {
    private byId = new Map<number, Campaign>();

    async getAll(): Promise<Campaign[]> {
        try {
            const list = (await campaignApi.listMine()).map(toCampaign);
            this.byId = new Map(list.map(c => [c.id, c]));
            return list;
        } catch (e) {
            // si todavia no se puede traer la lista del dueno, devolvemos vacio en vez de romper
            if (e instanceof ApiError && (e.status === 404 || e.status === 501)) return [];
            throw e;
        }
    }

    async add(campaign: Campaign): Promise<Campaign> {
        const created = toCampaign(await campaignApi.create(toCreateCampaignResource(campaign)));
        this.byId.set(created.id, created);
        return created;
    }

    async remove(id: number): Promise<void> {
        const uuid = this.byId.get(id)?.uuid;
        if (!uuid) return;
        // dar de baja = marcar la campana como expirada
        await campaignApi.changeStatus(uuid, "EXPIRED");
        this.byId.delete(id);
    }
}