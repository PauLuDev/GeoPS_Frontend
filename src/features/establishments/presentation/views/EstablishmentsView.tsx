import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Business } from "@/shared/types.ts";
import { CATEGORIES } from "@/shared/constants.ts";
import { BusinessForm } from "@/features/establishments/presentation/components/BusinessForm.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";

interface EstablishmentsViewProps {
    establishments: Business[];
    onSave: (business: Business) => void;
    onDelete: (id: string) => void;
    /* limite de establecimientos del plan (-1 = ilimitado, undefined = sin limite) */
    maxEstablishments?: number;
    /* navegar a la pantalla de planes desde el aviso de limite */
    onUpgrade?: () => void;
}

type Mode =
    | { kind: "list" }
    | { kind: "create" }
    | { kind: "edit"; business: Business };

const catLabel = (id: string) => CATEGORIES.find(c => c.id === id)?.label ?? id;
const catIcon  = (id: string) => CATEGORIES.find(c => c.id === id)?.icon ?? "store";

export function EstablishmentsView({ establishments, onSave, onDelete, maxEstablishments, onUpgrade }: EstablishmentsViewProps) {
    const { t } = useTranslation();
    const [mode, setMode]     = useState<Mode>({ kind: "list" });
    const [toDelete, setToDelete] = useState<Business | null>(null);
    const [limitReached, setLimitReached] = useState(false);

    /* al darle "Nuevo establecimiento", respeta el limite del plan: si ya llego
       al maximo no abre el formulario, muestra un aviso */
    const atLimit = maxEstablishments != null && maxEstablishments >= 0 && establishments.length >= maxEstablishments;
    const tryCreate = () => {
        if (atLimit) setLimitReached(true);
        else setMode({ kind: "create" });
    };

    /* form (crear / editar) */
    if (mode.kind !== "list") {
        const editing = mode.kind === "edit";
        return (
            <div className="md est-page">
                <header className="md-head">
                    <div>
                        <button type="button" className="btn btn-sm back-btn"
                                onClick={() => setMode({ kind: "list" })}>
                            <Icon name="arrowLeft" size={14}/> {t("establishments.backToEstablishments")}
                        </button>
                        <h1 className="page-title est-form-title">
                            {editing ? t("establishments.editTitle") : t("establishments.newTitle")}
                        </h1>
                        <p className="page-subtitle">
                            {editing
                                ? t("establishments.editSubtitle")
                                : t("establishments.newSubtitle")}
                        </p>
                    </div>
                </header>

                <BusinessForm
                    initial={editing ? mode.business : null}
                    submitLabel={editing ? t("common.save") : t("establishments.register")}
                    onSubmit={b => { onSave(b); setMode({ kind: "list" }); }}
                    onCancel={() => setMode({ kind: "list" })}
                />
            </div>
        );
    }

    /* lista */
    return (
        <div className="md est-page">
            <header className="md-head">
                <div>
                    <div className="eyebrow">{t("establishments.eyebrow")}</div>
                    <h1 className="page-title">{t("establishments.title")}</h1>
                    <p className="page-subtitle">
                        {establishments.length === 1 ? t("establishments.subtitle_one", { count: establishments.length }) : t("establishments.subtitle_other", { count: establishments.length })}
                    </p>
                </div>
                {establishments.length > 0 && (
                    <button type="button" className="btn btn-brand" onClick={tryCreate}>
                        <Icon name="plus" size={14}/> {t("establishments.new")}
                    </button>
                )}
            </header>

            {establishments.length === 0 ? (
                <div className="card est-empty">
                    <div className="est-empty-icon"><Icon name="store" size={34}/></div>
                    <div className="est-empty-title">{t("establishments.emptyTitle")}</div>
                    <div className="est-empty-sub">{t("establishments.emptySubtitle")}</div>
                    <button type="button" className="btn btn-brand" onClick={tryCreate}>
                        <Icon name="plus" size={14}/> {t("establishments.register")}
                    </button>
                </div>
            ) : (
                <div className="est-grid">
                    {establishments.map(b => {
                        const cover = b.photos?.[0] || b.imageUrl;
                        const active = b.active !== false;
                        const photoCount = (b.photos?.length ?? 0) || (b.imageUrl ? 1 : 0);
                        return (
                            <div key={b.id} className={"card est-card" + (active ? "" : " inactive")}>
                                {/* cover (la imagen es dinamica; el gradiente por defecto va en CSS) */}
                                <div className="est-cover" style={cover ? { backgroundImage: `url(${cover})` } : undefined}>
                                    {b.logo && <img className="est-logo" src={b.logo} alt={`${b.name} logo`}/>}
                                    <span className="est-cat">
                                        <Icon name={catIcon(b.category)} size={11}/> {catLabel(b.category)}
                                    </span>
                                    {!active && <span className="est-inactive-badge">{t("establishments.inactiveBadge")}</span>}
                                </div>

                                {/* body */}
                                <div className="est-body">
                                    <div className="est-name">{b.name}</div>
                                    <div className="est-addr">
                                        <Icon name="location" size={12}/>
                                        <span className="est-addr-text">{b.address} · {b.district}</span>
                                    </div>
                                    <p className="est-desc">{b.description}</p>

                                    <div className="est-meta">
                                        <span><Icon name="image" size={11}/> {photoCount === 1 ? t("establishments.photoCount_one", { count: photoCount }) : t("establishments.photoCount_other", { count: photoCount })}</span>
                                        <span><Icon name="clock" size={11}/> {b.hours.filter(h => !h.closed).length} {t("establishments.openDays")}</span>
                                    </div>

                                    {/* visibilidad: activar/desactivar el negocio en la plataforma */}
                                    <button type="button" className="est-visibility" aria-pressed={active}
                                            onClick={() => onSave({ ...b, active: !active })}>
                                        <span className="est-visibility-label">
                                            <span className={"est-status-dot" + (active ? " on" : "")}/>
                                            {active ? t("establishments.visible") : t("establishments.hidden")}
                                        </span>
                                        <span className={"toggle" + (active ? " on" : "")}><span className="toggle-knob"/></span>
                                    </button>

                                    <div className="est-actions">
                                        <button type="button" className="btn btn-sm est-action-btn"
                                                onClick={() => setMode({ kind: "edit", business: b })}>
                                            <Icon name="edit" size={13}/> {t("establishments.edit")}
                                        </button>
                                        <button type="button" className="btn btn-sm est-del-btn"
                                                onClick={() => setToDelete(b)}>
                                            <Icon name="trash" size={13}/> {t("establishments.delete")}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* aviso de limite del plan alcanzado */}
            {limitReached && (
                <Modal onClose={() => setLimitReached(false)} ariaLabel={t("establishments.limitTitle")} className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon"><Icon name="store" size={20}/></div>
                        <h3 className="est-modal-title">{t("establishments.limitTitle")}</h3>
                        <p className="est-modal-text">
                            {maxEstablishments === 1 ? t("establishments.limitText_one", { max: maxEstablishments, count: establishments.length }) : t("establishments.limitText_other", { max: maxEstablishments, count: establishments.length })}
                        </p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setLimitReached(false)}>
                                {t("establishments.limitUnderstood")}
                            </button>
                            {onUpgrade && (
                                <button type="button" className="btn btn-brand est-modal-btn"
                                        onClick={() => { setLimitReached(false); onUpgrade(); }}>
                                    <Icon name="arrowRight" size={14}/> {t("establishments.viewPlans")}
                                </button>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
 
            {/* confirmacion de eliminacion */}
            {toDelete && (
                <Modal onClose={() => setToDelete(null)} labelledBy="est-del-title" className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon"><Icon name="trash" size={20}/></div>
                        <h3 id="est-del-title" className="est-modal-title">{t("establishments.deleteTitle")}</h3>
                        <p className="est-modal-text">
                            {t("establishments.deleteText", { name: toDelete.name })}
                        </p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setToDelete(null)}>
                                {t("common.cancel")}
                            </button>
                            <button type="button" className="btn est-del-confirm est-modal-btn"
                                    onClick={() => { onDelete(toDelete.id); setToDelete(null); }}>
                                <Icon name="trash" size={14}/> {t("establishments.confirmDelete")}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}