import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Campaign } from "../../domain/entities/Campaign.ts";
import { ICampaignRepository, EditCampaign } from "../../domain/repositories/ICampaignRepository.ts";
import { HttpCampaignRepository } from "../../infrastructure/repositories/HttpCampaignRepository.ts";
import { mapApiError, AppError } from "@/shared/api/errorMapper.ts";

/**
 * hook de presentacion: expone el estado de campanas y las acciones
 */
export function useCampaigns(repository?: ICampaignRepository) {
    const { t } = useTranslation();
    const repoRef = useRef<ICampaignRepository>(repository ?? new HttpCampaignRepository());
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AppError | null>(null);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setCampaigns(await repoRef.current.getAll());
        } catch (e) {
            setError(mapApiError(e, t));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { void reload(); }, [reload]);

    const addCampaign = async (campaign: Campaign): Promise<boolean> => {
        try {
            await repoRef.current.add(campaign);
            await reload();
            return true;
        } catch (e) {
            setError(mapApiError(e, t));
            throw e;
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