import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { Select } from "@/shared/ui/components/Select.tsx";
import { Campaign } from "@/features/campaigns/domain/entities/Campaign.ts";
import { EditCampaign } from "@/features/campaigns/domain/repositories/ICampaignRepository.ts";
import { CampaignCoupon } from "@/features/campaigns/domain/entities/CampaignCoupon.ts";
import { CampaignCouponsEditor } from "@/features/campaigns/presentation/components/CampaignCouponsEditor.tsx";
import { STATUS_COLOR, STATUS_BG, STATUS_LABEL } from "@/features/campaigns/domain/value-objects/CampaignStatus.ts";
import { bestCouponId, ratePct, redemptionRate } from "@/features/campaigns/domain/value-objects/Performance.ts";
import { promotionLabel } from "@/features/campaigns/domain/value-objects/PromotionType.ts";
import { filterCampaigns, countByStatus, StatusFilter } from "@/features/campaigns/application/use-cases/ListCampaigns.ts";
import { listCampaignAnalytics } from "@/features/analytics/application/use-cases/ListCampaignAnalytics.ts";
import { CampaignStats } from "@/features/analytics/domain/entities/CampaignAnalytics.ts";

const statusFilterOrder: StatusFilter[] = ["all", "live", "scheduled", "draft", "ended"];

interface CampaignsListProps {
    campaigns: Campaign[];
    onNew: () => void;
    onOpen?: (c: Campaign) => void;
    onDeactivate?: (id: number) => void;
    onDelete?: (id: number) => void;
    onEdit?: (id: number, data: EditCampaign) => void;
    /* establecimientos del dueno, para filtrar las campanas por establecimiento */
    establishments?: { id: string; name: string }[];
    /* cupones del dueno sin campana, para sumarlos a una campana desde el modal */
    unassignedCoupons?: CampaignCoupon[];
    onAddCouponToCampaign?: (campaign: Campaign, couponId: string) => Promise<boolean>;
    onRemoveCouponFromCampaign?: (couponId: string) => Promise<boolean>;
    onDeleteCoupon?: (couponId: string) => Promise<boolean>;
}

