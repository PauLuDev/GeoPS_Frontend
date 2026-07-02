import { Campaign } from "../../domain/entities/Campaign.ts";
import { daysDiff, isRangeValid, isFutureOrToday } from "../../domain/value-objects/Duration.ts";
import { deriveStatus } from "../../domain/value-objects/CampaignStatus.ts";
import { CampaignDraftInput, CampaignErrors } from "../dtos/CampaignDraft.ts";

/**
 * caso de uso: validar y construir una campana a partir del formulario
 */

export function validateCampaign(draft: CampaignDraftInput): CampaignErrors {
    const hasStart = !!draft.startDate;
    const hasEnd = !!draft.endDate;
    const endBeforeStart = hasStart && hasEnd && !isRangeValid(draft.startDate, draft.endDate);
    return {
        name:           !draft.name.trim(),
        category:       !draft.category.trim(),
        start:          !hasStart,
        startPast:      hasStart && !isFutureOrToday(draft.startDate),
        end:            !hasEnd || endBeforeStart,
        endPast:        hasEnd && !isFutureOrToday(draft.endDate),
        endBeforeStart,
        coupons:        draft.coupons.length === 0,
    };
}

export function isCampaignValid(errors: CampaignErrors): boolean {
    return !Object.values(errors).some(Boolean);
}

/* construye la campana final, asume que el draft ya fue validado */
export function buildCampaign(draft: CampaignDraftInput): Campaign {
    const totalStock = draft.coupons.reduce((s, c) => s + c.stock, 0);
    const status     = deriveStatus(draft.startDate);
    return {
        id: Date.now(),
        name: draft.name.trim(),
        description: draft.description,
        category: draft.category.trim(),
        startDate: draft.startDate,
        endDate: draft.endDate,
        status,
        coupons: draft.coupons,
        views: 0, reserved: 0, redeemed: 0,
        stock: totalStock,
        total: totalStock,
        end: status === "scheduled" ? `en ${daysDiff(draft.startDate)}d` : `${daysDiff(draft.endDate)}d`,
    };
}