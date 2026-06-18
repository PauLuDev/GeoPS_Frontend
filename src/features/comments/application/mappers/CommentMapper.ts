import { Comment } from "../../domain/entities/Comment.ts";
import { CommentStats } from "../../domain/entities/CommentStats.ts";
import { CommentStatus } from "../../domain/value-objects/CommentStatus.ts";
import { TargetType } from "../../domain/value-objects/TargetType.ts";
import { NewComment } from "../../domain/repositories/ICommentRepository.ts";
import { CommentResponse, AverageRatingResponse, CreateCommentResource } from "../dtos/CommentResource.ts";

/* DTO (snake_case) -> entidad de dominio */
export function toComment(r: CommentResponse): Comment {
    return {
        id: r.id,
        targetId: r.target_id,
        targetType: r.target_type as TargetType,
        userId: r.user_id,
        userName: r.user_name,
        userUrl: r.user_url,
        content: r.content,
        rating: r.rating,
        status: r.status as CommentStatus,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}

/* respuesta de promedio */
export function toCommentStats(r: AverageRatingResponse): CommentStats {
    return {
        targetId: r.target_id,
        averageRating: r.average_rating,
        totalReviews: r.total_reviews,
    };
}

/* datos de creacion */
export function toCreateCommentResource(data: NewComment): CreateCommentResource {
    return {
        target_id: data.targetId,
        target_type: data.targetType,
        user_name: data.userName,
        user_url: data.userUrl,
        content: data.content,
        rating: data.rating,
    };
}