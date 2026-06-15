/* genera un sufijo de 4 caracteres a partir del id del cupon */
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function reservationCode(couponId: string): string {
    let h = 0;
    for (let i = 0; i < couponId.length; i++) {
        h = (h * 31 + couponId.charCodeAt(i)) >>> 0;
    }
    let suffix = "";
    for (let i = 0; i < 4; i++) {
        suffix += CODE_CHARS[h % CODE_CHARS.length];
        h = Math.floor(h / CODE_CHARS.length);
    }
    return suffix;
}