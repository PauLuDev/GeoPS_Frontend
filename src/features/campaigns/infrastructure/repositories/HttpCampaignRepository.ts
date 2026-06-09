import { Campaign } from "../../domain/entities/Campaign.ts";
import { CampaignCoupon } from "../../domain/entities/CampaignCoupon.ts";
import { ICampaignRepository } from "../../domain/repositories/ICampaignRepository.ts";
// contrato de integracion (marketing-service):
// import { toCampaign, toCreateCampaignResource } from "../../application/mappers/CampaignMapper.ts";

/* base del API marketing */
const API_BASE = import.meta.env.VITE_MARKETING_URL ?? "http://localhost:8082/api/v1";

const demoCoupon = (
    id: string, title: string, discount: string,
    orig: number, final: number, stock: number, exp: string,
): CampaignCoupon => ({
    id, title, discount, originalPrice: orig, finalPrice: final, stock,
    expiresIn: exp, restrictions: ["No acumulable con otras promociones", "Un cupón por persona"],
});

/* datos mock temporales */
const SEED: Campaign[] = [
    { id: 1, name: "2x1 en lomo saltado",            description: "", category: "Día de la Madre", startDate: "", endDate: "", status: "live",      coupons: [demoCoupon("d1", "2x1 en lomo saltado", "50%", 48, 24, 23, "2h 14m")], views: 1240, reserved: 412, redeemed: 289, stock: 23,  total: 60,   end: "2h 14m" },
    { id: 2, name: "Almuerzo ejecutivo",              description: "", category: "Navidad",         startDate: "", endDate: "", status: "live",      coupons: [demoCoupon("d2", "Almuerzo ejecutivo S/24", "30%", 35, 24, 41, "5h 02m")], views: 892,  reserved: 241, redeemed: 188, stock: 41,  total: 80,   end: "5h 02m" },
    { id: 3, name: "Postre gratis con plato fuerte",  description: "", category: "San Valentín",    startDate: "", endDate: "", status: "live",      coupons: [demoCoupon("d3", "Postre gratis", "100%", 18, 0, 18, "1d 4h")], views: 512,  reserved: 98,  redeemed: 62,  stock: 18,  total: 30,   end: "1d 4h"  },
    { id: 4, name: "Happy Hour piscos",               description: "", category: "Fiestas Patrias", startDate: "", endDate: "", status: "draft",     coupons: [], views: 0,    reserved: 0,   redeemed: 0,   stock: 0,   total: 50,   end: "—"      },
    { id: 5, name: "Día de la Madre · menú especial", description: "", category: "Día de la Madre", startDate: "", endDate: "", status: "scheduled", coupons: [], views: 0,    reserved: 0,   redeemed: 0,   stock: 0,   total: 120,  end: "en 8d"  },
    { id: 6, name: "Lomo Fest 2026",                  description: "", category: "Fiestas Patrias", startDate: "", endDate: "", status: "ended",     coupons: [], views: 3408, reserved: 910, redeemed: 702, stock: 0,   total: 1000, end: "hace 12d" },
];

/**
 * implementacion del repositorio de campanas contra el backend (HTTP)
 */
export class HttpCampaignRepository implements ICampaignRepository {
    private campaigns: Campaign[];

    constructor(seed: Campaign[] = SEED) {
        this.campaigns = [...seed];
    }

    getAll(): Campaign[] {
        void API_BASE;
        return [...this.campaigns];
    }

    add(campaign: Campaign): void {
        this.campaigns = [campaign, ...this.campaigns];
    }

    remove(id: number): void {
        // nota: el backend no expone DELETE; usa PATCH /api/v1/campaigns/{uuid}/status?status=EXPIRED
        this.campaigns = this.campaigns.filter(c => c.id !== id);
    }
}
