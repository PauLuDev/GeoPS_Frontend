import { Comment } from "../../domain/entities/Comment.ts";
import { CommentStats } from "../../domain/entities/CommentStats.ts";
import { ICommentRepository, NewComment } from "../../domain/repositories/ICommentRepository.ts";
import { toComment, toCommentStats, toCreateCommentResource } from "../../application/mappers/CommentMapper.ts";
import { commentApi } from "../api/commentApi.ts";

/* implementa el puerto de comentarios usando el datasource y mapea a dominio */
export class HttpCommentRepository implements ICommentRepository {

    async create(data: NewComment): Promise<string> {
        const res = await commentApi.create(toCreateCommentResource(data));
        return res.id;
    }

    async update(id: string, content: string, rating: number): Promise<void> {
        await commentApi.update(id, { content, rating });
    }

    async remove(id: string): Promise<void> {
        await commentApi.remove(id);
    }

    async listByTarget(targetId: string, page = 1, limit = 10): Promise<Comment[]> {
        const res = await commentApi.listByTarget(targetId, page, limit);
        return res.data.map(toComment);
    }

    async getAverageRating(targetId: string): Promise<CommentStats> {
        const res = await commentApi.averageRating(targetId);
        return toCommentStats(res);
    }
}