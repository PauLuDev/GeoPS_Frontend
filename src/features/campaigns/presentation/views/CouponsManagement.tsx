import { useEffect, useState } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { CampaignCoupon } from "@/features/campaigns/domain/entities/CampaignCoupon.ts";
import { useRegisteredCoupons } from "@/features/campaigns/presentation/hooks/useRegisteredCoupons.ts";
import { NewCouponForm } from "@/features/campaigns/presentation/components/NewCouponForm.tsx";
import { EditCouponModal } from "@/features/campaigns/presentation/components/EditCouponModal.tsx";
import { useEstablishments } from "@/features/establishments/presentation/hooks/useEstablishments.ts";
import { useCoupons } from "@/features/coupons/presentation/hooks/useCoupons.ts";
import { promotionLabel } from "@/features/campaigns/domain/value-objects/PromotionType.ts";

export function CouponsManagement() {
    /* cupones del dueno -> crear y eliminar van al back (editar no existe en el back todavia) */
    const { coupons: registered, reload } = useRegisteredCoupons();
    const { establishments } = useEstablishments();
    const { remove: removeCoupon, loading: removing } = useCoupons();
    const [coupons, setCoupons] = useState<CampaignCoupon[]>([]);
    useEffect(() => { setCoupons(registered); }, [registered]);
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<CampaignCoupon | null>(null);
    const [toDelete, setToDelete] = useState<CampaignCoupon | null>(null);
    const [search, setSearch] = useState("");
    const [success, setSuccess] = useState("");

    const handleCreated = () => {
        setCreating(false);
        setSuccess("cupón publicado");
        setTimeout(() => setSuccess(""), 3000);
        void reload();
    };

    const handleEdited = () => {
        setEditing(null);
        setSuccess("cupón actualizado");
        setTimeout(() => setSuccess(""), 3000);
        void reload();
    };

    const filtered = coupons.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    const deleteCoupon = async () => {
        if (!toDelete) return;
        const target = toDelete;
        const res = await removeCoupon(target.id);
        setToDelete(null);
        if (res === null) return;   // fallo -> no tocamos la lista
        setCoupons(prev => prev.filter(c => c.id !== target.id));
        setSuccess(`"${target.title}" eliminado`);
        setTimeout(() => setSuccess(""), 3000);
        void reload();
    };

    return (
        <div className="md cl-page">
            <header className="md-head">
                <div>
                    <div className="eyebrow">Mi negocio</div>
                    <h1 className="page-title">Cupones</h1>
                    <p className="page-subtitle">
                        {coupons.length} cupón{coupons.length !== 1 ? "es" : ""} registrado{coupons.length !== 1 ? "s" : ""}
                    </p>
                </div>
                {!creating && coupons.length > 0 && (
                    <button type="button" className="btn btn-brand" onClick={() => setCreating(true)}>
                        <Icon name="plus" size={14}/> Nuevo cupón
                    </button>
                )}
            </header>

            {success && (
                <div className="plans-success"><Icon name="check" size={15}/> {success}</div>
            )}

            {creating && (
                <NewCouponForm
                    establishments={establishments}
                    onCreated={handleCreated}
                    onCancel={() => setCreating(false)}
                />
            )}

            {!creating && (
            <div className="card cl-card">
                <div className="cl-toolbar">
                    <div className="cl-spacer"/>
                    <div className="search-wrap cl-search">
                        <Icon name="search" size={14}/>
                        <input className="search-input cl-search-input" aria-label="Buscar cupón" placeholder="Buscar cupón"
                               value={search} onChange={e => setSearch(e.target.value)}/>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="cl-empty">
                        <div className="cl-empty-icon"><Icon name="ticket" size={32}/></div>
                        <div className="cl-empty-title">
                            {search ? "Ningún cupón coincide con la búsqueda" : "No hay cupones registrados"}
                        </div>
                        {!search && (
                            <button type="button" className="btn btn-brand cl-empty-cta" onClick={() => setCreating(true)}>
                                <Icon name="plus" size={14}/> Nuevo cupón
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="cm-list">
                        {filtered.map(c => (
                            <div key={c.id} className="cm-row">
                                <div className="cm-thumb">
                                    {c.imageUrl ? (
                                        <img src={c.imageUrl} alt={c.title}/>
                                    ) : (
                                        <span className="cm-thumb-disc">{c.discount}</span>
                                    )}
                                </div>
                                <div className="cm-info">
                                    <div className="cm-title">{c.title}</div>
                                    <div className="cm-meta">
                                        <span className="cm-cat-tag">{promotionLabel(c.promotionType)}</span>
                                        <span className="cm-sep">·</span>
                                        <span className="cm-discount">{c.discount}</span>
                                        <span className="cm-sep">·</span>
                                        <span>Stock: {c.stock}</span>
                                    </div>
                                </div>
                                <div className="cm-actions">
                                    <button type="button" className="btn btn-sm" onClick={() => setEditing(c)}>
                                        <Icon name="edit" size={13}/> Editar
                                    </button>
                                    <button type="button" className="btn btn-sm est-del-btn" onClick={() => setToDelete(c)}>
                                        <Icon name="trash" size={13}/> Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            )}

            {/* modal de edicion (real, contra el back) */}
            {editing && (
                <EditCouponModal coupon={editing} onSaved={handleEdited} onClose={() => setEditing(null)}/>
            )}

            {/* modal de eliminacion */}
            {toDelete && (
                <Modal onClose={() => setToDelete(null)} labelledBy="cm-del-title" className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon"><Icon name="trash" size={20}/></div>
                        <h3 id="cm-del-title" className="est-modal-title">Eliminar cupón</h3>
                        <p className="est-modal-text">
                            ¿Seguro que quieres eliminar <strong>{toDelete.title}</strong>? Esta acción no se puede deshacer.
                        </p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setToDelete(null)} disabled={removing}>Cancelar</button>
                            <button type="button" className="btn est-del-confirm est-modal-btn" onClick={deleteCoupon} disabled={removing}>
                                <Icon name="trash" size={14}/> {removing ? "Eliminando…" : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
