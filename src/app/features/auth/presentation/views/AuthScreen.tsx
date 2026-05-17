import {useEffect, useRef, useState} from "react";
import {Icon} from "@/app/ui/components/Icon.tsx";
import {Coupon} from "@/app/core/common/mockData.ts";
import {BackgroundGrid} from "@/app/ui/components/BackgroundGrid.tsx";
import {BrandMark} from "@/app/ui/components/BrandMark.tsx";

interface AuthScreenProps {
    mode: string;
    setMode: (m: string) => void;
    onSuccess: () => void;
    onBack: () => void;
    onSwitchRole: () => void;
}

export function AuthScreen({ mode, setMode, onSuccess, onBack, onSwitchRole }: AuthScreenProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const isSignup = mode === "signup";

    const submit = (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setTimeout(onSuccess, 700);
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
            <BackgroundGrid/>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4 }}>
                <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
                    {[[150,140],[800,180],[120,520],[880,560],[920,300]].map(([x,y], i) => (
                        <g key={i} transform={`translate(${x} ${y})`} opacity="0.5">
                            <circle r="40" fill="var(--brand)" opacity="0.06"/>
                            <path d="M 0 -16 C -7 -16 -12 -10 -12 -4 C -12 4 -6 10 0 16 C 6 10 12 4 12 -4 C 12 -10 7 -16 0 -16 Z"
                                  fill="var(--bg-elev)" stroke="var(--ink)" strokeWidth="1.5"/>
                            <circle cx="0" cy="-4" r="6" fill="var(--brand)"/>
                        </g>
                    ))}
                </svg>
            </div>

            <div style={{ position: "relative", zIndex: 1, width: "min(900px, 100%)", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20, alignItems: "start" }}>
                <div className="card scale-in" style={{ padding: 36, boxShadow: "var(--shadow-lg)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                        <button className="btn btn-ghost btn-sm" onClick={onBack}>
                            <Icon name="arrowLeft" size={14}/> Atrás
                        </button>
                        <div className="brand"><BrandMark/><span>GeoPS</span></div>
                    </div>

                    <h2 style={{ margin: "0 0 8px", fontSize: 28, letterSpacing: "-0.03em", fontWeight: 600 }}>
                        {isSignup ? "Crea tu cuenta" : "Bienvenido de vuelta"}
                    </h2>
                    <p style={{ margin: "0 0 24px", color: "var(--ink-2)", fontSize: 14 }}>
                        {isSignup ? "Empieza a descubrir cupones a tu alrededor en menos de un minuto." : "Tus cupones cercanos te están esperando."}
                    </p>

                    <button className="btn" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                        <Icon name="google" size={16} stroke={0}/> Continuar con Google
                    </button>

                    <div className="div-label" style={{ margin: "20px 0" }}>o con email</div>

                    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {isSignup && (
                            <div className="field">
                                <label>Nombre</label>
                                <input className="input" placeholder="Daniela Gómez"/>
                            </div>
                        )}
                        <div className="field">
                            <label>Correo</label>
                            <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"/>
                        </div>
                        <div className="field">
                            <label>Contraseña</label>
                            <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"/>
                        </div>
                        <button type="submit" className="btn btn-brand" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: 6 }}>
                            {loading ? "Conectando..." : (isSignup ? "Crear cuenta" : "Iniciar sesión")}
                            {!loading && <Icon name="arrowRight" size={16}/>}
                        </button>
                    </form>

                    <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--ink-2)" }}>
                        {isSignup ? "¿Ya tienes cuenta?" : "¿Nuevo en GeoPS?"}{" "}
                        <button style={{ appearance: "none", border: 0, padding: 0, background: "transparent", color: "var(--ink)", fontWeight: 500, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, fontFamily: "inherit", fontSize: 13 }}
                                onClick={() => setMode(isSignup ? "signin" : "signup")}>
                            {isSignup ? "Inicia sesión" : "Regístrate"}
                        </button>
                    </div>
                </div>

                <div className="scale-in" style={{
                    background: "linear-gradient(140deg, color-mix(in oklab, var(--brand) 75%, var(--bg)) 0%, color-mix(in oklab, var(--accent-2) 50%, var(--bg)) 100%)",
                    borderRadius: "var(--g-radius-xl)", padding: "32px 28px",
                    display: "flex", flexDirection: "column", gap: 22,
                    border: "1px solid color-mix(in oklab, var(--brand) 30%, transparent)",
                    animationDelay: "80ms"
                }}>
                    <div>
                        <div className="eyebrow" style={{ color: "var(--brand-ink)", opacity: 0.65, marginBottom: 8 }}>GeoPS Business</div>
                        <h3 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 600, letterSpacing: "-0.025em", color: "var(--brand-ink)", lineHeight: 1.15 }}>
                            ¿Tienes un local?<br/>Llega a clientes a <em style={{ fontStyle: "normal", borderBottom: "2px solid color-mix(in oklab, var(--brand-ink) 50%, transparent)" }}>500 m</em> de tu puerta.
                        </h3>
                        <p style={{ margin: 0, fontSize: 13.5, color: "var(--brand-ink)", opacity: 0.82, lineHeight: 1.6 }}>
                            Publica campañas geolocalizadas, mide reservas y canjes en tiempo real. Sin comisiones ocultas.
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                        {[
                            { icon: "location", text: "Alcance hiperlocal en tu radio" },
                            { icon: "chart",    text: "Estadísticas de reservas en vivo" },
                            { icon: "check",    text: "Sin comisiones por canje" },
                            { icon: "bell",     text: "Notificaciones a clientes cercanos" },
                        ].map((f, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--brand-ink)", opacity: 0.88 }}>
                                <div style={{ width: 26, height: 26, borderRadius: 7, background: "color-mix(in oklab, var(--brand-ink) 14%, transparent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                                    <Icon name={f.icon} size={13}/>
                                </div>
                                {f.text}
                            </div>
                        ))}
                    </div>

                    <div style={{ background: "color-mix(in oklab, var(--brand-ink) 8%, transparent)", borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px dashed color-mix(in oklab, var(--brand-ink) 25%, transparent)" }}>
                        <div>
                            <div style={{ fontSize: 11, color: "var(--brand-ink)", opacity: 0.6, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Ejemplo de campaña</div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--brand-ink)", marginTop: 3 }}>2x1 en lomo saltado</div>
                            <div style={{ fontSize: 12, color: "var(--brand-ink)", opacity: 0.7, marginTop: 2 }}>Tanta · Miraflores · 23 reservas hoy</div>
                        </div>
                        <div style={{ background: "var(--brand-ink)", color: "var(--brand)", borderRadius: 8, padding: "6px 12px", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                            −50%
                        </div>
                    </div>

                    <button className="btn btn-light btn-sm" style={{ alignSelf: "flex-start" }} onClick={onSwitchRole}>
                        Crear cuenta de negocio <Icon name="arrowRight" size={13}/>
                    </button>

                    <div style={{ fontSize: 10, color: "var(--brand-ink)", opacity: 0.45, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        BETA GRATUITA · SIN TARJETA · LIMA, PERÚ
                    </div>
                </div>
            </div>

            <style>{`
        @media (max-width: 680px) {
          .auth-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>

            <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center", color: "var(--ink-3)", fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                ENCRYPTED · GEOLOCATION-AWARE · NO TRACKING
            </div>
        </div>
    );
}