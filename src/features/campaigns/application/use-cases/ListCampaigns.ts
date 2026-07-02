import { Campaign, CampaignStatus } from "../../domain/entities/Campaign.ts";

/**
 * caso de uso: listar campanas con filtro por estado y busqueda por nombre
 */

export type StatusFilter = CampaignStatus | "all";

export function filterCampaigns(
    campaigns: Campaign[],
    filter: StatusFilter,
    search: string,
): Campaign[] {
    const q = search.trim().toLowerCase();
    return campaigns.filter(c => {
        const matchFilter = filter === "all" || c.status === filter;
        const matchSearch = c.name.toLowerCase().includes(q);
        return matchFilter && matchSearch;
    });
}

export function countByStatus(campaigns: Campaign[], status: CampaignStatus): number {
    return campaigns.filter(c => c.status === status).length;
}