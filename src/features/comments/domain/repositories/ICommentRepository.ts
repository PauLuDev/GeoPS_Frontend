import { Comment } from "../entities/Comment.ts";
import { CommentStats } from "../entities/CommentStats.ts";
import { TargetType } from "../value-objects/TargetType.ts";

/* datos para crear un comentario */
export interface NewComment {
    targetId: string;
    targetType: TargetType;
    userName: string;
    userUrl?: string;
    content: string;
    rating: number;
}

/**
 * puerto (interface) del repositorio de comentarios
 * regla de negocio: un comentario activo por usuario y target
 */
export interface ICommentRepository {
    create(data: NewComment): Promise<string>;                 // devuelve el id
    update(id: string, content: string, rating: number): Promise<void>;
    remove(id: string): Promise<void>;                          // borrado logico
    listByTarget(targetId: string, page?: number, limit?: number): Promise<Comment[]>;
    getAverageRating(targetId: string): Promise<CommentStats>;
}