import { CommentStatus } from "../value-objects/CommentStatus.ts";
import { TargetType } from "../value-objects/TargetType.ts";

/**
 * resena/comentario de un usuario sobre un negocio o campana
*/
export interface Comment {
    id: string;             // objectID (24-char hex)
    targetId: string;       // UUID del negocio/campana
    targetType: TargetType;
    userId: string;         // UUID
    userName: string;       // datos de perfil denormalizados
    userUrl?: string;       // avatar
    content: string;
    rating: number;         // 1-5
    status: CommentStatus;
    createdAt: string;
    updatedAt: string;
}