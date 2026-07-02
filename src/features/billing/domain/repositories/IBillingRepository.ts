import { Plan } from "../entities/Plan.ts";
import { Subscription } from "../entities/Subscription.ts";
import { CurrentSubscription } from "../entities/CurrentSubscription.ts";

/*
 contrato del repositorio de billing
 el pago devuelve un clientSecret que el front confirma con stripe
 al pagar, el back recibe el webhook y le sube el plan al usuario
*/
export interface IBillingRepository {
    getPlans(): Promise<Plan[]>;
    /* devuelve el clientSecret de stripe para confirmar el pago */
    createPaymentIntent(planId: string): Promise<string>;
    getMySubscriptions(userId: string): Promise<Subscription[]>;
    /* suscripcion activa del usuario con sus limites reales */
    getCurrentSubscription(): Promise<CurrentSubscription>;
    /* cancela la renovacion automatica; la suscripcion sigue activa hasta fin de periodo */
    cancelRenewal(subscriptionId: string): Promise<void>;
}