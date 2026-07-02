import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { BackgroundGrid } from "@/shared/ui/components/BackgroundGrid.tsx";
import { BrandMark } from "@/shared/ui/components/BrandMark.tsx";
import { useAuth } from "@/features/auth/presentation/hooks/useAuth.ts";
import { Role, isOwner as rolesHaveOwner } from "@/features/auth/domain/value-objects/Role.ts";

interface AuthScreenProps {
    mode: string;
    setMode: (m: string) => void;
    /* se llama al autenticar; `asOwner` indica si el usuario es dueno */
    onSuccess: (asOwner: boolean) => void;
}

const FEATURES = [
    { icon: "location", key: "auth.featReach" },
    { icon: "chart", key: "auth.featStats" },
    { icon: "check", key: "auth.featNoFee" },
] as const;

const BG_PINS = [[150, 140], [800, 180], [120, 520], [880, 560], [920, 300]];

export function AuthScreen({ mode, setMode, onSuccess }: AuthScreenProps) {
    const { t } = useTranslation();
    const { signIn, signUp, loading, error } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isOwner, setIsOwner] = useState(false);
    const isSignup = mode === "signup";

    const submit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const roles: Role[] = [isOwner ? "ROLE_OWNER" : "ROLE_CUSTOMER"];
        const user = isSignup
            ? await signUp(name, email, password, roles)
            : await signIn(email, password, roles);
        if (user) onSuccess(rolesHaveOwner(user.roles));
    };

    return (
        <div className="auth-root">
            <BackgroundGrid />
            <div className="auth-bg" aria-hidden="true">
                <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" className="auth-bg-svg">
                    {BG_PINS.map(([x, y]) => (
                        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} opacity="0.5">
                            <circle r="40" fill="var(--brand)" opacity="0.06" />
                            <path d="M 0 -16 C -7 -16 -12 -10 -12 -4 C -12 4 -6 10 0 16 C 6 10 12 4 12 -4 C 12 -10 7 -16 0 -16 Z"
                                fill="var(--bg-elev)" stroke="var(--ink)" strokeWidth="1.5" />
                            <circle cx="0" cy="-4" r="6" fill="var(--brand)" />
                        </g>
                    ))}
                </svg>
            </div>

            <div className="auth-col-pair">
                <div className="card scale-in auth-card">
                    <div className="auth-brand-row">
                        <div className="brand"><BrandMark /><span>GeoPS</span></div>
                    </div>

                    <h2 className="auth-title">
                        {isSignup ? t("auth.titleSignup") : t("auth.titleSignin")}
                    </h2>
                    <p className="auth-subtitle">
                        {isSignup ? t("auth.subtitleSignup") : t("auth.subtitleSignin")}
                    </p>

                    <form onSubmit={submit} className="auth-form">
                        {isSignup && (
                            <div className="field">
                                <label htmlFor="auth-name">{t("auth.name")}</label>
                                <input id="auth-name" className="input" placeholder={t("auth.namePlaceholder")} value={name} onChange={e => setName(e.target.value)} />
                            </div>
                        )}
                        <div className="field">
                            <label htmlFor="auth-email">{t("auth.email")}</label>
                            <input id="auth-email" className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t("auth.emailPlaceholder")} />
                        </div>
                        <div className="field">
                            <label htmlFor="auth-password">{t("auth.password")}</label>
                            <input id="auth-password" className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                        </div>

                        {/* switch de rol -> solo en el registro; en el login el rol
                           sale de los claims del token, no de este toggle */}
                        {isSignup && (
                            <button type="button" className="auth-role-toggle" aria-pressed={isOwner}
                                onClick={() => setIsOwner(v => !v)}>
                                <div className="auth-role-icon"><Icon name="store" size={14} /></div>
                                <div className="auth-role-text">
                                    <div className="auth-role-title">{t("auth.ownerTitle")}</div>
                                    <div className="auth-role-sub">{t("auth.ownerSub")}</div>
                                </div>
                                <div className="auth-role-track"><div className="auth-role-thumb" /></div>
                            </button>
                        )}

                        {error && (
                            <div className="auth-error">{error.message}</div>
                        )}

                        <button type="submit" className="btn btn-brand auth-fullbtn auth-submit" disabled={loading}>
                            {loading ? t("auth.connecting") : (isSignup ? t("auth.createAccount") : t("auth.signIn"))}
                            {!loading && <Icon name="arrowRight" size={16} />}
                        </button>
                    </form>

                    <div className="auth-switch-row">
                        {isSignup ? t("auth.haveAccount") : t("auth.newHere")}{" "}
                        <button type="button" className="auth-switch-btn"
                            onClick={() => setMode(isSignup ? "signin" : "signup")}>
                            {isSignup ? t("auth.doSignIn") : t("auth.doSignUp")}
                        </button>
                    </div>
                </div>

                {/* panel promocional */}
                <div className="scale-in auth-promo-panel auth-promo-delay">
                    <div>
                        <div className="eyebrow auth-promo-eyebrow">{t("auth.promoEyebrow")}</div>
                        <h3 className="auth-promo-title">
                            {t("auth.promoTitlePre")}<br />{t("auth.promoTitleMid")}<em className="auth-promo-em">{t("auth.promoTitleEm")}</em>{t("auth.promoTitlePost")}
                        </h3>
                        <p className="auth-promo-text">
                            {t("auth.promoTextPre")}<strong>"{t("auth.ownerTitle")}"</strong>{t("auth.promoTextPost")}
                        </p>
                    </div>

                    <div className="auth-promo-features">
                        {FEATURES.map(f => (
                            <div key={f.key} className="auth-feature">
                                <div className="auth-feature-icon"><Icon name={f.icon} size={13} /></div>
                                {t(f.key)}
                            </div>
                        ))}
                    </div>

                    <button type="button" className="btn btn-light btn-sm auth-promo-cta"
                        onClick={() => { setMode("signup"); setIsOwner(true); }}>
                        {t("auth.ctaRegisterBusiness")} <Icon name="arrowRight" size={13} />
                    </button>

                    <div className="auth-promo-foot">{t("auth.promoFoot")}</div>
                </div>
            </div>

            <div className="auth-tagline">{t("auth.tagline")}</div>
        </div>
    );
}