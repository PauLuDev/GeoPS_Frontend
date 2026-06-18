/**
 * value object: duracion / vigencia de una campana
 * encapsula el formateo de duraciones ("1d 3h", "3h 30m") y
 * el calculo de dias entre fechas
 */

/* formatea una duracion en ms como "23d", "1d 3h", "3h 30m" o "45m" */
export function fmtDuration(ms: number): string {
    if (ms <= 0) return "—";
    const totalMin = Math.round(ms / 60_000);
    const days  = Math.floor(totalMin / 1440);
    const hours = Math.floor((totalMin % 1440) / 60);
    const mins  = totalMin % 60;
    if (days > 0)  return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    if (hours > 0) return mins  > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    return `${mins}m`;
}

/* dias enteros entre dos fechas ISO (minimo 1). `from` por defecto = ahora */
export function daysDiff(to: string, from?: string): number {
    const a = from ? new Date(from) : new Date();
    const b = new Date(to);
    return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

/* etiqueta de vigencia que vera el cliente en el cupon */
export function durationLabel(startISO: string, endISO: string): string {
    if (!endISO) return "según campaña";
    const start = startISO ? new Date(startISO).getTime() : Date.now();
    return fmtDuration(new Date(endISO).getTime() - start);
}

/* la fecha de fin es posterior a la de inicio? */
export function isRangeValid(startISO: string, endISO: string): boolean {
    if (!startISO || !endISO) return false;
    return endISO > startISO;
}