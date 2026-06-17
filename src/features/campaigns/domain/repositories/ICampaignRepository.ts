import { Campaign } from "../entities/Campaign.ts";

/* datos para editar una campana */
export interface EditCampaign {
    name: string;
    startDate: string;   // yyyy-MM-dd o datetime-local
    endDate: string;
}

/* contrato del repositorio de campanas */
export interface ICampaignRepository {
    getAll(): Promise<Campaign[]>;
    add(campaign: Campaign): Promise<Campaign>;
    update(id: number, data: EditCampaign): Promise<void>;
    remove(id: number): Promise<void>;
}