import { Comment } from "../../domain/entities/Comment.ts";
import { ICommentRepository } from "../../domain/repositories/ICommentRepository.ts";

/* caso de uso: listar comentarios activos de un target (paginado) */
export async function listComments(
    repo: ICommentRepository,
    targetId: string,
    page = 1,
    limit = 10,
): Promise<Comment[]> {
    return repo.listByTarget(targetId, page, limit);
}