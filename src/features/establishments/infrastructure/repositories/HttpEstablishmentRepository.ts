import { Business } from "@/shared/types.ts";
import { IEstablishmentRepository } from "../../domain/repositories/IEstablishmentRepository.ts";
import {
    toBusiness,
    toCreateEstablishmentResource,
    toUpdateEstablishmentResource,
} from "../../application/mappers/EstablishmentMapper.ts";
import { establishmentApi } from "../api/establishmentApi.ts";
import { ApiError } from "@/shared/api/apiClient.ts";
import { getCurrentUser } from "@/features/auth/application/session.ts";

/*
 repositorio de establecimientos del dueno -> listar, crear, editar y borrar
 solo se guardan nombre, ruc, direccion, horario y ubicacion -> fotos, logo, distrito y descripcion todavia no se pueden guardar
*/
export class HttpEstablishmentRepository implements IEstablishmentRepository {
    /* ids ya guardados, para saber si toca crear o editar */
    private knownIds = new Set<string>();

    async getAll(): Promise<Business[]> {
        const me = getCurrentUser();
        if (!me?.id) return [];
        try {
            const list = (await establishmentApi.byOwner(me.id)).map(toBusiness);
            this.knownIds = new Set(list.map(b => b.id));
            return list;
        } catch (e) {
            // si todavia no se puede traer la lista del dueno, devolvemos vacio en vez de romper
            if (e instanceof ApiError && (e.status === 404 || e.status === 501)) return [];
            throw e;
        }
    }

    async save(establishment: Business): Promise<Business> {
        if (this.knownIds.has(establishment.id)) {
            const updated = toBusiness(
                await establishmentApi.update(establishment.id, toUpdateEstablishmentResource(establishment)),
            );
            this.knownIds.add(updated.id);
            return updated;
        }
        const created = toBusiness(await establishmentApi.create(toCreateEstablishmentResource(establishment)));
        this.knownIds.add(created.id);
        return created;
    }

    async remove(id: string): Promise<void> {
        await establishmentApi.remove(id);
        this.knownIds.delete(id);
    }
}