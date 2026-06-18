import { apiClient } from "@/shared/api/apiClient.ts";
import {
    CommentsListResponse,
    AverageRatingResponse,
    CreateCommentResource,
} from "../../application/dtos/CommentResource.ts";

/*
 llama a los endpoints de comentarios
*/
const BASE = "/comments/api/v1/comments";

export const commentApi = {
    /* comentarios de un negocio o campana, paginado */
    listByTarget: (targetId: string, page = 1, limit = 10) =>
        apiClient.get<CommentsListResponse>(`${BASE}?targetId=${targetId}&page=${page}&limit=${limit}`),

    /* rating promedio y total */
    averageRating: (targetId: string) =>
        apiClient.get<AverageRatingResponse>(`${BASE}/${targetId}/average-rating`),

    /* crea un comentario, devuelve el id */
    create: (body: CreateCommentResource) =>
        apiClient.post<{ id: string }>(BASE, body),

    /* edita contenido y rating */
    update: (id: string, body: { content: string; rating: number }) =>
        apiClient.put<void>(`${BASE}/${id}`, body),

    /* elimina un comentario */
    remove: (id: string) =>
        apiClient.delete<void>(`${BASE}/${id}`),
};