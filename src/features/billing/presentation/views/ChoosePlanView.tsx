import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { BrandMark } from "@/shared/ui/components/BrandMark.tsx";
import { Plan } from "@/features/billing/domain/entities/Plan.ts";
import { formatMoney } from "@/features/billing/domain/value-objects/Money.ts";
import { useBilling } from "@/features/billing/presentation/hooks/useBilling.ts";
import { StripeCheckout } from "@/features/billing/presentation/components/StripeCheckout.tsx";

interface ChoosePlanViewProps {
    /* el dueno ya eligio su plan -> entra al panel */
    onDone: () => void;
}

/* features destacadas por plan (claves i18n), por nombre de plan */
const PLAN_FEATURES: Record<string, string[]> = {
    "Freemium":     ["plans.featBasicSupport", "plans.featBasicStats"],
    "Premium":      ["plans.featPrioritySupport", "plans.featAdvancedAnalytics", "plans.featNoBranding"],
    "Premium Plus": ["plans.featPrioritySupport", "plans.featAdvancedAnalytics", "plans.featNoBranding"],
};

/*
 paso de plan tras registrar el negocio -> freemium entra directo, premium/plus pasan por el pago
*/
export function ChoosePlanView({ onDone }: ChoosePlanViewProps) {
    const { t } = useTranslation();
    const { listPlans, subscribe, loading } = useBilling();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [busyId, setBusyId] = useState<string | null>(null);
    /* plan en pago -> con su clientSecret del back */
    const [checkout, setCheckout] = useState<{ plan: Plan; clientSecret: string | null } | null>(null);

    useEffect(() => {
        let alive = true;
        listPlans().then(p => { if (alive && p) setPlans(p); });
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const limitLabel = (plan: Plan) =>
        plan.couponLimit < 0 ? t("plans.unlimited") : t("plans.couponLimit", { count: plan.couponLimit });
    const campaignLimitLabel = (plan: Plan) =>
        plan.campaignLimit < 0 ? t("plans.campaignsUnlimited") : t("plans.campaignLimit", { count: plan.campaignLimit });
    const priceLabel = (plan: Plan) =>
        plan.price.amount === 0 ? t("plans.free") : `${formatMoney(plan.price)}${plan.durationDays ? t("plans.perMonth") : ""}`;

    const handlePick = async (plan: Plan) => {
        if (plan.price.amount === 0) { onDone(); return; }   // freemium -> al panel
        setBusyId(plan.id);
        const clientSecret = await subscribe(plan.id);       // crea la suscripcion PENDING + intent en el back
        setBusyId(null);
        setCheckout({ plan, clientSecret });                 // abre el pago
    };

    return (
        <div className="choose-plan">
            <div className="choose-plan-top">
                <div className="brand"><BrandMark/><span>GeoPS</span></div>
            </div>

            <div className="choose-plan-head">
                <div className="eyebrow">{t("choosePlan.eyebrow")}</div>
                <h1 className="choose-plan-title">{t("choosePlan.title")}</h1>
                <p className="choose-plan-sub">{t("choosePlan.subtitle")}</p>
            </div>

            <div className="choose-plan-grid">
                {plans.map(plan => {
                    const isFree = plan.price.amount === 0;
                    const busy = busyId === plan.id;
                    return (
                        <div key={plan.id} className="card plan-card">
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

                            <button type="button" className="btn btn-brand plan-btn"
                                    disabled={busy || loading}
                                    onClick={() => handlePick(plan)}>
                                {busy ? t("plans.processing") : isFree ? t("choosePlan.startFree") : t("choosePlan.selectPlan")}
                                {!busy && <Icon name="arrowRight" size={15}/>}
                            </button>
                        </div>
                    );
                })}
            </div>

            {checkout && (
                <StripeCheckout
                    plan={checkout.plan}
                    clientSecret={checkout.clientSecret}
                    onCancel={() => setCheckout(null)}
                    onSuccess={onDone}
                />
            )}
        </div>
    );
}
