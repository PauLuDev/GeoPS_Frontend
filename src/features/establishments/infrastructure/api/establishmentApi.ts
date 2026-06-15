import { apiClient } from "@/shared/api/apiClient.ts";
import {
    EstablishmentResource,
    CreateEstablishmentResource,
    UpdateEstablishmentResource,
    CategoryResource,
} from "../../application/dtos/EstablishmentResource.ts";

/* llama a los establecimientos y sus categorias */
const BASE = "/business/api/v1";

export const establishmentApi = {
    /* establecimientos cercanos a un punto */
    nearby: (latitude: number, longitude: number, radiusMeters = 5000) =>
        apiClient.get<EstablishmentResource[]>(
            `${BASE}/establishments/nearby?latitude=${latitude}&longitude=${longitude}&radiusMeters=${radiusMeters}`,
        ),

    /* establecimientos del dueno logueado */
    mine: () =>
        apiClient.get<EstablishmentResource[]>(`${BASE}/establishments/mine`),

    /* crea un establecimiento */
    create: (body: CreateEstablishmentResource) =>
        apiClient.post<EstablishmentResource>(`${BASE}/establishments`, body),

    /* edita un establecimiento por id */
    update: (id: string, body: UpdateEstablishmentResource) =>
        apiClient.put<EstablishmentResource>(`${BASE}/establishments/${id}`, body),

    /* elimina un establecimiento por id */
    remove: (id: string) =>
        apiClient.delete<void>(`${BASE}/establishments/${id}`),

    /* catalogo de categorias */
    listCategories: () =>
        apiClient.get<CategoryResource[]>(`${BASE}/categories`),

};