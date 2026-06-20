import { ICommentRepository } from "../../domain/repositories/ICommentRepository.ts";
import { isValidRating } from "../../domain/value-objects/Rating.ts";

/* caso de uso: editar un comentario propio */
export async function editComment(
    repo: ICommentRepository,
    id: string,
    content: string,
    rating: number,
): Promise<void> {
    if (!content.trim()) throw new Error("El comentario no puede estar vacío");
    if (!isValidRating(rating)) throw new Error("La calificación debe ser de 1 a 5");
    return repo.update(id, content, rating);
}

/* caso de uso: eliminar (borrado logico) un comentario propio */
export async function deleteComment(repo: ICommentRepository, id: string): Promise<void> {
    return repo.remove(id);
}