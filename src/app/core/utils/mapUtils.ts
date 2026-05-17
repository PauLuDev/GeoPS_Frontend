export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const p1 = lat1 * Math.PI / 180, p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180, dl = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dp/2)**2 + Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export function parseDiscount(d: string): number {
    const pct = d.match(/(\d+)%/); if (pct) return parseInt(pct[1]);
    if (/\dx\d/i.test(d)) return 50;
    return 0;
}

export function parseExpiry(e: string): number {
    if (/hoy/i.test(e)) return 0;
    const days = e.match(/(\d+)\s*d/i); if (days) return parseInt(days[1]);
    const wks = e.match(/(\d+)\s*sem/i); if (wks) return parseInt(wks[1]) * 7;
    return 999;
}

export function radiusToZoom(r: number): number {
    if (r <= 1000) return 14;
    if (r <= 3000) return 13;
    if (r <= 5000) return 12;
    if (r <= 10000) return 12;
    return 11;
}