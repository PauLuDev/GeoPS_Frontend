/**
 * read-model: estadisticas agregadas de rating de un target
 * alimenta el `rating` / `totalReviews` que se muestran en los locales
 */
export interface CommentStats {
    targetId: string;
    averageRating: number;
    totalReviews: number;
}