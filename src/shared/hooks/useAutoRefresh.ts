import { useEffect, useRef } from "react";

/**
 * llama a `onRefresh` periodicamente para mantener los datos al dia sin recargar
 * la pagina. solo dispara con la pestaña visible (no gasta red en segundo plano)
 * y ademas refresca de inmediato cuando la pestaña vuelve a primer plano.
 *
 * @param onRefresh accion de refresco (idealmente "silenciosa": sin spinner ni vaciar la lista)
 * @param intervalMs periodo en ms; <= 0 desactiva el polling
 */
export function useAutoRefresh(onRefresh: () => void, intervalMs = 20000) {
    /* ref para llamar siempre a la ultima version sin re-montar el intervalo */
    const cb = useRef(onRefresh);
    cb.current = onRefresh;

    useEffect(() => {
        if (intervalMs <= 0) return;

        const tick = () => { if (document.visibilityState === "visible") cb.current(); };
        const id = window.setInterval(tick, intervalMs);

        /* al volver a la pestaña (cambio de visibilidad o foco) refresca ya */
        const onForeground = () => { if (document.visibilityState === "visible") cb.current(); };
        document.addEventListener("visibilitychange", onForeground);
        window.addEventListener("focus", onForeground);

        return () => {
            window.clearInterval(id);
            document.removeEventListener("visibilitychange", onForeground);
            window.removeEventListener("focus", onForeground);
        };
    }, [intervalMs]);
}
