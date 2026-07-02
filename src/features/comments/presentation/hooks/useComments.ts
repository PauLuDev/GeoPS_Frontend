import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Comment } from "../../domain/entities/Comment.ts";
import { CommentStats } from "../../domain/entities/CommentStats.ts";
import { ICommentRepository, NewComment } from "../../domain/repositories/ICommentRepository.ts";
import { HttpCommentRepository } from "../../infrastructure/repositories/HttpCommentRepository.ts";
import { postComment } from "../../application/use-cases/PostComment.ts";
import { listComments } from "../../application/use-cases/ListComments.ts";
import { getAverageRating } from "../../application/use-cases/GetAverageRating.ts";
import { editComment, deleteComment } from "../../application/use-cases/ManageComment.ts";
import { mapApiError, AppError } from "@/shared/api/errorMapper.ts";

/**
 * hook de presentacion: resenas de un target (publicar, listar, promedio, editar, borrar)
 */
export function useComments(repository?: ICommentRepository) {
    const { t } = useTranslation();
    const repoRef = useRef<ICommentRepository>(repository ?? new HttpCommentRepository());
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<AppError | null>(null);

    /* setLoading/setError son estables -> run no necesita dependencias */
    const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            return await action();
        } catch (e) {
            setError(mapApiError(e, t));
            return null;
        } finally {
            setLoading(false);
        }
    }, [t]);

    /* funciones estables (referencia constante) para poder usarlas en deps de efectos */
    const post    = useCallback((data: NewComment): Promise<string | null> => run(() => postComment(repoRef.current, data)), [run]);
    const list    = useCallback((targetId: string, page?: number, limit?: number): Promise<Comment[] | null> => run(() => listComments(repoRef.current, targetId, page, limit)), [run]);
    const average = useCallback((targetId: string): Promise<CommentStats | null> => run(() => getAverageRating(repoRef.current, targetId)), [run]);
    const edit    = useCallback((id: string, content: string, rating: number) => run(() => editComment(repoRef.current, id, content, rating)), [run]);
    const remove  = useCallback((id: string) => run(() => deleteComment(repoRef.current, id)), [run]);

    return { loading, error, post, list, average, edit, remove };
}