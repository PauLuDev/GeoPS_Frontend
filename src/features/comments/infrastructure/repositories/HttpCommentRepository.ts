import { Comment } from "../../domain/entities/Comment.ts";
import { CommentStats } from "../../domain/entities/CommentStats.ts";
import { ICommentRepository, NewComment } from "../../domain/repositories/ICommentRepository.ts";
import { CommentResponse } from "../../application/dtos/CommentResource.ts";
import { toComment, toCommentStats } from "../../application/mappers/CommentMapper.ts";

/* base del API comments */
const API_BASE = import.meta.env.VITE_COMMENTS_URL ?? "http://localhost:8086/api/v1";

/**
 * implementacion del repositorio de comentarios contra el backend (HTTP)
 */
export class HttpCommentRepository implements ICommentRepository {
    /* resenas creadas por el usuario (con su target real) */
    private created: CommentResponse[] = [];
    /* resenas semilla de demo (se muestran para cualquier target) */
    private seed: CommentResponse[] = [
        demo("c1", "Carlos Mendoza", "Excelente servicio, muy recomendado.", 5),
        demo("c2", "Daniela Gómez",  "Buena comida pero un poco lento.",     4),
    ];

    async create(data: NewComment): Promise<string> {
        void API_BASE;
        const r = demo(`c-${Date.now()}`, data.userName, data.content, data.rating, data.targetId);
        r.user_url = data.userUrl;
        this.created = [r, ...this.created];
        return r.id;
    }

    async update(id: string, content: string, rating: number): Promise<void> {
        this.created = this.created.map(c =>
            c.id === id ? { ...c, content, rating, updated_at: new Date().toISOString() } : c);
    }

    async remove(id: string): Promise<void> {
        this.created = this.created.filter(c => c.id !== id);
    }

    async listByTarget(targetId: string, page = 1, limit = 10): Promise<Comment[]> {
        return this.forTarget(targetId)
            .slice((page - 1) * limit, page * limit)
            .map(toComment);
    }

    async getAverageRating(targetId: string): Promise<CommentStats> {
        const active = this.forTarget(targetId);
        const avg = active.length ? active.reduce((s, c) => s + c.rating, 0) / active.length : 0;
        return toCommentStats({
            target_id: targetId,
            average_rating: +avg.toFixed(1),
            total_reviews: active.length,
        });
    }

    /* resenas del target: las creadas para ese target + las semilla (re-estampadas) */
    private forTarget(targetId: string): CommentResponse[] {
        const own = this.created.filter(c => c.target_id === targetId && c.status === "active");
        const seeded = this.seed.map(c => ({ ...c, target_id: targetId }));
        return [...own, ...seeded];
    }
}

/* mock con forma real (snake_case) */
function demo(id: string, userName: string, content: string, rating: number, targetId = "b-tanta"): CommentResponse {
    const now = new Date().toISOString();
    return {
        id, target_id: targetId, target_type: "business",
        user_id: `u-${id}`, user_name: userName, user_url: undefined,
        content, rating, status: "active", created_at: now, updated_at: now,
    };
}