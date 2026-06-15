import { Campaign } from "../entities/Campaign.ts";

/* contrato del repositorio de campanas */
export interface ICampaignRepository {
    getAll(): Promise<Campaign[]>;
    add(campaign: Campaign): Promise<Campaign>;
    remove(id: number): Promise<void>;
}