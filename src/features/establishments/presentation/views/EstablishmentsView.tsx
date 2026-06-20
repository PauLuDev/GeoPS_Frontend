import { useState } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Business } from "@/shared/types.ts";
import { CATEGORIES } from "@/shared/constants.ts";
import { BusinessForm } from "@/features/establishments/presentation/components/BusinessForm.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";

interface EstablishmentsViewProps {
    establishments: Business[];
    onSave: (business: Business) => void;
    onDelete: (id: string) => void;
    canCreate?: boolean;
    onLimitReached?: () => void;
}

type Mode =
    | { kind: "list" }
    | { kind: "create" }
    | { kind: "edit"; business: Business };

const catLabel = (id: string) => CATEGORIES.find(c => c.id === id)?.label ?? id;
const catIcon  = (id: string) => CATEGORIES.find(c => c.id === id)?.icon ?? "store";

export function EstablishmentsView({ establishments, onSave, onDelete, canCreate = true, onLimitReached }: EstablishmentsViewProps) {
    const [mode, setMode]     = useState<Mode>({ kind: "list" });
    const [toDelete, setToDelete] = useState<Business | null>(null);

    /* respeta el limite del plan -> si no se puede crear mas, avisa en lugar de abrir el form */
    const handleNewClick = () => {
        if (canCreate) setMode({ kind: "create" });
        else onLimitReached?.();
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
                            <Icon name="arrowLeft" size={14}/> Volver a establecimientos
                        </button>
                        <h1 className="page-title est-form-title">
                            {editing ? "Editar establecimiento" : "Nuevo establecimiento"}
                        </h1>
                        <p className="page-subtitle">
                            {editing
                                ? "Actualiza fotos, logo, descripción y horarios para mantener la información al día."
                                : "Carga fotos, logo, descripción y horarios para mejorar tu visibilidad en el mapa."}
                        </p>
                    </div>
                </header>

                <BusinessForm
                    initial={editing ? mode.business : null}
                    submitLabel={editing ? "Guardar cambios" : "Crear establecimiento"}
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
                    <div className="eyebrow">Mi negocio</div>
                    <h1 className="page-title">Establecimientos</h1>
                    <p className="page-subtitle">
                        {establishments.length} {establishments.length === 1 ? "local registrado" : "locales registrados"}
                    </p>
                </div>
                {establishments.length > 0 && (
                    <button type="button" className="btn btn-brand" onClick={handleNewClick}>
                        <Icon name="plus" size={14}/> Nuevo establecimiento
                    </button>
                )}
            </header>

            {establishments.length === 0 ? (
                <div className="card est-empty">
                    <div className="est-empty-icon"><Icon name="store" size={34}/></div>
                    <div className="est-empty-title">Aún no tienes establecimientos</div>
                    <div className="est-empty-sub">Registra tu primer local para empezar a publicar campañas.</div>
                    <button type="button" className="btn btn-brand" onClick={handleNewClick}>
                        <Icon name="plus" size={14}/> Registrar establecimiento
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
                                    {!active && <span className="est-inactive-badge">Inactivo</span>}
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
                                        <span><Icon name="image" size={11}/> {photoCount} foto{photoCount !== 1 ? "s" : ""}</span>
                                        <span><Icon name="clock" size={11}/> {b.hours.filter(h => !h.closed).length} días abierto</span>
                                    </div>

                                    {/* visibilidad: activar/desactivar el negocio en la plataforma */}
                                    <button type="button" className="est-visibility" aria-pressed={active}
                                            onClick={() => onSave({ ...b, active: !active })}>
                                        <span className="est-visibility-label">
                                            <span className={"est-status-dot" + (active ? " on" : "")}/>
                                            {active ? "Visible para clientes" : "Oculto para clientes"}
                                        </span>
                                        <span className={"toggle" + (active ? " on" : "")}><span className="toggle-knob"/></span>
                                    </button>

                                    <div className="est-actions">
                                        <button type="button" className="btn btn-sm est-action-btn"
                                                onClick={() => setMode({ kind: "edit", business: b })}>
                                            <Icon name="edit" size={13}/> Editar
                                        </button>
                                        <button type="button" className="btn btn-sm est-del-btn"
                                                onClick={() => setToDelete(b)}>
                                            <Icon name="trash" size={13}/> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* confirmacion de eliminacion */}
            {toDelete && (
                <Modal onClose={() => setToDelete(null)} labelledBy="est-del-title" className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon"><Icon name="trash" size={20}/></div>
                        <h3 id="est-del-title" className="est-modal-title">Eliminar establecimiento</h3>
                        <p className="est-modal-text">
                            ¿Seguro que quieres eliminar <strong>{toDelete.name}</strong>? Se quitará del mapa y no podrás recuperar su información. Esta acción no se puede deshacer.
                        </p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setToDelete(null)}>
                                Cancelar
                            </button>
                            <button type="button" className="btn est-del-confirm est-modal-btn"
                                    onClick={() => { onDelete(toDelete.id); setToDelete(null); }}>
                                <Icon name="trash" size={14}/> Eliminar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}