import { useCallback, useEffect, useRef, useState } from "react";
import { Campaign } from "../../domain/entities/Campaign.ts";
import { ICampaignRepository, EditCampaign } from "../../domain/repositories/ICampaignRepository.ts";
import { HttpCampaignRepository } from "../../infrastructure/repositories/HttpCampaignRepository.ts";

/**
 * hook de presentacion: expone el estado de campanas y las acciones
 */
export function useCampaigns(repository?: ICampaignRepository) {
    const repoRef = useRef<ICampaignRepository>(repository ?? new HttpCampaignRepository());
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setCampaigns(await repoRef.current.getAll());
        } catch (e) {
            setError(e instanceof Error ? e.message : "no se pudieron cargar las campanas");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void reload(); }, [reload]);

    const addCampaign = async (campaign: Campaign): Promise<boolean> => {
        try {
            await repoRef.current.add(campaign);
            await reload();
            return true;
        } catch (e) {
            setError(e instanceof Error ? e.message : "no se pudo crear la campaña");
            return false;
        }
    };

    const updateCampaign = async (id: number, data: EditCampaign) => {
        await repoRef.current.update(id, data);
        await reload();
    };

    const removeCampaign = async (id: number) => {
        await repoRef.current.remove(id);
        await reload();
    };

    return { campaigns, loading, error, reload, addCampaign, updateCampaign, removeCampaign };
}