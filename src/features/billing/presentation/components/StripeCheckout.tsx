import { useState } from "react";
import { useTranslation } from "react-i18next";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { Plan } from "@/features/billing/domain/entities/Plan.ts";
import { formatMoney } from "@/features/billing/domain/value-objects/Money.ts";

/* clave publica del front -> si falta, el pago no esta configurado */
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
/* instancia de stripe.js cargada una sola vez */
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface StripeCheckoutProps {
    plan: Plan;
    /* clientSecret que devuelve el back (create-intent) -> se confirma con stripe.js */
    clientSecret: string | null;
    onCancel: () => void;
    /* pago confirmado -> el webhook del back marca la suscripcion ACTIVE */
    onSuccess: () => void;
}

/*
 pago con tarjeta del paso de plan -> confirma el clientSecret del back con stripe elements
 el color del input se toma del tema actual (--ink) para que combine en claro/oscuro
*/
export function StripeCheckout({ plan, clientSecret, onCancel, onSuccess }: StripeCheckoutProps) {
    const { t } = useTranslation();
    const configured = !!stripePromise && !!clientSecret;

    return (
        <Modal onClose={onCancel} ariaLabel={t("choosePlan.payTitle")} className="stripe-checkout">
            <div className="stripe-checkout-body">
                <div className="stripe-checkout-icon"><Icon name="ticket" size={20}/></div>
                <h3 className="stripe-checkout-title">{t("choosePlan.payTitle")}</h3>
                <p className="stripe-checkout-sub">
                    {t("choosePlan.paySubtitle", { plan: plan.name, price: formatMoney(plan.price) })}
                </p>

                {configured ? (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm plan={plan} clientSecret={clientSecret!} onCancel={onCancel} onSuccess={onSuccess}/>
                    </Elements>
                ) : (
                    <>
                        <div className="stripe-checkout-notice">
                            <Icon name="close" size={13}/> {t("choosePlan.stripePending")}
                        </div>
                        <div className="stripe-checkout-actions">
                            <button type="button" className="btn" onClick={onCancel}>{t("choosePlan.cancel")}</button>
                            <button type="button" className="btn btn-brand" onClick={onSuccess}>
                                {t("choosePlan.continueAnyway")} <Icon name="arrowRight" size={14}/>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}

interface CheckoutFormProps {
    plan: Plan;
    clientSecret: string;
    onCancel: () => void;
    onSuccess: () => void;
}

/* formulario real -> toma la tarjeta del CardElement y confirma el pago */
function CheckoutForm({ plan, clientSecret, onCancel, onSuccess }: CheckoutFormProps) {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* color del texto del input segun el tema (--ink del contenedor .geops-app) */
    const inkColor = () => {
        const root = document.querySelector(".geops-app");
        const c = root ? getComputedStyle(root).getPropertyValue("--ink").trim() : "";
        return c || "#1a1a1a";
    };

    const handlePay = async () => {
        if (!stripe || !elements) return;
        const card = elements.getElement(CardElement);
        if (!card) return;

        setPaying(true);
        setError(null);
        const result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
        setPaying(false);

        if (result.error) {
            setError(result.error.message ?? t("choosePlan.payError"));
            return;
        }
        if (result.paymentIntent?.status === "succeeded") onSuccess();
    };

    return (
        <>
            <div className="field stripe-checkout-field">
                <label>{t("choosePlan.cardLabel")}</label>
                <div className="stripe-card-box stripe-card-live">
                    <CardElement options={{
                        hidePostalCode: true,
                        style: { base: { fontSize: "14px", color: inkColor(), "::placeholder": { color: "#9aa0a6" } } },
                    }}/>
                </div>
            </div>

            {error && (
                <div className="stripe-checkout-notice"><Icon name="close" size={13}/> {error}</div>
            )}

            <div className="stripe-checkout-actions">
                <button type="button" className="btn" onClick={onCancel} disabled={paying}>{t("choosePlan.cancel")}</button>
                <button type="button" className="btn btn-brand" onClick={handlePay} disabled={paying || !stripe}>
                    {paying ? t("choosePlan.payProcessing") : t("choosePlan.pay", { price: formatMoney(plan.price) })}
                </button>
            </div>
        </>
    );
}
