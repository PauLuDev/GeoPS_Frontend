import { Campaign } from "../../domain/entities/Campaign.ts";
import { ICampaignRepository, EditCampaign } from "../../domain/repositories/ICampaignRepository.ts";
import { toCampaign, toCampaignCoupon, toCreateCampaignResource, toUpdateCampaignResource, toNewCoupon } from "../../application/mappers/CampaignMapper.ts";
import { CampaignResource } from "../../application/dtos/CampaignResource.ts";
import { campaignApi } from "../api/campaignApi.ts";
import { couponApi } from "@/features/coupons/infrastructure/api/couponApi.ts";
import { toCreateCouponResource } from "@/features/coupons/application/mappers/CouponMapper.ts";
import { establishmentApi } from "@/features/establishments/infrastructure/api/establishmentApi.ts";
import { getCurrentUser } from "@/features/auth/application/session.ts";
import { ApiError } from "@/shared/api/apiClient.ts";

/*
 repositorio de campanas del dueno -> listar, crear y dar de baja
 no hay lista directa -> se traen los establecimientos del dueno y se juntan las campanas de cada uno
 solo guarda nombre, fechas y estado -> los cupones y las metricas viven aparte
*/
export class HttpCampaignRepository implements ICampaignRepository {
    private byId = new Map<number, Campaign>();

    async getAll(): Promise<Campaign[]> {
        const me = getCurrentUser();
        if (!me?.id) return [];
        try {
            const establishments = await establishmentApi.byOwner(me.id);
            const lists = await Promise.all(
                establishments.map(e =>
                    campaignApi.listByEstablishment(e.id).catch((): CampaignResource[] => []),
                ),
            );
            const list = lists.flat().map(toCampaign);
            // cada campana trae sus cupones aparte -> los pedimos por campana y los embebemos
            await Promise.all(list.map(async c => {
                if (!c.uuid) return;
                const coupons = await couponApi.listByCampaign(c.uuid).catch(() => []);
                c.coupons = coupons.map(toCampaignCoupon);
            }));
            this.byId = new Map(list.map(c => [c.id, c]));
            return list;
        } catch (e) {
            // si todavia no se puede traer, devolvemos vacio en vez de romper
            if (e instanceof ApiError && (e.status === 404 || e.status === 501)) return [];
            throw e;
        }
    }

    async add(campaign: Campaign): Promise<Campaign> {
        const created = toCampaign(await campaignApi.create(toCreateCampaignResource(campaign)));
        this.byId.set(created.id, created);
        /* persistir los cupones que se agregaron en la campana */
        const estId = created.establishmentId;
        if (estId && created.uuid && campaign.coupons.length > 0) {
            await Promise.all(campaign.coupons.map(c =>
                couponApi.create(toCreateCouponResource(toNewCoupon(c, estId, created.uuid!))).catch(() => undefined),
            ));
        }
        return created;
    }

    async update(id: number, data: EditCampaign): Promise<void> {
        const uuid = this.byId.get(id)?.uuid;
        if (!uuid) return;
        await campaignApi.update(uuid, toUpdateCampaignResource(data));
    }

    async remove(id: number): Promise<void> {
        const uuid = this.byId.get(id)?.uuid;
        if (!uuid) return;
        // dar de baja = marcar la campana como expirada
        await campaignApi.changeStatus(uuid, "EXPIRED");
        this.byId.delete(id);
    }
}