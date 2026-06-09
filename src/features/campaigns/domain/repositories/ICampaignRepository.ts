import { Campaign } from "../entities/Campaign.ts";

/**
 * puerto (interface) del repositorio de campanas
 * la capa de dominio define el contrato; infraestructura lo implementa
 */
export interface ICampaignRepository {
    getAll(): Campaign[];
    add(campaign: Campaign): void;
    remove(id: number): void;
}