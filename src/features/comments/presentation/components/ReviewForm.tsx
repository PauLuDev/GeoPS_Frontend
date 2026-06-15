import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";

interface ReviewFormProps {
    /* publica o guarda la resena -> resuelve true si se guardo */
    onSubmit: (content: string, rating: number) => Promise<boolean>;
    /* valores iniciales en modo edicion */
    initialContent?: string;
    initialRating?: number;
    /* si se pasa, es modo edicion -> muestra cancelar y otro titulo */
    onCancel?: () => void;
}

/* formulario para dejar o editar calificacion (1-5 estrellas) mas comentario */
export function ReviewForm({ onSubmit, initialContent = "", initialRating = 0, onCancel }: ReviewFormProps) {
    const { t } = useTranslation();
    const isEdit = !!onCancel;
    const [rating, setRating]   = useState(initialRating);
    const [hover, setHover]     = useState(0);
    const [content, setContent] = useState(initialContent);
    const [error, setError]     = useState("");
    const [sending, setSending] = useState(false);
    const [flash, setFlash]     = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating < 1)      { setError(t("review.errorRating"));  return; }
        if (!content.trim()) { setError(t("review.errorContent")); return; }
        setError("");
        setSending(true);
        const ok = await onSubmit(content.trim(), rating);
        setSending(false);
        if (!ok) return;
        // en modo edicion el padre cierra el form y muestra "editado" en la card
        if (!isEdit) {
            setContent(""); setRating(0); setHover(0);
            setFlash(true);
            setTimeout(() => setFlash(false), 2600);
        }
    };

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <div className="review-form-title">{isEdit ? t("review.editTitle") : t("review.title")}</div>

            <div className="review-stars" role="radiogroup" aria-label={t("review.ratingAria")}>
                {[1, 2, 3, 4, 5].map(n => (
                    <button
                        key={n}
                        type="button"
                        className={"review-star" + (n <= (hover || rating) ? " on" : "")}
                        aria-label={t("review.starAria", { n })}
                        aria-pressed={n <= rating}
                        onClick={() => { setRating(n); setError(""); }}
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                    >
                        <Icon name="star" size={24} filled={n <= (hover || rating)}/>
                    </button>
                ))}
            </div>

            {/* feedback debajo de las estrellas */}
            {flash && (
                <span className="review-flash">
                    <Icon name="check" size={13}/> {t("review.published")}
                </span>
            )}

            <textarea
                className="input review-textarea"
                rows={3}
                aria-label={isEdit ? t("review.editTitle") : t("review.title")}
                placeholder={t("review.placeholder")}
                value={content}
                onChange={e => { setContent(e.target.value); setError(""); }}
            />

            {error && <span className="field-error">{error}</span>}

            <div className="review-actions">
                <button type="submit" className="btn btn-brand review-submit" disabled={sending}>
                    {sending ? t("review.sending") : isEdit ? t("review.saveChanges") : t("review.submit")}
                </button>
                {onCancel && (
                    <button type="button" className="btn btn-sm" onClick={onCancel} disabled={sending}>
                        {t("review.cancel")}
                    </button>
                )}
            </div>
        </form>
    );
}