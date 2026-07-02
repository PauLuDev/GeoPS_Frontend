/**
 * dTOs (comment-service · Go) JSON en snake_case
 */

/* respuesta de un comentario */
export interface CommentResponse {
    id: string;
    target_id: string;
    target_type: string;
    user_id: string;
    user_name: string;
    user_url?: string;
    content: string;
    rating: number;
    status: string;
    created_at: string;
    updated_at: string;
}

/* body de creacion: POST /api/v1/comments */
export interface CreateCommentResource {
    target_id: string;
    target_type: string;
    user_name: string;
    user_url?: string;
    content: string;
    rating: number;
}

/* respuesta de rating promedio */
export interface AverageRatingResponse {
    target_id: string;
    average_rating: number;
    total_reviews: number;
}

/* lista paginada */
export interface CommentsListResponse {
    data: CommentResponse[];
    page: number;
    limit: number;
}