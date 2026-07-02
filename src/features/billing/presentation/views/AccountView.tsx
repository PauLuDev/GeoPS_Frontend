import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { Plan } from "@/features/billing/domain/entities/Plan.ts";
import { CurrentSubscription } from "@/features/billing/domain/entities/CurrentSubscription.ts";
import { SubscriptionStatus } from "@/features/billing/domain/value-objects/SubscriptionStatus.ts";
import { formatMoney } from "@/features/billing/domain/value-objects/Money.ts";
import { useBilling } from "@/features/billing/presentation/hooks/useBilling.ts";
import { StripeCheckout } from "@/features/billing/presentation/components/StripeCheckout.tsx";
import { getCurrentUser } from "@/features/auth/application/session.ts";
import { firebaseRefreshToken } from "@/features/auth/infrastructure/firebaseAuth.ts";
import { setToken } from "@/shared/api/tokenStore.ts";

interface AccountViewProps {
    /* numero de establecimientos del dueno (el plan los cubre a todos) */
    establishmentCount?: number;
}

/* features destacadas por plan (claves i18n), por nombre de plan */
const PLAN_FEATURES: Record<string, string[]> = {
    "Freemium":     ["plans.featBasicSupport", "plans.featBasicStats"],
    "Premium":      ["plans.featPrioritySupport", "plans.featAdvancedAnalytics", "plans.featNoBranding"],
    "Premium Plus": ["plans.featPrioritySupport", "plans.featAdvancedAnalytics", "plans.featNoBranding"],
};

const KNOWN_STATUS: SubscriptionStatus[] = ["ACTIVE", "PENDING", "CANCELLED", "EXPIRED"];

export function AccountView({ establishmentCount = 0 }: AccountViewProps) {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language.startsWith("en") ? "en-US" : "es-PE";
    const me = getCurrentUser();
    const { listPlans, subscribe, cancelRenewal, mySubscriptions, currentSubscription, loading } = useBilling();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [sub, setSub] = useState<CurrentSubscription | null>(null);   // suscripcion activa real
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null); // id real para cancelar
    const [subscribingId, setSubscribingId] = useState<string | null>(null);
    /* plan en pago -> con su clientSecret del back */
    const [checkout, setCheckout] = useState<{ plan: Plan; clientSecret: string } | null>(null);
    const [success, setSuccess] = useState("");
    const [autoRenew, setAutoRenew]       = useState(true);
    const [confirmCancel, setConfirmCancel] = useState(false);

    useEffect(() => {
        let alive = true;
        listPlans().then(p => { if (alive && p) setPlans(p); });
        currentSubscription().then(s => { if (alive && s) setSub(s); });
        if (me?.id) mySubscriptions(me.id).then(subs => {
            if (alive && subs && subs[0]) setSubscriptionId(subs[0].id);
        });
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* el plan actual es el de la suscripcion real (por nombre) */
    const current = plans.find(p => p.name === sub?.planName);
    const isPaid = !!current && current.price.amount > 0;

    const rawStatus = sub?.status ?? "ACTIVE";
    const baseStatus: SubscriptionStatus = KNOWN_STATUS.includes(rawStatus as SubscriptionStatus)
        ? (rawStatus as SubscriptionStatus) : "ACTIVE";
    /* si el dueno cancelo la renovacion de un plan de pago sigue activo pero se ve como cancelada */
    const effectiveStatus: SubscriptionStatus = isPaid && !autoRenew ? "CANCELLED" : baseStatus;
    const statusKey = {
        ACTIVE: "Active", PENDING: "Pending", CANCELLED: "Cancelled", EXPIRED: "Expired",
    }[effectiveStatus];
    const couponsLive = effectiveStatus === "ACTIVE" || effectiveStatus === "CANCELLED";

    /* fin de periodo estimado -> hoy mas la duracion del plan (la suscripcion no expone la fecha) */
    const renewalDate = new Date(Date.now() + ((current?.durationDays || 30) * 86400000))
        .toLocaleDateString(dateLocale, { day: "2-digit", month: "long", year: "numeric" });

    const handleChoose = async (plan: Plan) => {
        /* freemium -> no hay cobro ni endpoint de baja de plan -> solo refleja el cambio */
        if (plan.price.amount === 0) {
            setAutoRenew(true);
            setSuccess(t("plans.upgraded", { plan: plan.name }));
            setTimeout(() => setSuccess(""), 4000);
            return;
        }
        setSubscribingId(plan.id);
        const clientSecret = await subscribe(plan.id);   // crea la suscripcion PENDING + intent en el back
        setSubscribingId(null);
        if (clientSecret !== null) setCheckout({ plan, clientSecret });   // abre el pago
    };

    /* pago confirmado -> el plan real cambia cuando el webhook del back lo activa.
       el webhook es asincrono (Stripe -> back), tarda 1-2s; por eso reintentamos
       leer /user/current hasta que figure el plan pagado, sin recargar la pagina */
    const pollForActivation = async (plan: Plan) => {
        for (let i = 0; i < 10; i++) {
            const s = await currentSubscription();
            if (s) {
                setSub(s);
                if (s.planName === plan.name && (s.status ?? "ACTIVE") === "ACTIVE") {
                    /* el IAM sube el rol (ROLE_PREMIUM/PLUS) via evento al activarse;
                       refrescamos el token para que ese rol nuevo llegue al back
                       (ej. el limite de campanas del marketing) sin re-login */
                    const fresh = await firebaseRefreshToken();
                    if (fresh) setToken(fresh);
                    return;
                }
            }
            await new Promise(r => setTimeout(r, 1500));
        }
    };

    const handlePaid = (plan: Plan) => {
        setCheckout(null);
        setAutoRenew(true);
        setSuccess(t("plans.upgraded", { plan: plan.name }));
        setTimeout(() => setSuccess(""), 4000);
        void pollForActivation(plan);
    };

    const handleCancelRenewal = async () => {
        setConfirmCancel(false);
        if (!subscriptionId) return;
        const res = await cancelRenewal(subscriptionId);
        if (res !== null) setAutoRenew(false);   // solo se marca cancelada si el back lo acepto
    };

    const handleReactivate = () => {
        setAutoRenew(true);
        setSuccess(t("plans.renewalReactivated"));
        setTimeout(() => setSuccess(""), 3000);
    };

    /* -1 = ilimitado */
    const limitLabel = (plan: Plan) =>
        plan.couponLimit < 0 ? t("plans.unlimited") : t("plans.couponLimit", { count: plan.couponLimit });

    const campaignLimitLabel = (plan: Plan) =>
        plan.campaignLimit < 0 ? t("plans.campaignsUnlimited") : t("plans.campaignLimit", { count: plan.campaignLimit });

    const priceLabel = (plan: Plan) =>
        plan.price.amount === 0 ? t("plans.free") : `${formatMoney(plan.price)}${plan.durationDays ? t("plans.perMonth") : ""}`;

    return (
        <div className="md plans-page">
            <header className="md-head">
                <div>
                    <div className="eyebrow">{t("establishments.eyebrow")}</div>
                    <h1 className="page-title">{t("merchant.navSubscription")}</h1>
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
                            <span className="sub-status-dot"/> {sub?.planName ?? "—"}
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
                    const isCurrent = plan.name === sub?.planName;
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
                                {(PLAN_FEATURES[plan.name] ?? []).map(k => (
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

            {checkout && (
                <StripeCheckout
                    plan={checkout.plan}
                    clientSecret={checkout.clientSecret}
                    onCancel={() => setCheckout(null)}
                    onSuccess={() => handlePaid(checkout.plan)}
                />
            )}
        </div>
    );
}
