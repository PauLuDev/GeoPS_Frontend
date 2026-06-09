import { useState } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { BackgroundGrid } from "@/shared/ui/components/BackgroundGrid.tsx";
import { BrandMark } from "@/shared/ui/components/BrandMark.tsx";
import { useAuth } from "@/features/iam/presentation/hooks/useAuth.ts";
import { Role, isOwner as rolesHaveOwner } from "@/features/iam/domain/value-objects/Role.ts";

interface AuthScreenProps {
    mode: string;
    setMode: (m: string) => void;
    /* se llama al autenticar; `asOwner` indica si el usuario es dueno */
    onSuccess: (asOwner: boolean) => void;
}

const FEATURES = [
    { icon: "location", text: "Alcance hiperlocal en tu radio" },
    { icon: "chart",    text: "Estadísticas de reservas en vivo" },
    { icon: "check",    text: "Sin comisiones por canje" },
    { icon: "bell",     text: "Notificaciones a clientes cercanos" },
];

const BG_PINS = [[150, 140], [800, 180], [120, 520], [880, 560], [920, 300]];

export function AuthScreen({ mode, setMode, onSuccess }: AuthScreenProps) {
    const { signIn, signUp, loading, error } = useAuth();
    const [name, setName]         = useState("");
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [isOwner, setIsOwner]   = useState(false);
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
            <BackgroundGrid/>
            <div className="auth-bg" aria-hidden="true">
                <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" className="auth-bg-svg">
                    {BG_PINS.map(([x, y]) => (
                        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} opacity="0.5">
                            <circle r="40" fill="var(--brand)" opacity="0.06"/>
                            <path d="M 0 -16 C -7 -16 -12 -10 -12 -4 C -12 4 -6 10 0 16 C 6 10 12 4 12 -4 C 12 -10 7 -16 0 -16 Z"
                                  fill="var(--bg-elev)" stroke="var(--ink)" strokeWidth="1.5"/>
                            <circle cx="0" cy="-4" r="6" fill="var(--brand)"/>
                        </g>
                    ))}
                </svg>
            </div>

            <div className="auth-col-pair">
                <div className="card scale-in auth-card">
                    <div className="auth-brand-row">
                        <div className="brand"><BrandMark/><span>GeoPS</span></div>
                    </div>

                    <h2 className="auth-title">
                        {isSignup ? "Crea tu cuenta" : "Bienvenido de vuelta"}
                    </h2>
                    <p className="auth-subtitle">
                        {isSignup
                            ? "Empieza a descubrir cupones a tu alrededor en menos de un minuto."
                            : "Tus cupones cercanos te están esperando."}
                    </p>

                    <button type="button" className="btn auth-fullbtn">
                        <Icon name="google" size={16} stroke={0}/> Continuar con Google
                    </button>

                    <div className="div-label auth-divider">o con email</div>

                    <form onSubmit={submit} className="auth-form">
                        {isSignup && (
                            <div className="field">
                                <label htmlFor="auth-name">Nombre</label>
                                <input id="auth-name" className="input" placeholder="Daniela Gómez" value={name} onChange={e => setName(e.target.value)}/>
                            </div>
                        )}
                        <div className="field">
                            <label htmlFor="auth-email">Correo</label>
                            <input id="auth-email" className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"/>
                        </div>
                        <div className="field">
                            <label htmlFor="auth-password">Contraseña</label>
                            <input id="auth-password" className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"/>
                        </div>

                        {/* switch de rol (el estado se refleja con aria-pressed) */}
                        <button type="button" className="auth-role-toggle" aria-pressed={isOwner}
                                onClick={() => setIsOwner(v => !v)}>
                            <div className="auth-role-icon"><Icon name="store" size={14}/></div>
                            <div className="auth-role-text">
                                <div className="auth-role-title">Soy dueño de un negocio</div>
                                <div className="auth-role-sub">Publica campañas y administra tus establecimientos</div>
                            </div>
                            <div className="auth-role-track"><div className="auth-role-thumb"/></div>
                        </button>

                        {error && (
                            <div className="auth-error"><Icon name="close" size={13}/> {error}</div>
                        )}

                        <button type="submit" className="btn btn-brand auth-fullbtn auth-submit" disabled={loading}>
                            {loading ? "Conectando..." : (isSignup ? "Crear cuenta" : "Iniciar sesión")}
                            {!loading && <Icon name="arrowRight" size={16}/>}
                        </button>
                    </form>

                    <div className="auth-switch-row">
                        {isSignup ? "¿Ya tienes cuenta?" : "¿Nuevo en GeoPS?"}{" "}
                        <button type="button" className="auth-switch-btn"
                                onClick={() => setMode(isSignup ? "signin" : "signup")}>
                            {isSignup ? "Inicia sesión" : "Regístrate"}
                        </button>
                    </div>
                </div>

                {/* panel promocional */}
                <div className="scale-in auth-promo-panel auth-promo-delay">
                    <div>
                        <div className="eyebrow auth-promo-eyebrow">GeoPS Business</div>
                        <h3 className="auth-promo-title">
                            ¿Tienes un local?<br/>Llega a clientes a <em className="auth-promo-em">500 m</em> de tu puerta.
                        </h3>
                        <p className="auth-promo-text">
                            Activa <strong>"Soy dueño de un negocio"</strong> al registrarte para publicar campañas geolocalizadas y medir reservas en tiempo real.
                        </p>
                    </div>

                    <div className="auth-promo-features">
                        {FEATURES.map(f => (
                            <div key={f.text} className="auth-feature">
                                <div className="auth-feature-icon"><Icon name={f.icon} size={13}/></div>
                                {f.text}
                            </div>
                        ))}
                    </div>

                    <button type="button" className="btn btn-light btn-sm auth-promo-cta"
                            onClick={() => { setMode("signup"); setIsOwner(true); }}>
                        Registrarme como negocio <Icon name="arrowRight" size={13}/>
                    </button>

                    <div className="auth-promo-foot">BETA GRATUITA · SIN TARJETA · LIMA, PERÚ</div>
                </div>
            </div>

            <div className="auth-tagline">ENCRYPTED · GEOLOCATION-AWARE · NO TRACKING</div>
        </div>
    );
}