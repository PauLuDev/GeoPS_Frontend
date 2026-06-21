import { getToken } from "@/shared/api/tokenStore.ts";
import { DashboardStats } from "../../domain/value-objects/DashboardStats.ts";
import { CampaignAnalytics, AnalyticsCampaignStatus } from "../../domain/entities/CampaignAnalytics.ts";

/*
 consulta las metricas por graphql
 se llama directo al endpoint, con el token
*/
const GRAPHQL_URL = import.meta.env.VITE_ANALYTICS_URL ?? "http://localhost:5003/graphql";

/* arg opcional de tipo Guid (string): se omite si no hay valor */
const guidArg = (name: string, v?: string): string => (v ? `, ${name}: "${v}"` : "");

/* manda una query y devuelve el campo pedido */
async function graphql<T>(query: string, field: string): Promise<T> {
    const token = getToken();
    const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query }),
    });
    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors[0]?.message ?? "error en analytics graphql");
    return json.data[field] as T;
}

/* campos del dashboard */
const DASHBOARD_FIELDS = `
  kpis {
    views { value delta trend sparkline }
    uniqueViews { value delta trend sparkline }
    reservations { value delta trend sparkline }
    conversionRate { value delta trend sparkline }
  }
  performanceData { label reserved redeemed }
  conversionFunnel {
    views { count percentage }
    reservations { count percentage }
    redemptions { count percentage }
  }
  heatmapPoints { latitude longitude weight campaignId }
  topCampaigns { id name views conversionRate stockUsed stockTotal colorHex }
`;

/* campos de una campana */
const CAMPAIGN_FIELDS = `
  id name startDate endDate status
  analytics { viewsCount uniqueViewsCount reservationsCount redemptionsCount conversionRate }
`;

export const analyticsApi = {
    /* metricas del dashboard en una ventana de dias */
    dashboard: (establishmentId: string, timeframeDays: number) =>
        graphql<DashboardStats>(
            `query { establishmentDashboard(establishmentId: "${establishmentId}", timeframeDays: ${timeframeDays}) { ${DASHBOARD_FIELDS} } }`,
            "establishmentDashboard",
        ),

    /* campanas, opcionalmente filtradas por estado */
    campaigns: (establishmentId: string, status?: AnalyticsCampaignStatus) =>
        graphql<CampaignAnalytics[]>(
            `query { campaigns(establishmentId: "${establishmentId}"${status ? `, status: ${status}` : ""}) { ${CAMPAIGN_FIELDS} } }`,
            "campaigns",
        ),

    /* detalle de una campana */
    campaignDetails: (campaignId: string) =>
        graphql<CampaignAnalytics | null>(
            `query { campaignDetails(campaignId: "${campaignId}") { ${CAMPAIGN_FIELDS} } }`,
            "campaignDetails",
        ),

    /* registra que un cliente abrio el detalle de un cupon -> interaccion VIEW */
    recordCouponView: (p: {
        couponId: string; establishmentId: string; campaignId?: string;
        userId?: string; latitude: number; longitude: number;
    }) =>
        graphql<boolean>(
            `mutation { recordCampaignInteraction(establishmentId: "${p.establishmentId}", couponId: "${p.couponId}"`
            + `${guidArg("campaignId", p.campaignId)}${guidArg("userId", p.userId)}`
            + `, interactionType: VIEW, latitude: ${p.latitude}, longitude: ${p.longitude}) }`,
            "recordCampaignInteraction",
        ),

    /* registra que un cliente abrio el detalle de un establecimiento */
    recordEstablishmentView: (p: { establishmentId: string; userId?: string; latitude: number; longitude: number }) =>
        graphql<boolean>(
            `mutation { recordEstablishmentView(establishmentId: "${p.establishmentId}"`
            + `${guidArg("userId", p.userId)}, latitude: ${p.latitude}, longitude: ${p.longitude}) }`,
            "recordEstablishmentView",
        ),
};