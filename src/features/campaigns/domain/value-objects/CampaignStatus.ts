import { CampaignStatus } from "../entities/Campaign.ts";

/**
 * value object: metadatos visuales y reglas del estado de una campana
 */
export const STATUS_COLOR: Record<CampaignStatus, string> = {
    live: "var(--brand-strong)", draft: "var(--ink-3)", scheduled: "var(--accent-2)", ended: "var(--ink-3)",
};
export const STATUS_BG: Record<CampaignStatus, string> = {
    live: "var(--brand-soft)", draft: "var(--bg-sunken)", scheduled: "var(--accent-2-soft)", ended: "var(--bg-sunken)",
};
export const STATUS_LABEL: Record<CampaignStatus, string> = {
    live: "En vivo", draft: "Borrador", scheduled: "Programada", ended: "Finalizada",
};

/* deriva el estado inicial a partir de la fecha de inicio */
export function deriveStatus(startISO: string): CampaignStatus {
    return startISO > new Date().toISOString() ? "scheduled" : "live";
}