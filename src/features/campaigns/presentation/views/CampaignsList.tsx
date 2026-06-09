import { useState } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Campaign } from "@/features/campaigns/domain/entities/Campaign.ts";
import { STATUS_COLOR, STATUS_BG, STATUS_LABEL } from "@/features/campaigns/domain/value-objects/CampaignStatus.ts";
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
}

export function CampaignsList({ campaigns, onNew }: CampaignsListProps) {
    const [filter, setFilter] = useState<StatusFilter>("all");
    const [search, setSearch] = useState("");

    const visible = filterCampaigns(campaigns, filter, search);

    const live      = countByStatus(campaigns, "live");
    const draft     = countByStatus(campaigns, "draft");
    const scheduled = countByStatus(campaigns, "scheduled");

    return (
        <div className="md cl-page">
            <header className="md-head">
                <div>
                    <div className="eyebrow">Operación</div>
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
                    <div className="campaigns-table stagger">
                        <div className="ct-head">
                            <div>Campaña</div><div>Estado</div><div>Vistos</div>
                            <div>Reservados</div><div>Redimidos</div><div>Stock</div><div>Tiempo</div><div></div>
                        </div>
                        {visible.map(c => (
                            <div key={c.id} className="ct-row">
                                <div className="ct-name-cell">
                                    <div className={"ct-avatar" + (c.status === "live" ? " live" : "")}/>
                                    <div className="ct-name-wrap">
                                        <div className="ct-name">{c.name}</div>
                                        <div className="ct-id">#GEO-{(1000 + c.id).toString()}</div>
                                    </div>
                                </div>
                                <div>
                                    <span className="badge" style={{ background: STATUS_BG[c.status], color: STATUS_COLOR[c.status] }}>
                                        {c.status === "live" && <span className="status-dot"/>}
                                        {STATUS_LABEL[c.status]}
                                    </span>
                                </div>
                                <div className="mono tnum">{c.views.toLocaleString()}</div>
                                <div className="mono tnum">{c.reserved.toLocaleString()}</div>
                                <div className="mono tnum">{c.redeemed.toLocaleString()}</div>
                                <div>
                                    {c.total > 0 ? (
                                        <div className="ct-stock-cell">
                                            <span className="mono ct-stock-num">{c.stock}/{c.total}</span>
                                            <div className="stock-bar ct-stock-bar">
                                                <div className={"stock-fill" + (c.stock === 0 ? " empty" : "")}
                                                     style={{ width: `${(c.stock / c.total) * 100}%` }}/>
                                            </div>
                                        </div>
                                    ) : "—"}
                                </div>
                                <div className="mono ct-time">{c.end}</div>
                                <div className="ct-actions">
                                    <button type="button" className="btn btn-icon btn-sm">
                                        <Icon name="chevron" size={14}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}