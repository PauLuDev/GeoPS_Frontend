import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { Plan } from "@/features/billing/domain/entities/Plan.ts";
import { SubscriptionStatus } from "@/features/billing/domain/value-objects/SubscriptionStatus.ts";
import { formatMoney } from "@/features/billing/domain/value-objects/Money.ts";
import { useBilling } from "@/features/billing/presentation/hooks/useBilling.ts";
import { getCurrentUser } from "@/features/auth/application/session.ts";

interface AccountViewProps {
    /* numero de establecimientos del dueno (el plan los cubre a todos) */
    establishmentCount?: number;
    /* plan actual, lo maneja el layout para sincronizar el sidebar */
    currentPlanId: string;
    onPlanChange: (plan: { id: string; name: string }) => void;
}

/* features destacadas por plan (claves i18n) */
const PLAN_FEATURES: Record<string, string[]> = {
    "plan-freemium": ["plans.featBasicSupport", "plans.featBasicStats"],
    "plan-premium":  ["plans.featPrioritySupport", "plans.featAdvancedAnalytics", "plans.featNoBranding"],
};

export function AccountView({ establishmentCount = 0, currentPlanId, onPlanChange }: AccountViewProps) {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language.startsWith("en") ? "en-US" : "es-PE";
    const me = getCurrentUser();
    const { listPlans, subscribe, cancelRenewal, mySubscriptions, loading } = useBilling();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subStatus, setSubStatus] = useState<SubscriptionStatus>("ACTIVE");  // estado de la suscripcion del dueno
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null); // id real de la suscripcion activa
    const [subscribingId, setSubscribingId] = useState<string | null>(null);
    const [success, setSuccess] = useState("");
    const [autoRenew, setAutoRenew]       = useState(true);   // renovacion automatica del plan actual
    const [confirmCancel, setConfirmCancel] = useState(false);

    useEffect(() => {
        let alive = true;
        listPlans().then(p => { if (alive && p) setPlans(p); });
        if (me?.id) mySubscriptions(me.id).then(subs => {
            if (alive && subs && subs[0]) { setSubStatus(subs[0].status); setSubscriptionId(subs[0].id); }
        });
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const current = plans.find(p => p.id === currentPlanId);
    const isPaid = !!current && current.price.amount > 0;

    /* estado efectivo -> si el dueno cancelo la renovacion de un plan de pago sigue activo pero se ve como "renovacion cancelada" */
    const effectiveStatus: SubscriptionStatus = isPaid && !autoRenew ? "CANCELLED" : subStatus;
    const statusKey = {
        ACTIVE: "Active", PENDING: "Pending", CANCELLED: "Cancelled", EXPIRED: "Expired",
    }[effectiveStatus];
    /* los cupones se promocionan mientras la suscripcion siga vigente */
    const couponsLive = effectiveStatus === "ACTIVE" || effectiveStatus === "CANCELLED";

    /* fin de periodo estimado -> hoy mas la duracion del plan (la suscripcion no expone la fecha) */
    const renewalDate = new Date(Date.now() + ((current?.durationDays || 30) * 86400000))
        .toLocaleDateString(dateLocale, { day: "2-digit", month: "long", year: "numeric" });

    const handleChoose = async (plan: Plan) => {
        setSubscribingId(plan.id);
        const secret = await subscribe(plan.id);   // clientSecret para confirmar el pago
        setSubscribingId(null);
        if (secret) {
            onPlanChange({ id: plan.id, name: plan.name });
            setAutoRenew(true);                     // un plan nuevo se renueva por defecto
            setSuccess(t("plans.upgraded", { plan: plan.name }));
            setTimeout(() => setSuccess(""), 4000);
        }
    };

    const handleCancelRenewal = async () => {
        if (subscriptionId) await cancelRenewal(subscriptionId);
        setAutoRenew(false);
        setConfirmCancel(false);
    };

    const handleReactivate = () => {
        setAutoRenew(true);
        setSuccess(t("plans.renewalReactivated"));
        setTimeout(() => setSuccess(""), 3000);
    };

    const limitLabel = (plan: Plan) =>
        plan.couponLimit === 0 ? t("plans.unlimited") : t("plans.couponLimit", { count: plan.couponLimit });

    const campaignLimitLabel = (plan: Plan) =>
        plan.campaignLimit === 0 ? t("plans.campaignsUnlimited") : t("plans.campaignLimit", { count: plan.campaignLimit });

    const priceLabel = (plan: Plan) =>
        plan.price.amount === 0 ? t("plans.free") : `${formatMoney(plan.price)}${plan.durationDays ? t("plans.perMonth") : ""}`;

    return (
        <div className="md plans-page">
            <header className="md-head">
                <div>
                    <div className="eyebrow">Mi negocio</div>
                    <h1 className="page-title">Suscripción</h1>
                    <p className="page-subtitle">
                        {(me?.email ?? me?.username ?? "")} · {t("account.coversAll", { count: establishmentCount })}
                    </p>
                </div>
            </header>

            {success && (
                <div className="plans-success"><Icon name="check" size={15}/> {success}</div>
            )}

            {/* estado de la suscripcion -> el dueno sabe si sus cupones estan activos */}
            <div className={"sub-status sub-status-" + effectiveStatus.toLowerCase()}>
                <div className="sub-status-icon">
                    <Icon name={couponsLive ? "check" : effectiveStatus === "PENDING" ? "clock" : "close"} size={18}/>
                </div>
                <div className="sub-status-text">
                    <div className="sub-status-title">
                        {t(`plans.status${statusKey}`)}
                        <span className={"sub-status-pill" + (couponsLive ? " on" : "")}>
                            <span className="sub-status-dot"/> {current?.name ?? "—"}
                        </span>
                    </div>
                    <div className="sub-status-sub">{t(`plans.status${statusKey}Sub`)}</div>
                </div>
            </div>

            {/* renovacion del plan de pago actual */}
            {isPaid && (
                <div className={"account-renewal" + (autoRenew ? "" : " off")}>
                    <div className="account-renewal-info">
                        <Icon name={autoRenew ? "clock" : "close"} size={15}/>
                        <span>{autoRenew ? t("plans.renewsOn", { date: renewalDate }) : t("plans.renewalCancelled", { date: renewalDate })}</span>
                    </div>
                    {autoRenew ? (
                        <button type="button" className="btn btn-sm" onClick={() => setConfirmCancel(true)}>
                            {t("plans.cancelRenewal")}
                        </button>
                    ) : (
                        <button type="button" className="btn btn-brand btn-sm" onClick={handleReactivate}>
                            {t("plans.reactivate")}
                        </button>
                    )}
                </div>
            )}

            <div className="eyebrow account-plan-eyebrow">{t("account.planSection")}</div>
            <p className="account-plan-sub">{t("plans.subtitle")}</p>

            <div className="plans-grid">
                {plans.map(plan => {
                    const isCurrent = plan.id === currentPlanId;
                    const isUpgrade = !!current && plan.price.amount > current.price.amount;
                    const busy = subscribingId === plan.id;
                    return (
                        <div key={plan.id} className={"card plan-card" + (isCurrent ? " current" : "")}>
                            {isCurrent && <span className="plan-badge">{t("plans.current")}</span>}
                            <div className="plan-name">{plan.name}</div>
                            <div className="plan-price">{priceLabel(plan)}</div>

                            <div className="plan-limit">
                                <Icon name="ticket" size={15}/> {limitLabel(plan)}
                            </div>
                            <div className="plan-limit">
                                <Icon name="flag" size={15}/> {campaignLimitLabel(plan)}
                            </div>

                            <ul className="plan-feats">
                                {(PLAN_FEATURES[plan.id] ?? []).map(k => (
                                    <li key={k}><Icon name="check" size={13}/> {t(k)}</li>
                                ))}
                            </ul>

                            {isCurrent ? (
                                <button type="button" className="btn plan-btn" disabled>{t("plans.current")}</button>
                            ) : (
                                <button type="button" className="btn btn-brand plan-btn"
                                        disabled={busy || loading}
                                        onClick={() => handleChoose(plan)}>
                                    {busy ? t("plans.processing") : isUpgrade ? t("plans.upgrade") : t("plans.switch")}
                                    {!busy && <Icon name="arrowRight" size={15}/>}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {confirmCancel && (
                <Modal onClose={() => setConfirmCancel(false)} ariaLabel={t("plans.cancelTitle")} className="review-confirm">
                    <div className="review-confirm-body">
                        <div className="review-confirm-icon warn"><Icon name="clock" size={20}/></div>
                        <h3 className="review-confirm-title">{t("plans.cancelTitle")}</h3>
                        <p className="review-confirm-text">{t("plans.cancelText", { date: renewalDate })}</p>
                        <div className="review-confirm-actions">
                            <button type="button" className="btn" onClick={() => setConfirmCancel(false)}>{t("plans.keepRenewal")}</button>
                            <button type="button" className="btn btn-brand" onClick={handleCancelRenewal}>{t("plans.confirmCancel")}</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}