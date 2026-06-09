import { useRef, useState } from "react";
import { Campaign } from "../../domain/entities/Campaign.ts";
import { ICampaignRepository } from "../../domain/repositories/ICampaignRepository.ts";
import { HttpCampaignRepository } from "../../infrastructure/repositories/HttpCampaignRepository.ts";

/**
 * hook de presentacion: expone el estado de campanas y las acciones,
 * apoyandose en el repositorio (infraestructura)
 */
export function useCampaigns(repository?: ICampaignRepository) {
    const repoRef = useRef<ICampaignRepository>(repository ?? new HttpCampaignRepository());
    const [campaigns, setCampaigns] = useState<Campaign[]>(() => repoRef.current.getAll());

    const addCampaign = (campaign: Campaign) => {
        repoRef.current.add(campaign);
        setCampaigns(repoRef.current.getAll());
    };

    const removeCampaign = (id: number) => {
        repoRef.current.remove(id);
        setCampaigns(repoRef.current.getAll());
    };

    return { campaigns, addCampaign, removeCampaign };
}