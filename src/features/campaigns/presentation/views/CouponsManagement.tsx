import { useEffect, useState } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { CampaignCoupon } from "@/features/campaigns/domain/entities/CampaignCoupon.ts";
import { useRegisteredCoupons } from "@/features/campaigns/presentation/hooks/useRegisteredCoupons.ts";
import { PromotionType, PROMOTION_TYPES, promotionLabel } from "@/features/campaigns/domain/value-objects/PromotionType.ts";

type EditingCoupon = CampaignCoupon & { _dirty?: boolean };

export function CouponsManagement() {
    /* cupones del dueno -> el editar y eliminar es local por ahora */
    const { coupons: registered } = useRegisteredCoupons();
    const [coupons, setCoupons] = useState<CampaignCoupon[]>([]);
    useEffect(() => { setCoupons(registered); }, [registered]);
    const [editing, setEditing] = useState<EditingCoupon | null>(null);
    const [toDelete, setToDelete] = useState<CampaignCoupon | null>(null);
    const [search, setSearch] = useState("");
    const [success, setSuccess] = useState("");

    const filtered = coupons.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    const startEdit = (c: CampaignCoupon) => setEditing({ ...c });

    const saveEdit = () => {
        if (!editing) return;
        setCoupons(prev => prev.map(c => c.id === editing.id ? { ...editing, _dirty: undefined } as CampaignCoupon : c));
        setEditing(null);
        setSuccess(`"${editing.title}" actualizado`);
        setTimeout(() => setSuccess(""), 3000);
    };

    const deleteCoupon = () => {
        if (!toDelete) return;
        setCoupons(prev => prev.filter(c => c.id !== toDelete.id));
        setToDelete(null);
        setSuccess(`"${toDelete.title}" eliminado`);
        setTimeout(() => setSuccess(""), 3000);
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
            </header>

            {success && (
                <div className="plans-success"><Icon name="check" size={15}/> {success}</div>
            )}

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
                                        <span>S/ {c.finalPrice.toFixed(2)}</span>
                                        {c.originalPrice > c.finalPrice && (
                                            <span className="cm-orig">S/ {c.originalPrice.toFixed(2)}</span>
                                        )}
                                        <span className="cm-sep">·</span>
                                        <span>Stock: {c.stock}</span>
                                    </div>
                                </div>
                                <div className="cm-actions">
                                    <button type="button" className="btn btn-sm" onClick={() => startEdit(c)}>
                                        <Icon name="edit" size={13}/> Editar
                                    </button>
                                    <button type="button" className="btn btn-sm est-del-btn" onClick={() => setToDelete(c)}>
                                        <Icon name="trash" size={13}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de edicion */}
            {editing && (
                <Modal onClose={() => setEditing(null)} ariaLabel="Editar cupón" className="cm-edit-modal">
                    <div className="cm-edit-body">
                        <h3 className="cm-edit-title">Editar cupón</h3>
                        <div className="cm-edit-fields">
                            <div className="field">
                                <label htmlFor="cm-title">Título</label>
                                <input id="cm-title" className="input" value={editing.title}
                                       onChange={e => setEditing(prev => prev ? { ...prev, title: e.target.value } : null)}/>
                            </div>
                            <div className="field">
                                <label htmlFor="cm-promo">Tipo</label>
                                <select id="cm-promo" className="input" value={editing.promotionType}
                                        onChange={e => setEditing(prev => prev ? { ...prev, promotionType: e.target.value as PromotionType } : null)}>
                                    {PROMOTION_TYPES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                                </select>
                            </div>
                            <div className="cm-edit-row2">
                                <div className="field">
                                    <label htmlFor="cm-orig">Precio original (S/)</label>
                                    <input id="cm-orig" className="input" type="number" min={0} step={0.01}
                                           value={editing.originalPrice}
                                           onChange={e => {
                                               const orig = parseFloat(e.target.value) || 0;
                                               setEditing(prev => prev ? {
                                                   ...prev,
                                                   originalPrice: orig,
                                                   discount: orig > 0 ? `${Math.round(((orig - prev.finalPrice) / orig) * 100)}%` : "0%",
                                               } : null);
                                           }}/>
                                </div>
                                <div className="field">
                                    <label htmlFor="cm-final">Precio final (S/)</label>
                                    <input id="cm-final" className="input" type="number" min={0} step={0.01}
                                           value={editing.finalPrice}
                                           onChange={e => {
                                               const final_ = parseFloat(e.target.value) || 0;
                                               setEditing(prev => prev ? {
                                                   ...prev,
                                                   finalPrice: final_,
                                                   discount: prev.originalPrice > 0 ? `${Math.round(((prev.originalPrice - final_) / prev.originalPrice) * 100)}%` : "0%",
                                               } : null);
                                           }}/>
                                </div>
                            </div>
                            <div className="field">
                                <label htmlFor="cm-stock">Stock</label>
                                <input id="cm-stock" className="input" type="number" min={0}
                                       value={editing.stock}
                                       onChange={e => setEditing(prev => prev ? { ...prev, stock: parseInt(e.target.value) || 0 } : null)}/>
                            </div>
                            <div className="field">
                                <label htmlFor="cm-desc">Descripción</label>
                                <textarea id="cm-desc" className="input" rows={3} value={editing.description ?? ""}
                                          onChange={e => setEditing(prev => prev ? { ...prev, description: e.target.value } : null)}/>
                            </div>
                        </div>
                        <div className="cm-edit-actions">
                            <button type="button" className="btn" onClick={() => setEditing(null)}>Cancelar</button>
                            <button type="button" className="btn btn-brand" onClick={saveEdit}>
                                <Icon name="check" size={14}/> Guardar cambios
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal de eliminacion */}
            {toDelete && (
                <Modal onClose={() => setToDelete(null)} labelledBy="cm-del-title" className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon"><Icon name="trash" size={20}/></div>
                        <h3 id="cm-del-title" className="est-modal-title">Eliminar cupón</h3>
                        <p className="est-modal-text">
                            ¿Seguro que quieres eliminar <strong>{toDelete.title}</strong>? Esta acción no se puede deshacer.
                        </p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setToDelete(null)}>Cancelar</button>
                            <button type="button" className="btn est-del-confirm est-modal-btn" onClick={deleteCoupon}>
                                <Icon name="trash" size={14}/> Eliminar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}