export function CampaignsList({
    campaigns, onNew, onOpen, onDeactivate, onDelete, onEdit,
    establishments = [], unassignedCoupons = [], onAddCouponToCampaign, onRemoveCouponFromCampaign, onDeleteCoupon,
}: CampaignsListProps) {
    const { t } = useTranslation();
    const [filter, setFilter] = useState<StatusFilter>("all");
    const [search, setSearch] = useState("");
    const [selectedEstId, setSelectedEstId] = useState("all");
    const [menuOpen, setMenuOpen] = useState<number | null>(null);
    const [toDelete, setToDelete] = useState<Campaign | null>(null);
    const [toDeactivate, setToDeactivate] = useState<Campaign | null>(null);
    const [toEdit, setToEdit] = useState<Campaign | null>(null);
    const [editName, setEditName]   = useState("");
    const [editStart, setEditStart] = useState("");
    const [editEnd, setEditEnd]     = useState("");

    /* métricas reales de analytics, superpuestas a las campañas del marketing-service */
    const [metrics, setMetrics] = useState<Map<string, CampaignStats>>(new Map());
    const [metricsLoading, setMetricsLoading] = useState(false);

    useEffect(() => {
        setMetricsLoading(true);
        let alive = true;
        const load = async () => {
            try {
                const lists = selectedEstId === "all"
                    ? await Promise.all(establishments.map(e => listCampaignAnalytics(e.id).catch(() => [])))
                    : [await listCampaignAnalytics(selectedEstId).catch(() => [])];
                if (!alive) return;
                const next = new Map<string, CampaignStats>();
                lists.flat().forEach(c => { next.set(c.id, c.analytics); });
                setMetrics(next);
            } finally {
                if (alive) setMetricsLoading(false);
            }
        };
        void load();
        return () => { alive = false; };
    }, [selectedEstId, establishments]);

    /* helpers para leer métricas reales o fallback a la campaña */
    const campaignMetrics = (c: Campaign) => {
        const m = c.uuid ? metrics.get(c.uuid) : undefined;
        return {
            views: m?.viewsCount ?? c.views,
            reserved: m?.reservationsCount ?? c.reserved,
            redeemed: m?.redemptionsCount ?? c.redeemed,
        };
    };
    const fmtMetric = (n: number) => metricsLoading ? "—" : n.toLocaleString("es-PE");

    const openEdit = (c: Campaign) => {
        setToEdit(c);
        setEditName(c.name);
        setEditStart((c.startDate || "").slice(0, 10));
        setEditEnd((c.endDate || "").slice(0, 10));
    };

    /* tras agregar/quitar cupones la lista de campanas se recarga -> re-sincroniza
       la campana abierta en el modal para que su lista de cupones se vea al dia */
    useEffect(() => {
        if (!toEdit) return;
        const fresh = campaigns.find(c => c.id === toEdit.id);
        if (fresh && fresh !== toEdit) setToEdit(fresh);
    }, [campaigns, toEdit]);
    const saveEdit = () => {
        if (!toEdit || !onEdit) return;
        onEdit(toEdit.id, { name: editName.trim(), startDate: editStart, endDate: editEnd });
        setToEdit(null);
    };

    /* si el establecimiento elegido ya no existe, vuelve a "todos" */
    useEffect(() => {
        if (selectedEstId !== "all" && !establishments.some(e => e.id === selectedEstId)) setSelectedEstId("all");
    }, [establishments, selectedEstId]);

    /* campanas del establecimiento elegido (o todas) -> base para conteos y lista */
    const byEstablishment = selectedEstId === "all"
        ? campaigns
        : campaigns.filter(c => c.establishmentId === selectedEstId);

    const visible = filterCampaigns(byEstablishment, filter, search);

    /* mejor campana por tasa de canje, usando métricas reales */
    const bestId = useMemo(() => {
        let best: number | null = null;
        let bestRate = -1;
        for (const c of byEstablishment) {
            const { views, redeemed } = campaignMetrics(c);
            if (views <= 0) continue;
            const r = redemptionRate(views, redeemed);
            if (r > bestRate) { bestRate = r; best = c.id; }
        }
        return best;
    }, [byEstablishment, metrics]);

    const live      = countByStatus(byEstablishment, "live");
    const draft     = countByStatus(byEstablishment, "draft");
    const scheduled = countByStatus(byEstablishment, "scheduled");

    return (
        <div className="md cl-page">
            <header className="md-head">
                <div>
                    <h1 className="page-title">{t("campaigns.title")}</h1>
                    <p className="page-subtitle">
                        {t("campaigns.subtitle", { live, draft, scheduled })}
                    </p>
                </div>
                {campaigns.length > 0 && (
                    <button type="button" className="btn btn-brand" onClick={onNew}>
                        <Icon name="plus" size={14}/> {t("campaigns.new")}
                    </button>
                )}
            </header>

            <div className="card cl-card">
                {establishments.length > 1 && (
                    <div className="cl-est-bar">
                            <Select
                                value={selectedEstId}
                                options={[
                                    { value: "all", label: t("campaigns.allEstablishments") },
                                    ...establishments.map(e => ({ value: e.id, label: e.name })),
                                ]}
                                onChange={setSelectedEstId}
                            />
                    </div>
                )}
                <div className="cl-toolbar">
                    <div className="cl-filters">
                        {statusFilterOrder.map(value => (
                            <button type="button" key={value}
                                    className={"sort-pill " + (filter === value ? "active" : "")}
                                    onClick={() => setFilter(value)}>
                                {t(`campaigns.filters.${value}`)}
                                {value !== "all" && (
                                    <span className="pill-count">
                                        {countByStatus(byEstablishment, value)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="cl-spacer"/>
                    <div className="search-wrap cl-search">
                        <Icon name="search" size={14}/>
                        <input className="search-input cl-search-input" aria-label={t("campaigns.searchPlaceholder")} placeholder={t("campaigns.searchPlaceholder")}
                               value={search} onChange={e => setSearch(e.target.value)}/>
                    </div>
                </div>

                {visible.length === 0 ? (
                    <div className="cl-empty">
                        <div className="cl-empty-icon"><Icon name="ticket" size={32}/></div>
                        <div className="cl-empty-title">
                            {search ? t("campaigns.emptySearch") : t("campaigns.emptyCategory")}
                        </div>
                        {!search && (
                            <button type="button" className="btn btn-sm btn-brand cl-empty-cta" onClick={onNew}>
                                <Icon name="plus" size={12}/> {t("campaigns.create")}
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
                            const { views, reserved, redeemed } = campaignMetrics(c);
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
                                                    <span className="ct-best-badge" title={t("campaigns.best")}>
                                                        <Icon name="star" size={11}/> {t("campaigns.best")}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="cg-sub">
                                                {c.category} · {c.coupons.length} {c.coupons.length === 1 ? t("campaigns.coupon") : t("campaigns.coupons")} · #GEO-{(1000 + c.id).toString()}
                                            </div>
                                        </div>
                                        <div className="cg-metrics">
                                            <span><strong className="mono">{fmtMetric(views)}</strong> {t("campaigns.metrics.views")}</span>
                                            <span><strong className="mono">{fmtMetric(reserved)}</strong> {t("campaigns.metrics.reserved")}</span>
                                            <span><strong className="mono">{fmtMetric(redeemed)}</strong> {t("campaigns.metrics.redeemed")}</span>
                                            <span className="cg-metric-rate"><strong className="mono">{metricsLoading ? "—" : (views > 0 ? ratePct(views, redeemed) : "—")}</strong> {t("campaigns.metrics.conversion")}</span>
                                        </div>
                                        <div className="ct-actions ct-actions-menu" onClick={e => e.stopPropagation()}>
                                            <button type="button" className="btn btn-icon btn-sm" aria-label={t("campaigns.actions")}
                                                    onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)}>
                                                <Icon name="chevron" size={14}/>
                                            </button>
                                            {menuOpen === c.id && (
                                                <div className="ct-menu">
                                                    <button type="button" className="ct-menu-item"
                                                            onClick={() => { setMenuOpen(null); openEdit(c); }}>
                                                        <Icon name="edit" size={13}/> {t("common.edit")}
                                                    </button>
                                                    {c.status === "live" && (
                                                        <button type="button" className="ct-menu-item"
                                                                onClick={() => { setMenuOpen(null); setToDeactivate(c); }}>
                                                            <Icon name="close" size={13}/> {t("campaigns.deactivateTitle")}
                                                        </button>
                                                    )}
                                                    {c.status === "ended" && (
                                                        <button type="button" className="ct-menu-item"
                                                                onClick={() => { setMenuOpen(null); setToDeactivate(c); }}>
                                                            <Icon name="check" size={13}/> {t("campaigns.reactivateTitle")}
                                                        </button>
                                                    )}
                                                    <button type="button" className="ct-menu-item ct-menu-danger"
                                                            onClick={() => { setMenuOpen(null); setToDelete(c); }}>
                                                        <Icon name="trash" size={13}/> {t("common.delete")}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* cupones que pertenecen a esta campana */}
                                    <div className="cg-coupons">
                                        {ranked.length === 0 ? (
                                            <div className="cg-coupon-empty">{t("campaigns.noCoupons")}</div>
                                        ) : ranked.map(cp => (
                                            <div key={cp.id} className={"cg-coupon" + (cp.id === bestCoupon ? " cg-coupon-best" : "")}>
                                                <div className="cg-coupon-name">
                                                    {cp.id === bestCoupon && <Icon name="star" size={12}/>}
                                                    {cp.title}
                                                    <span className="cd-cat-tag">{promotionLabel(cp.promotionType, t)}</span>
                                                </div>
                                                <div className="cg-coupon-metrics mono">
                                                    <span>{cp.views.toLocaleString()} {t("campaigns.metrics.views")}</span>
                                                    <span>{cp.reserved.toLocaleString()} {t("campaigns.metrics.reserved")}.</span>
                                                    <span>{cp.redeemed.toLocaleString()} {t("campaigns.metrics.redeemed")}.</span>
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

            {/* modal de editar campana (nombre, fechas y cupones) */}
            {toEdit && (
                <Modal onClose={() => setToEdit(null)} ariaLabel={t("campaigns.editTitle")} className="est-modal cl-edit-modal">
                    <div className="est-modal-body">
                        <h3 className="est-modal-title">{t("campaigns.editTitle")}</h3>
                        <div className="field">
                            <label htmlFor="ce-name">{t("campaigns.name")}</label>
                            <input id="ce-name" className="input" value={editName} onChange={e => setEditName(e.target.value)}/>
                        </div>
                        <div className="nc-row2">
                            <div className="field">
                                <label htmlFor="ce-start">{t("campaigns.start")}</label>
                                <input id="ce-start" className="input" type="date" value={editStart} onChange={e => setEditStart(e.target.value)}/>
                            </div>
                            <div className="field">
                                <label htmlFor="ce-end">{t("campaigns.end")}</label>
                                <input id="ce-end" className="input" type="date" value={editEnd} onChange={e => setEditEnd(e.target.value)}/>
                            </div>
                        </div>
                        {onAddCouponToCampaign && onRemoveCouponFromCampaign && onDeleteCoupon && (
                            <CampaignCouponsEditor
                                campaign={toEdit}
                                unassignedCoupons={unassignedCoupons.filter(c =>
                                    !toEdit.establishmentId || c.establishmentId === toEdit.establishmentId
                                )}
                                onAddToCampaign={(couponId) => onAddCouponToCampaign(toEdit, couponId)}
                                onRemoveFromCampaign={onRemoveCouponFromCampaign}
                                onDeleteCoupon={onDeleteCoupon}
                            />
                        )}
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setToEdit(null)}>{t("common.cancel")}</button>
                            <button type="button" className="btn btn-brand est-modal-btn"
                                    disabled={!editName.trim() || !editStart || !editEnd || editEnd < editStart}
                                    onClick={saveEdit}>
                                <Icon name="check" size={14}/> {t("common.save")}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* modal desactivar/reactivar campana */}
            {toDeactivate && (
                <Modal onClose={() => setToDeactivate(null)} ariaLabel={t("campaigns.deactivateTitle")} className="est-modal">
                    <div className="est-modal-body">
                        <div className="est-modal-icon est-modal-icon-neutral">
                            <Icon name={toDeactivate.status === "live" ? "close" : "check"} size={20}/>
                        </div>
                        <h3 className="est-modal-title">
                            {toDeactivate.status === "live" ? t("campaigns.deactivateTitle") : t("campaigns.reactivateTitle")}
                        </h3>
                        <p className="est-modal-text">
                            {toDeactivate.status === "live"
                                ? t("campaigns.deactivateText", { name: toDeactivate.name })
                                : t("campaigns.reactivateText", { name: toDeactivate.name })}
                        </p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setToDeactivate(null)}>{t("common.cancel")}</button>
                            <button type="button" className="btn btn-brand est-modal-btn"
                                    onClick={() => { onDeactivate?.(toDeactivate.id); setToDeactivate(null); }}>
                                {toDeactivate.status === "live" ? t("campaigns.deactivateTitle") : t("campaigns.reactivateTitle")}
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
                        <h3 id="cl-del-title" className="est-modal-title">{t("campaigns.deleteTitle")}</h3>
                        <p className="est-modal-text">
                            {t("campaigns.deleteText", { name: toDelete.name })}
                        </p>
                        <div className="est-modal-actions">
                            <button type="button" className="btn est-modal-btn" onClick={() => setToDelete(null)}>{t("common.cancel")}</button>
                            <button type="button" className="btn est-del-confirm est-modal-btn"
                                    onClick={() => { onDelete?.(toDelete.id); setToDelete(null); }}>
                                <Icon name="trash" size={14}/> {t("common.delete")}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}