import { useRef, useState } from "react";
import { Plan } from "../../domain/entities/Plan.ts";
import { Subscription } from "../../domain/entities/Subscription.ts";
import { IBillingRepository } from "../../domain/repositories/IBillingRepository.ts";
import { HttpBillingRepository } from "../../infrastructure/repositories/HttpBillingRepository.ts";
import { getPlans } from "../../application/use-cases/GetPlans.ts";
import { subscribeToPlan } from "../../application/use-cases/SubscribeToPlan.ts";
import { getMySubscriptions } from "../../application/use-cases/GetMySubscriptions.ts";

/**
 * hook de presentacion: planes, suscripcion y estado del usuario
 */
export function useBilling(repository?: IBillingRepository) {
    const repoRef = useRef<IBillingRepository>(repository ?? new HttpBillingRepository());
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    const run = async <T>(action: () => Promise<T>): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            return await action();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error en billing");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        listPlans:        (): Promise<Plan[] | null> => run(() => getPlans(repoRef.current)),
        /* devuelve el clientSecret de Stripe para confirmar el pago */
        subscribe:        (planId: string): Promise<string | null> => run(() => subscribeToPlan(repoRef.current, planId)),
        mySubscriptions:  (userId: string): Promise<Subscription[] | null> => run(() => getMySubscriptions(repoRef.current, userId)),
    };
}