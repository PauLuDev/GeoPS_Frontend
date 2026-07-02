import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { redeemByCode, RedeemOutcome } from "@/features/coupons/application/redeemCode.ts";
import { getCurrentUser } from "@/features/auth/application/session.ts";
import { mapApiError } from "@/shared/api/errorMapper.ts";

interface Redemption {
    couponId: string;
    title: string;
    at: string;
    day: string;   // YYYY-MM-DD local -> para filtrar "canjeados hoy"
}

/* el back no expone los canjes del comerciante, asi que guardamos los del dia
   en localStorage (por comerciante) para que sobrevivan recargas */
const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
const storageKey = () => `geops:redeemed:${getCurrentUser()?.id ?? "anon"}`;

function loadHistory(): Redemption[] {
    try {
        const raw = localStorage.getItem(storageKey());
        const all = raw ? (JSON.parse(raw) as Redemption[]) : [];
        return all.filter(r => r.day === today());   // solo los de hoy
    } catch {
        return [];
    }
}

function saveHistory(list: Redemption[]) {
    try {
        localStorage.setItem(storageKey(), JSON.stringify(list));
    } catch { /* almacenamiento no disponible */ }
}

export function RedeemView() {
    const { t } = useTranslation();
    const [code, setCode] = useState("");
    const [result, setResult] = useState<RedeemOutcome | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<Redemption[]>(loadHistory);

    /* persiste el historial del dia ante cada cambio (sobrevive recargas) */
    useEffect(() => { saveHistory(history); }, [history]);

    const validate = async () => {
        setLoading(true);
        const outcome = await redeemByCode(code);
        setResult(outcome);
        if (outcome.kind === "success") {
            setHistory(prev => [{
                couponId: outcome.coupon.id,
                title: outcome.coupon.title,
                at: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
                day: today(),
            }, ...prev]);
            setCode("");
        }
        setLoading(false);
    };

    const onSubmit = (e: React.FormEvent) => { e.preventDefault(); void validate(); };

    return (
        <div className="md rd-page">
            <header className="md-head">
                <div>
                    <h1 className="page-title">{t("redeem.title")}</h1>
                    <p className="page-subtitle">{t("redeem.subtitle")}</p>
                </div>
            </header>

            <div className="rd-grid">
                {/* formulario de canje */}
                <div className="card rd-card">
                    <form onSubmit={onSubmit}>
                        <label htmlFor="rd-code" className="rd-label">{t("redeem.codeLabel")}</label>
                        <input id="rd-code" className="input rd-input mono"
                               placeholder={t("redeem.codePlaceholder")}
                               value={code} autoComplete="off" autoFocus
                               onChange={e => { setCode(e.target.value); if (result) setResult(null); }}/>
                        <p className="rd-hint">
                            <Icon name="qr" size={12}/> {t("redeem.codeHint")}
                        </p>
                        <button type="submit" className="btn btn-brand rd-submit" disabled={!code.trim() || loading}>
                            <Icon name="check" size={15}/> {loading ? t("redeem.validating") : t("redeem.validate")}
                        </button>
                    </form>

                    {/* resultado de la validacion */}
                    {result?.kind === "success" && (
                        <div className="rd-result rd-ok scale-in">
                            <div className="rd-result-icon ok"><Icon name="check" size={22}/></div>
                            <div className="rd-result-title">{t("redeem.successTitle")}</div>
                            <div className="rd-result-coupon">
                                <strong>{result.coupon.title}</strong>
                                <span className="rd-result-disc">−{result.coupon.discount}</span>
                            </div>
                            <div className="rd-result-sub">{t("redeem.successSub")}</div>
                        </div>
                    )}
                    {result?.kind === "already" && (
                        <div className="rd-result rd-warn scale-in">
                            <div className="rd-result-icon warn"><Icon name="clock" size={22}/></div>
                            <div className="rd-result-title">{t("redeem.alreadyTitle")}</div>
                            <div className="rd-result-sub">{t("redeem.alreadySub")}</div>
                        </div>
                    )}
                    {result?.kind === "notfound" && (
                        <div className="rd-result rd-err scale-in">
                            <div className="rd-result-icon err"><Icon name="close" size={22}/></div>
                            <div className="rd-result-title">{t("redeem.notFoundTitle")}</div>
                            <div className="rd-result-sub">{t("redeem.notFoundSub")}</div>
                        </div>
                    )}
                    {result?.kind === "error" && (
                        <div className="rd-result rd-err scale-in">
                            <div className="rd-result-icon err"><Icon name="close" size={22}/></div>
                            <div className="rd-result-title">{t("redeem.errorTitle")}</div>
                            <div className="rd-result-sub">{t("redeem.errorSub", { message: mapApiError(result.error, t).message })}</div>
                        </div>
                    )}
                </div>

                {/* historial de canjes de la sesion */}
                <div className="card rd-history">
                    <div className="eyebrow">{t("redeem.today")}</div>
                    {history.length === 0 ? (
                        <div className="rd-history-empty">
                            <Icon name="ticket" size={28} className="rd-history-empty-icon"/>
                            <div>{t("redeem.emptyToday")}</div>
                        </div>
                    ) : (
                        <div className="rd-history-list">
                            {history.map((h, i) => (
                                <div key={h.couponId + i} className="rd-history-row">
                                    <div className="rd-history-check"><Icon name="check" size={13}/></div>
                                    <div className="rd-history-main">
                                        <div className="rd-history-title">{h.title}</div>
                                        <div className="rd-history-meta mono">{h.couponId.toUpperCase()}</div>
                                    </div>
                                    <div className="rd-history-time mono">{h.at}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}