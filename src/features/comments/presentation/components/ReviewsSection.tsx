import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { getCurrentUser } from "@/features/auth/application/session.ts";
import { useProfile } from "@/features/auth/presentation/hooks/useProfile.ts";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { Comment } from "../../domain/entities/Comment.ts";
import { CommentStats } from "../../domain/entities/CommentStats.ts";
import { TargetType } from "../../domain/value-objects/TargetType.ts";
import { useComments } from "../hooks/useComments.ts";
import { ReviewForm } from "./ReviewForm.tsx";

interface ReviewsSectionProps {
    targetId: string;
    targetType: TargetType;
    /** valores denormalizados a mostrar mientras no llega el promedio real */
    fallbackRating?: number;
    fallbackCount?: number;
}

function fmtDate(iso: string, locale: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

/* construye el nombre visible del autor a partir del perfil */
function buildUserName(profile: { firstName?: string | null; lastName?: string | null } | null, fallback?: string): string {
    const first = profile?.firstName?.trim() ?? "";
    const last = profile?.lastName?.trim() ?? "";
    if (first && last && last !== first) return `${first} ${last}`;
    if (first) return first;
    return fallback?.trim() || "Invitado";
}

/* seccion de resenas reutilizable -> promedio + formulario + lista (negocio o campana) */
export function ReviewsSection({ targetId, targetType, fallbackRating, fallbackCount }: ReviewsSectionProps) {
    const { t, i18n } = useTranslation();
    const { profile } = useProfile();
    const me = getCurrentUser();
    const dateLocale = i18n.language.startsWith("en") ? "en-US" : "es-PE";
    const { list, average, post, edit, remove } = useComments();
    const [reviews, setReviews] = useState<Comment[]>([]);
    const [stats, setStats]     = useState<CommentStats | null>(null);
    const [editingId, setEditingId]   = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editedId, setEditedId]     = useState<string | null>(null);

    /* datos del autor: nombre desde el perfil (firstName + lastName) y avatar */
    const userName = useMemo(() => buildUserName(profile, me?.username), [profile, me]);
    const userUrl  = profile?.avatarUrl ?? undefined;

    /* al cambiar de target, limpia para no mostrar las del anterior */
    const [prevId, setPrevId] = useState(targetId);
    if (targetId !== prevId) { setPrevId(targetId); setReviews([]); setStats(null); setEditingId(null); setDeletingId(null); }

    const refresh = async () => {
        const [r, s] = await Promise.all([list(targetId), average(targetId)]);
        if (r) setReviews(r);
        if (s) setStats(s);
    };

    useEffect(() => {
        let alive = true;
        list(targetId).then(r => { if (alive && r) setReviews(r); });
        average(targetId).then(s => { if (alive && s) setStats(s); });
        return () => { alive = false; };
    }, [targetId, list, average]);

    const handlePost = async (content: string, rating: number): Promise<boolean> => {
        const id = await post({ targetId, targetType, userName, userUrl, content, rating });
        if (!id) return false;
        await refresh();
        return true;
    };

    const handleEdit = async (id: string, content: string, rating: number): Promise<boolean> => {
        await edit(id, content, rating);
        await refresh();
        setEditingId(null);                 // cierra el formulario
        setEditedId(id);                    // marca la card como "Editado"
        setTimeout(() => setEditedId(curr => (curr === id ? null : curr)), 2600);
        return true;
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        await remove(deletingId);
        setDeletingId(null);
        await refresh();
    };

    /* una resena es propia si el id del autor coincide con el usuario logueado */
    const isOwn = (c: Comment) => { const id = getCurrentUser()?.id; return !!id && c.userId === id; };

    const avg   = stats?.averageRating ?? fallbackRating ?? 0;
    const count = stats?.totalReviews  ?? fallbackCount  ?? 0;

    return (
        <div className="rv-section">
            <div className="rv-head">
                <div className="eyebrow">{t("review.sectionTitle")}</div>
                <div className="rv-rating">
                    <Icon name="star" size={13} filled/>
                    <strong>{avg}</strong>
                    <span className="rv-count">({count})</span>
                </div>
            </div>

            <ReviewForm onSubmit={handlePost}/>

            {reviews.length === 0 ? (
                <div className="rv-empty">{t("review.empty")}</div>
            ) : (
                <div className="rv-list">
                    {reviews.map(r => (
                        <div key={r.id} className="rv-item">
                            {editingId === r.id ? (
                                <ReviewForm
                                    initialContent={r.content}
                                    initialRating={r.rating}
                                    onSubmit={(content, rating) => handleEdit(r.id, content, rating)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <>
                                    <div className="rv-item-head">
                                        <div className="rv-author">
                                            <div className="rv-avatar">
                                                {r.userUrl
                                                    ? <img src={r.userUrl} alt={r.userName} className="rv-avatar-img"/>
                                                    : r.userName[0]}
                                            </div>
                                            <div>
                                                <div className="rv-name">{r.userName}</div>
                                                <div className="rv-date">{fmtDate(r.createdAt, dateLocale)}</div>
                                            </div>
                                        </div>
                                        <div className="rv-meta">
                                            <div className="rv-stars">
                                                {Array.from({ length: 5 }, (_, s) => (
                                                    <Icon key={s} name="star" size={11} filled={s < r.rating} style={{ color: s < r.rating ? "var(--warn)" : "var(--line-strong)" }}/>
                                                ))}
                                            </div>
                                            {editedId === r.id && (
                                                <span className="rv-edited-flag"><Icon name="check" size={11}/> {t("review.edited")}</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="rv-content">{r.content}</p>
                                    {isOwn(r) && (
                                        <div className="rv-own-actions">
                                            <button type="button" className="rv-edit-btn" onClick={() => setEditingId(r.id)}>
                                                <Icon name="edit" size={12}/> {t("review.edit")}
                                            </button>
                                            <button type="button" className="rv-edit-btn rv-del-btn" onClick={() => setDeletingId(r.id)}>
                                                <Icon name="trash" size={12}/> {t("review.delete")}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {deletingId && (
                <Modal onClose={() => setDeletingId(null)} ariaLabel={t("review.confirmDeleteTitle")} className="review-confirm">
                    <div className="review-confirm-body">
                        <div className="review-confirm-icon"><Icon name="trash" size={20}/></div>
                        <h3 className="review-confirm-title">{t("review.confirmDeleteTitle")}</h3>
                        <p className="review-confirm-text">{t("review.confirmDeleteText")}</p>
                        <div className="review-confirm-actions">
                            <button type="button" className="btn" onClick={() => setDeletingId(null)}>{t("review.cancel")}</button>
                            <button type="button" className="btn review-del-confirm" onClick={handleDelete}>{t("review.confirmDelete")}</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}