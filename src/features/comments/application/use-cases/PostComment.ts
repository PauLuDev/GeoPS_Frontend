import { ICommentRepository, NewComment } from "../../domain/repositories/ICommentRepository.ts";
import { isValidRating } from "../../domain/value-objects/Rating.ts";

/**
 * caso de uso: publicar una resena
 * regla: rating 1-5 y contenido obligatorio (un comentario activo por target)
 */
export async function postComment(repo: ICommentRepository, data: NewComment): Promise<string> {
    if (!data.content.trim()) throw new Error("El comentario no puede estar vacío");
    if (!isValidRating(data.rating)) throw new Error("La calificación debe ser de 1 a 5");
    return repo.create(data);
}