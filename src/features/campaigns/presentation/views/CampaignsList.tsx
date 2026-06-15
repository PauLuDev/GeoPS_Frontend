import { useState } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { Campaign } from "@/features/campaigns/domain/entities/Campaign.ts";
import { STATUS_COLOR, STATUS_BG, STATUS_LABEL } from "@/features/campaigns/domain/value-objects/CampaignStatus.ts";
import { bestCampaignId, bestCouponId, ratePct, redemptionRate } from "@/features/campaigns/domain/value-objects/Performance.ts";
import { promotionLabel } from "@/features/campaigns/domain/value-objects/PromotionType.ts";
import { filterCampaigns, countByStatus, StatusFilter } from "@/features/campaigns/application/use-cases/ListCampaigns.ts";

const FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
    { label: "Todas",       value: "all"       },
    { label: "En vivo",     value: "live"      },
    { label: "Programadas", value: "scheduled" },
    { label: "Borradores",  value: "draft"     },
    { label: "Finalizadas", value: "ended"     },
];

interface CampaignsListProps {
    campaigns: Campaign[];
    onNew: () => void;
    onOpen?: (c: Campaign) => void;
    onDeactivate?: (id: number) => void;
    onDelete?: (id: number) => void;
}

export function CampaignsList({ campaigns, onNew, onOpen, onDeactivate, onDelete }: CampaignsListProps) {
    const [filter, setFilter] = useState<StatusFilter>("all");
    const [search, setSearch] = useState("");
    const [menuOpen, setMenuOpen] = useState<number | null>(null);
    const [toDelete, setToDelete] = useState<Campaign | null>(null);
    const [toDeactivate, setToDeactivate] = useState<Campaign | null>(null);

    const visible = filterCampaigns(campaigns, filter, search);
    const bestId = bestCampaignId(campaigns);   // mejor campana por tasa de canje

    const live      = countByStatus(campaigns, "live");
    const draft     = countByStatus(campaigns, "draft");
    const scheduled = countByStatus(campaigns, "scheduled");

    return (
        <div className="md cl-page">
            <header className="md-head">
                <div>
                    <h1 className="page-title">Campañas</h1>
                    <p className="page-subtitle">
                        {live} activa{live !== 1 ? "s" : ""} · {draft} borrador{draft !== 1 ? "es" : ""} · {scheduled} programada{scheduled !== 1 ? "s" : ""}
                    </p>
                </div>
                <button type="button" className="btn btn-brand" onClick={onNew}>
                    <Icon name="plus" size={14}/> Nueva campaña
                </button>
            </header>

            <div className="card cl-card">
                <div className="cl-toolbar">
                    <div className="cl-filters">
                        {FILTER_OPTIONS.map(opt => (
                            <button type="button" key={opt.value}
                                    className={"sort-pill " + (filter === opt.value ? "active" : "")}
                                    onClick={() => setFilter(opt.value)}>
                                {opt.label}
                                {opt.value !== "all" && (
                                    <span className="pill-count">
                                        {countByStatus(campaigns, opt.value)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="cl-spacer"/>
                    <div className="search-wrap cl-search">
                        <Icon name="search" size={14}/>
                        <input className="search-input cl-search-input" aria-label="Buscar campaña" placeholder="Buscar campaña"
                               value={search} onChange={e => setSearch(e.target.value)}/>
                    </div>
                </div>

                {visible.length === 0 ? (
                    <div className="cl-empty">
                        <div className="cl-empty-icon"><Icon name="ticket" size={32}/></div>
                        <div className="cl-empty-title">
                            {search ? "Ninguna campaña coincide con la búsqueda" : "No hay campañas en esta categoría"}
                        </div>
                        {!search && (
                            <button type="button" className="btn btn-sm btn-brand cl-empty-cta" onClick={onNew}>
                                <Icon name="plus" size={12}/> Crear campaña
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="cg-list stagger">
                        {visible.map(c => {
                            const bestCoupon = bestCouponId(c.coupons);
                            const ranked = [...c.coupons].sort(
                                (a, b) => redemptionRate(b.views, b.redeemed) - redemptionRate(a.views, a.redeemed)
                            );
                            return (
                                <div key={c.id} className={"cg-card" + (c.id === bestId ? " cg-card-best" : "")}>
                                    {/* cabecera -> la campana (ocasion) en grande */}
                                    <div className={"cg-head" + (onOpen ? " cg-head-link" : "")}
                                         onClick={onOpen ? () => onOpen(c) : undefined}
                                         onKeyDown={onOpen ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(c); } } : undefined}
                                         role={onOpen ? "button" : undefined} tabIndex={onOpen ? 0 : undefined}>
                                        <div className={"ct-avatar" + (c.status === "live" ? " live" : "")}/>
                                        <div className="cg-head-main">
                                            <div className="cg-name">
                                                {c.name}
                                                <span className="badge" style={{ background: STATUS_BG[c.status], color: STATUS_COLOR[c.status] }}>
                                                    {c.status === "live" && <span className="status-dot"/>}
                                                    {STATUS_LABEL[c.status]}
                                                </span>
                                                {c.id === bestId && (
                                                    <span className="ct-best-badge" title="Mejor campaña por tasa de canje">
                                                        <Icon name="star" size={11}/> Mejor
                                                    </span>
                                                )}
                                            </div>
                                            <div className="cg-sub">
                                                {c.category} · {c.coupons.length} cupón{c.coupons.length !== 1 ? "es" : ""} · #GEO-{(1000 + c.id).toString()}
                                            </div>
                                        </div>
                                        <div className="cg-metrics">
                                            <span><strong className="mono">{c.views.toLocaleString()}</strong> vistos</span>
                                            <span><strong className="mono">{c.reserved.toLocaleString()}</strong> reservados</span>
                                            <span><strong className="mono">{c.redeemed.toLocaleString()}</strong> redimidos</span>
                                            <span className="cg-metric-rate"><strong className="mono">{c.views > 0 ? ratePct(c.views, c.redeemed) : "—"}</strong> canje</span>
                                        </div>
                                        <div className="ct-actions ct-actions-menu" onClick={e => e.stopPropagation()}>
                                            <button type="button" className="btn btn-icon btn-sm" aria-label="Acciones"
                                                    onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)}>
                                                <Icon name="chevron" size={14}/>
                                            </button>
                                            {menuOpen === c.id && (
                                                <div className="ct-menu">
                                                    {c.status === "live" && (
                                                        <button type="button" className="ct-menu-item"
                                                                onClick={() => { setMenuOpen(null); setToDeactivate(c); }}>
                                                            <Icon name="close" size={13}/> Desactivar
                                                        </button>
                                                    )}
                                                    {c.status === "ended" && (
                                                        <button type="button" className="ct-menu-item"
                                                                onClick={() => { setMenuOpen(null); setToDeactivate(c); }}>
                                                            <Icon name="check" size={13}/> Reactivar
                                                        </button>
                                                    )}
                                                    <button type="button" className="ct-menu-item ct-menu-danger"
                                                            onClick={() => { setMenuOpen(null); setToDelete(c); }}>
                                                        <Icon name="trash" size={13}/> Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* cupones que pertenecen a esta campana */}
                                    <div className="cg-coupons">
                                        {ranked.length === 0 ? (
                                            <div className="cg-coupon-empty">Esta campaña aún no tiene cupones.</div>
                                        ) : ranked.map(cp => (
                                            <div key={cp.id} className={"cg-coupon" + (cp.id === bestCoupon ? " cg-coupon-best" : "")}>
                                                <div className="cg-coupon-name">
                                                    {cp.id === bestCoupon && <Icon name="star" size={12}/>}
                                                    {cp.title}
                                                    <span className="cd-cat-tag">{promotionLabel(cp.promotionType)}</span>
                                                </div>
                                                <div className="cg-coupon-metrics mono">
                                                    <span>{cp.views.toLocaleString()} vistos</span>
                                                    <span>{cp.reserved.toLocaleString()} res.</span>
                                                    <span>{cp.redeemed.toLocaleString()} red.</span>
                                                    <span className="cg-coupon-rate">{cp.views > 0 ? ratePct(cp.views, cp.redeemed) : "—"}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* modal desactivar/reactivar campana */}
            {toDeactivate && (
                <Modal onClose={() => setToDeactivate(null)} ariaLabel="Desactivar campaña" className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon" style={{ background: "var(--bg-sunken)", color: "var(--ink-2)" }}>
                            <Icon name={toDeactivate.status === "live" ? "close" : "check"} size={20}/>
                        </div>
                        <h3 className="est-modal-title">
                            {toDeactivate.status === "live" ? "Desactivar campaña" : "Reactivar campaña"}
                        </h3>
                        <p className="est-modal-text">
                            {toDeactivate.status === "live"
                                ? <>¿Seguro que quieres desactivar <strong>{toDeactivate.name}</strong>? Los cupones dejarán de ser visibles para los clientes.</>
                                : <>¿Quieres reactivar <strong>{toDeactivate.name}</strong>?</>}
                        </p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setToDeactivate(null)}>Cancelar</button>
                            <button type="button" className="btn btn-brand est-modal-btn"
                                    onClick={() => { onDeactivate?.(toDeactivate.id); setToDeactivate(null); }}>
                                {toDeactivate.status === "live" ? "Desactivar" : "Reactivar"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* modal eliminar campana */}
            {toDelete && (
                <Modal onClose={() => setToDelete(null)} labelledBy="cl-del-title" className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon"><Icon name="trash" size={20}/></div>
                        <h3 id="cl-del-title" className="est-modal-title">Eliminar campaña</h3>
                        <p className="est-modal-text">
                            ¿Seguro que quieres eliminar <strong>{toDelete.name}</strong>? Se eliminarán todos sus cupones asociados. Esta acción no se puede deshacer.
                        </p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setToDelete(null)}>Cancelar</button>
                            <button type="button" className="btn est-del-confirm est-modal-btn"
                                    onClick={() => { onDelete?.(toDelete.id); setToDelete(null); }}>
                                <Icon name="trash" size={14}/> Eliminar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}