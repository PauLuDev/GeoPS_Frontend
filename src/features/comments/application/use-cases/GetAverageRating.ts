import { CommentStats } from "../../domain/entities/CommentStats.ts";
import { ICommentRepository } from "../../domain/repositories/ICommentRepository.ts";

/* caso de uso: rating promedio y total de resenas de un target */
export async function getAverageRating(repo: ICommentRepository, targetId: string): Promise<CommentStats> {
    return repo.getAverageRating(targetId);
}