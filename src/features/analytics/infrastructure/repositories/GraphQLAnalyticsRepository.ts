import { DashboardStats } from "../../domain/value-objects/DashboardStats.ts";
import { CampaignAnalytics, AnalyticsCampaignStatus } from "../../domain/entities/CampaignAnalytics.ts";
import { IAnalyticsRepository, Timeframe } from "../../domain/repositories/IAnalyticsRepository.ts";

/* endpoint GraphQL del analytics-service (.NET) */
const GRAPHQL_URL = import.meta.env.VITE_ANALYTICS_URL ?? "http://localhost:8084/graphql";

/**
 * implementacion del repositorio de analytics
 * analytics-service se alimenta por eventos RabbitMQ (VIEW/RESERVE/REDEEM)
 * publicados por marketing; este repo solo consulta los read-models
 */
export class GraphQLAnalyticsRepository implements IAnalyticsRepository {

    async getEstablishmentDashboard(_establishmentId: string, _timeframeDays: Timeframe): Promise<DashboardStats> {
        void GRAPHQL_URL;
        return MOCK_DASHBOARD;
    }

    async getCampaigns(_establishmentId: string, status?: AnalyticsCampaignStatus): Promise<CampaignAnalytics[]> {
        return status ? MOCK_CAMPAIGNS.filter(c => c.status === status) : MOCK_CAMPAIGNS;
    }

    async getCampaignDetails(campaignId: string): Promise<CampaignAnalytics | null> {
        return MOCK_CAMPAIGNS.find(c => c.id === campaignId) ?? null;
    }
}

/* datos mock */
const kpi = (value: string, delta: string, trend: string, sparkline: number[]) => ({ value, delta, trend, sparkline });

const MOCK_DASHBOARD: DashboardStats = {
    kpis: {
        views:          kpi("4,820", "+12%", "up",   [12, 18, 15, 22, 28, 26, 34]),
        uniqueViews:    kpi("3,140", "+9%",  "up",   [10, 14, 13, 18, 21, 20, 25]),
        reservations:   kpi("1,204", "+18%", "up",   [4, 6, 5, 8, 9, 11, 13]),
        conversionRate: kpi("25%",   "-2%",  "down", [28, 27, 26, 25, 26, 24, 25]),
    },
    performanceData: [
        { label: "Lun", reserved: 120, redeemed: 80 },
        { label: "Mar", reserved: 160, redeemed: 110 },
        { label: "Mié", reserved: 140, redeemed: 95 },
        { label: "Jue", reserved: 200, redeemed: 150 },
        { label: "Vie", reserved: 260, redeemed: 190 },
        { label: "Sáb", reserved: 300, redeemed: 220 },
        { label: "Dom", reserved: 180, redeemed: 130 },
    ],
    conversionFunnel: {
        views:        { count: 4820, percentage: 100 },
        reservations: { count: 1204, percentage: 25 },
        redemptions:  { count: 902,  percentage: 18.7 },
    },
    heatmapPoints: [
        { latitude: -12.1232, longitude: -77.0301, weight: 0.9, campaignId: "camp-1" },
        { latitude: -12.1185, longitude: -77.0265, weight: 0.6, campaignId: "camp-2" },
    ],
    topCampaigns: [
        { id: "camp-1", name: "2x1 en lomo saltado",   views: 1240, conversionRate: 28, stockUsed: 37, stockTotal: 60, colorHex: "#22c55e" },
        { id: "camp-2", name: "Almuerzo ejecutivo",     views: 892,  conversionRate: 21, stockUsed: 39, stockTotal: 80, colorHex: "#3b82f6" },
    ],
};

const MOCK_CAMPAIGNS: CampaignAnalytics[] = [
    { id: "camp-1", name: "2x1 en lomo saltado", startDate: "", status: "ACTIVE",
      analytics: { viewsCount: 1240, uniqueViewsCount: 980, reservationsCount: 412, redemptionsCount: 289, conversionRate: 28 } },
    { id: "camp-2", name: "Almuerzo ejecutivo", startDate: "", status: "ACTIVE",
      analytics: { viewsCount: 892, uniqueViewsCount: 700, reservationsCount: 241, redemptionsCount: 188, conversionRate: 21 } },
];