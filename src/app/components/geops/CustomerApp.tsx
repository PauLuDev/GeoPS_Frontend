import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { CATEGORIES, COUPONS, USER_COORD, Coupon } from "./data";
import { Icon } from "./Icon";
import { LimaMap } from "./LimaMap";
import { GeoMap } from "./OSMMap";
import { PaymentModal } from "./PaymentModal";

function BackgroundGrid() {
  return (
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: `linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)`,
      backgroundSize: "32px 32px",
      maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)"
    }}/>
  );
}

function BrandMark() {
  return (
    <div className="brand-mark">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 22 C 6 15 4 11 4 8 a 8 8 0 0 1 16 0 c 0 3 -2 7 -8 14 z" fill="currentColor"/>
        <circle cx="12" cy="9" r="3" fill="var(--brand)"/>
      </svg>
    </div>
  );
}


interface OnboardingProps {
  onContinue: () => void;
  onSkip: () => void;
}

function Onboarding({ onContinue, onSkip }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const slides = [
    {
      eyebrow: "01 / Geolocaliza",
      title: <>Cupones <em style={{ fontStyle: "normal", color: "var(--brand-strong)" }}>cerca de ti</em>, en tiempo real.</>,
      body: "Activa tu ubicación una sola vez y descubre las mejores ofertas en un radio caminable. Sin perseguirte después.",
      visual: "map"
    },
    {
      eyebrow: "02 / Filtra",
      title: <>Solo lo que <em style={{ fontStyle: "normal", color: "var(--brand-strong)" }}>realmente</em> necesitas.</>,
      body: "Comida, café, salud, servicios. Tú decides la categoría y nosotros te enseñamos lo que está abierto y disponible ahora mismo.",
      visual: "filters"
    },
    {
      eyebrow: "03 / Reserva",
      title: <>Reserva, camina, <em style={{ fontStyle: "normal", color: "var(--brand-strong)" }}>ahorra</em>.</>,
      body: "Aparta tu cupón con un toque, llega al local y muéstralo. Sin códigos, sin trucos. Stock real, descuento real.",
      visual: "ticket"
    }
  ];
  const cur = slides[step];
  const next = () => step < slides.length - 1 ? setStep(s => s + 1) : onContinue();

  return (
    <div className="onboarding">
      <div className="onboarding-grid">
        <div className="onboarding-content">
          <div className="brand fade-in" style={{ marginBottom: "auto" }}>
            <BrandMark/>
            <span>GeoPS</span>
            <span className="brand-suffix">beta</span>
          </div>

          <div key={step} className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="eyebrow">{cur.eyebrow}</div>
            <h1 className="onboarding-title">{cur.title}</h1>
            <p className="onboarding-body">{cur.body}</p>
          </div>

          <div className="onboarding-foot">
            <div className="dots">
              {slides.map((_, i) => (
                <button key={i} className={"dot " + (i === step ? "active" : "")} onClick={() => setStep(i)} aria-label={`Paso ${i + 1}`}/>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={onSkip}>Saltar</button>
              <button className="btn btn-brand btn-lg" onClick={next}>
                {step === slides.length - 1 ? "Empezar" : "Siguiente"}
                <Icon name="arrowRight" size={16}/>
              </button>
            </div>
          </div>
        </div>

        <div className="onboarding-visual">
          <OnboardingVisual variant={cur.visual} key={step}/>
        </div>
      </div>

      <style>{`
        .onboarding { min-height: 100vh; padding: 32px; background: var(--bg); }
        .onboarding-grid {
          height: calc(100vh - 64px); min-height: 640px;
          display: grid; grid-template-columns: minmax(420px, 1fr) 1.3fr; gap: 28px;
        }
        @media (max-width: 880px) {
          .onboarding-grid { grid-template-columns: 1fr; height: auto; min-height: 0; }
          .onboarding-visual { min-height: 360px; }
        }
        .onboarding-content {
          background: var(--bg-elev); border: 1px solid var(--line);
          border-radius: var(--g-radius-xl); padding: 40px;
          display: flex; flex-direction: column; gap: 32px;
        }
        .onboarding-title {
          font-size: clamp(36px, 4.4vw, 56px); line-height: 1.02;
          letter-spacing: -0.035em; font-weight: 600; margin: 0; text-wrap: balance;
        }
        .onboarding-body { font-size: 17px; line-height: 1.5; color: var(--ink-2); max-width: 44ch; margin: 0; }
        .onboarding-foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; }
        .dots { display: flex; gap: 6px; }
        .dot {
          appearance: none; border: 0; width: 8px; height: 8px; border-radius: 999px;
          background: var(--line-strong); cursor: pointer;
          transition: width 240ms ease, background 240ms ease;
        }
        .dot.active { width: 28px; background: var(--ink); }
        .onboarding-visual {
          background: var(--bg-elev); border: 1px solid var(--line);
          border-radius: var(--g-radius-xl); overflow: hidden; position: relative;
        }
      `}</style>
    </div>
  );
}

function OnboardingVisual({ variant }: { variant: string }) {
  if (variant === "map") {
    return (
      <div style={{ position: "relative", height: "100%", width: "100%" }} className="fade-in">
        <LimaMap pins={COUPONS.slice(0, 5)} userPos={{ x: 520, y: 380 }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, var(--bg-elev) 95%)", pointerEvents: "none" }}/>
        <div style={{ position: "absolute", left: 24, bottom: 24, right: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {COUPONS.slice(0, 3).map((c, i) => (
            <div key={c.id} className="card fade-up" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, animationDelay: `${300 + i * 120}ms` }}>
              <span className="badge badge-brand">−{c.discount}</span>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{c.brand}</div>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{c.distance}m</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (variant === "filters") {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 32, position: "relative" }}>
        <BackgroundGrid/>
        <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(2, 180px)", gap: 16, position: "relative" }}>
          {CATEGORIES.slice(1).map((cat, i) => (
            <div key={cat.id} className="card" style={{
              padding: 24, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start",
              borderColor: i === 0 ? "var(--ink)" : "var(--line)",
              background: i === 0 ? "var(--ink)" : "var(--bg-elev)",
              color: i === 0 ? "var(--bg)" : "var(--ink)"
            }}>
              <Icon name={cat.icon} size={22}/>
              <div style={{ fontWeight: 500, fontSize: 15 }}>{cat.label}</div>
              <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>
                {[24, 18, 31, 12, 9][i] || 0} cerca
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 32, position: "relative" }}>
      <BackgroundGrid/>
      <div className="ticket-card scale-in" style={{ position: "relative" }}>
        <div className="ticket-top">
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Cupón reservado</div>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>2x1 en lomo saltado</div>
            <div style={{ color: "var(--ink-2)", fontSize: 14, marginTop: 4 }}>Tanta · Av. Pardo 1145</div>
          </div>
          <span className="badge badge-brand" style={{ fontSize: 13, padding: "6px 12px" }}>−50%</span>
        </div>
        <div className="ticket-perforation"/>
        <div className="ticket-bottom">
          <div>
            <div className="eyebrow">Final</div>
            <div className="mono" style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em" }}>S/24<span style={{ fontSize: 14, color: "var(--ink-3)", textDecoration: "line-through", marginLeft: 8 }}>S/48</span></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="eyebrow">Vence</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 500 }}>2h 14m</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AuthScreenProps {
  mode: string;
  setMode: (m: string) => void;
  onSuccess: () => void;
  onBack: () => void;
  onSwitchRole: () => void;
}

function AuthScreen({ mode, setMode, onSuccess, onBack, onSwitchRole }: AuthScreenProps) {
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

interface CustomerTopbarProps {
  onProfileClick?: () => void;
  onSignOut?: () => void;
  locationName?: string;
  onLocationClick?: () => void;
}

function CustomerTopbar({ onProfileClick, onSignOut, locationName = "Miraflores", onLocationClick }: CustomerTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className="topbar">
      <div className="brand">
        <BrandMark/>
        <span>GeoPS</span>
        <span className="brand-suffix">cliente</span>
      </div>
      <div className="topbar-spacer"/>
      <button className="topbar-loc" onClick={onLocationClick}
              style={{ cursor: "pointer", background: "none", border: "1px solid var(--line)", borderRadius: 10, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5, fontFamily: "inherit", color: "var(--ink-2)", transition: "border-color 160ms ease" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--ink)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--line)")}>
        <Icon name="location" size={13}/>
        <span style={{ fontSize: 13, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{locationName}</span>
        <Icon name="chevronDown" size={11}/>
      </button>
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          style={{
            appearance: "none", border: "2px solid transparent", padding: 0,
            background: "transparent", cursor: "pointer", borderRadius: "50%",
            transition: "border-color 160ms ease",
            borderColor: menuOpen ? "var(--brand)" : "transparent"
          }}
        >
          <div className="avatar-mini">D</div>
        </button>

        {menuOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            background: "var(--bg-elev)", border: "1px solid var(--line)",
            borderRadius: 14, boxShadow: "var(--shadow-lg)", minWidth: 200,
            zIndex: 200, overflow: "hidden",
            animation: "geops-scale-in 180ms cubic-bezier(.2,.8,.2,1) both"
          }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
              <div className="avatar-mini" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>D</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Daniela Gómez</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>daniela@email.com</div>
              </div>
            </div>
            <div style={{ padding: "6px 0" }}>
              <button className="topbar-menu-item" onClick={() => { setMenuOpen(false); onProfileClick?.(); }}>
                <Icon name="user" size={14}/> Ver perfil
              </button>
              <button className="topbar-menu-item" onClick={() => { setMenuOpen(false); onLocationClick?.(); }}>
                <Icon name="location" size={14}/> Cambiar ubicación
              </button>
              <button className="topbar-menu-item" style={{ color: "var(--danger)" }}
                      onClick={() => { setMenuOpen(false); onSignOut?.(); }}>
                <Icon name="arrowLeft" size={14}/> Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .topbar-menu-item {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 9px 14px; appearance: none; border: 0;
          background: transparent; color: var(--ink);
          font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: var(--font-sans); text-align: left;
          transition: background 120ms ease;
        }
        .topbar-menu-item:hover { background: var(--bg-sunken); }
      `}</style>
    </div>
  );
}

interface BottomNavProps {
  tab: string;
  setTab: (t: string) => void;
  favCount: number;
}

function BottomNav({ tab, setTab, favCount }: BottomNavProps) {
  const items = [
    { id: "map", label: "Mapa", icon: "map" },
    { id: "categories", label: "Categorías", icon: "grid" },
    { id: "saved", label: "Guardados", icon: "bookmark", badge: favCount },
    { id: "profile", label: "Perfil", icon: "user" },
  ];
  return (
    <nav className="bottom-nav">
      {items.map(it => (
        <button key={it.id} className={"bn-item" + (tab === it.id ? " active" : "")}
                onClick={() => setTab(it.id)}>
          <span className="bn-icon-wrap">
            <Icon name={it.icon} size={20} stroke={tab === it.id ? 2 : 1.6}/>
            {(it.badge ?? 0) > 0 && <span className="bn-badge mono">{it.badge}</span>}
          </span>
          <span className="bn-label">{it.label}</span>
        </button>
      ))}
      <span className="bn-indicator" style={{
        transform: `translateX(${items.findIndex(i => i.id === tab) * 100}%)`,
        width: `${100 / items.length}%`,
      }}/>
    </nav>
  );
}

interface CouponCardProps {
  c: Coupon;
  isFav: boolean;
  isReserved: boolean;
  onToggleFav: () => void;
  onClick: () => void;
  isSelected: boolean;
  realDist?: number;
  realWalk?: number;
}

function CouponCard({ c, isFav, isReserved, onToggleFav, onClick, isSelected, realDist, realWalk }: CouponCardProps) {
  const dist = realDist ?? c.distance;
  const walk = realWalk ?? c.walking;
  const distLabel = dist >= 1000 ? `${(dist/1000).toFixed(1)}km` : `${dist}m`;
  return (
    <div className={"coupon-card" + (isSelected ? " selected" : "")} onClick={onClick}>
      <div className={"cc-thumb" + (c.imageUrl ? " has-img" : "")} style={{
        backgroundImage: c.imageUrl
          ? `url(${c.imageUrl})`
          : `linear-gradient(135deg, color-mix(in oklab, var(--brand) ${c.featured ? 70 : 30}%, var(--bg-sunken)) 0%, color-mix(in oklab, var(--accent-2) ${c.featured ? 30 : 10}%, var(--bg-sunken)) 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <span className="cc-discount">−{c.discount}</span>
        {c.featured && <span className="cc-feat"><Icon name="flame" size={10}/> Top</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{c.brand}</div>
            <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
          </div>
          <button style={{ appearance: "none", border: 0, background: "transparent", padding: 4, cursor: "pointer", color: isFav ? "var(--brand-strong)" : "var(--ink-3)" }}
                  onClick={e => { e.stopPropagation(); onToggleFav(); }}>
            <Icon name="bookmark" size={16} filled={isFav}/>
          </button>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8, fontSize: 11, color: "var(--ink-3)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }} className="mono">
            <Icon name="walking" size={11}/> {walk}min · {distLabel}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }} className="mono">
            <Icon name="clock" size={11}/> {c.expiresIn}
          </span>
          {isReserved && <span className="badge badge-ink" style={{ fontSize: 9 }}><Icon name="check" size={9}/> Reservado</span>}
        </div>
        <div className="stock-bar">
          <div className="stock-fill" style={{ width: `${(c.stock / c.totalStock) * 100}%` }}/>
        </div>
        <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
          {c.stock} / {c.totalStock} disponibles
        </div>
      </div>
    </div>
  );
}

const CAT_RESTRICTIONS: Record<string, string[]> = {
  food:     ["Válido lun.–jue. de 12:00 a 16:00", "Solo para consumo en local", "No aplica con otras promociones", "Mínimo 2 personas para el 2×1"],
  cafe:     ["Válido todos los días de 08:00 a 20:00", "Bebida de tamaño mediano máximo", "Un cupón por persona por día"],
  shop:     ["Solo para productos en stock marcados", "No aplica en outlet ni packs", "Compra mínima de S/50"],
  health:   ["Requiere cita previa en el local", "Válido solo para nuevos pacientes", "Lun.–sáb. en horario de atención"],
  services: ["Reserva con 24 h de anticipación", "Sujeto a disponibilidad de agenda", "Válido mar.–dom. de 10:00 a 20:00"],
};
const CAT_SCHEDULE: Record<string, string> = {
  food:     "Lun.–Jue. 12:00–16:00  ·  Vie.–Sáb. 12:00–17:00  ·  Dom. cerrado",
  cafe:     "Todos los días  08:00–21:00",
  shop:     "Lun.–Sáb. 10:00–21:00  ·  Dom. 11:00–19:00",
  health:   "Lun.–Vie. 08:00–18:00  ·  Sáb. 08:00–13:00",
  services: "Mar.–Dom. 10:00–20:00",
};
const TNC = "Al usar este cupón el usuario acepta que el beneficio es personal e intransferible, válido por una sola vez por cuenta registrada en GeoPS. El establecimiento puede rechazar el cupón si existe evidencia de mal uso. GeoPS no garantiza disponibilidad de stock después de la reserva si el usuario no se presenta dentro del plazo de 30 minutos. Los precios mostrados incluyen IGV. El beneficio no puede canjearse por dinero en efectivo.";

function seedRand(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function buildReviews(c: Coupon) {
  const rand = seedRand(c.id.charCodeAt(1) * 31 + c.reviews);
  const NAMES  = ["Carlos M.","Lucía R.","Diego P.","Valeria S.","Andrés T.","Camila F.","Miguel A.","Sofía L.","Fernanda C.","Rodrigo V."];
  const TEXTS  = [
    "Muy buen descuento, lo recomiendo al 100 %.",
    "Rápido y sin problema, en 5 min ya estaba usando el cupón.",
    "Excelente atención en el local, el descuento se aplicó sin rollos.",
    "Vale la pena, buena comida y precio justo para Lima.",
    "El staff fue amable y el proceso muy sencillo.",
    "Buen descuento aunque el stock se agota bastante rápido.",
    "Lo usé un martes, sin cola y bien atendido.",
    "Súper recomendado para el almuerzo del finde.",
    "Repetí al mes siguiente, igual de buena experiencia.",
    "La reserva fue instantánea, llegué y me atendieron al toque.",
  ];
  const DATES  = ["Hace 1 día","Hace 3 días","Hace 1 semana","Hace 2 semanas","Hace 1 mes"];
  const count  = 2 + Math.floor(rand() * 4);
  return Array.from({ length: count }, (_, i) => ({
    name:    NAMES[Math.floor(rand() * NAMES.length)],
    rating:  Math.max(3, Math.min(5, Math.round(c.rating + (rand() - 0.5) * 1.2))),
    comment: TEXTS[Math.floor(rand() * TEXTS.length)],
    date:    DATES[i % DATES.length],
  }));
}

interface CouponDetailViewProps {
  c: Coupon;
  isFav: boolean;
  isReserved: boolean;
  onToggleFav: () => void;
  onReserve: () => void;
  onBack: () => void;
  realDist?: number;
  realWalk?: number;
}

function CouponDetailView({ c, isFav, isReserved, onToggleFav, onReserve, onBack, realDist, realWalk }: CouponDetailViewProps) {
  const dist     = realDist ?? c.distance;
  const walk     = realWalk ?? c.walking;
  const distLabel = dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist} m`;
  const [reserved, setReserved] = useState(isReserved);
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied]    = useState(false);
  const [tcOpen, setTcOpen]    = useState(false);
  const reviews = useMemo(() => buildReviews(c), [c.id]);

  useEffect(() => { setReserved(isReserved); }, [c.id, isReserved]);

  const handleReserve = () => { onReserve(); setReserved(true); };

  const handleRoute = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}&destination_place_id=${encodeURIComponent(c.address)}`, "_blank");
  };

  const handleShare = () => {
    const url = `https://geops.app/c/${c.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200); }).catch(fallback);
    } else { fallback(); }
    function fallback() {
      const el = document.createElement("input"); el.value = url;
      document.body.appendChild(el); el.select(); document.execCommand("copy");
      document.body.removeChild(el); setCopied(true); setTimeout(() => setCopied(false), 2200);
    }
  };

  const restrictions = CAT_RESTRICTIONS[c.category] ?? CAT_RESTRICTIONS.food;
  const schedule     = CAT_SCHEDULE[c.category]     ?? CAT_SCHEDULE.food;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--bg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--line)", background: "var(--bg-elev)", flexShrink: 0 }}>
        <button className="btn btn-icon btn-sm" onClick={onBack} title="Volver">
          <Icon name="arrowLeft" size={16}/>
        </button>
        <span style={{ fontSize: 12, color: "var(--ink-3)", flex: 1 }}>Detalle del cupón</span>
        <button className="btn btn-icon btn-sm" onClick={onToggleFav}
                style={{ color: isFav ? "var(--brand-strong)" : "var(--ink-2)" }}>
          <Icon name="bookmark" size={16} filled={isFav}/>
        </button>
        <button className="btn btn-icon btn-sm" onClick={handleShare}
                style={{ color: copied ? "var(--brand-strong)" : "var(--ink-2)" }} title="Copiar enlace">
          <Icon name={copied ? "check" : "share"} size={16}/>
        </button>
      </div>
      {copied && (
        <div style={{ background: "var(--ink)", color: "var(--bg)", fontSize: 12, padding: "8px 16px", textAlign: "center" }}>
          ✓ Enlace copiado al portapapeles
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ position: "relative", height: 200, overflow: "hidden", flexShrink: 0,
          background: c.imageUrl ? "transparent"
            : `linear-gradient(135deg, color-mix(in oklab, var(--brand) 50%, var(--bg-sunken)) 0%, color-mix(in oklab, var(--accent-2) 30%, var(--bg-sunken)) 100%)` }}>
          {c.imageUrl && <img src={c.imageUrl} alt={c.brand} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}/>}
          <div style={{ position: "absolute", inset: 0, background: c.imageUrl ? "linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 60%)" : "none" }}/>
          {!c.imageUrl && <div className="cd-hero-pattern"/>}
          <div style={{ position: "absolute", left: 20, bottom: 18, color: c.imageUrl ? "#fff" : "var(--brand-ink)" }}>
            <div style={{ fontSize: 11, opacity: 0.75, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{c.brand}</div>
            <div style={{ fontSize: 48, lineHeight: 1, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "-0.04em", marginTop: 4 }}>−{c.discount}</div>
          </div>
          <div style={{ position: "absolute", right: 20, bottom: 18, textAlign: "right", color: c.imageUrl ? "#fff" : "var(--brand-ink)" }}>
            <div style={{ fontSize: 11, opacity: 0.65, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Vence</div>
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 2 }}>{c.expiresIn}</div>
          </div>
          {c.featured && (
            <div style={{ position: "absolute", top: 12, left: 12, background: "var(--warn)", color: "#fff", fontSize: 10, padding: "3px 8px", borderRadius: 6, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="flame" size={10}/> Destacado
            </div>
          )}
        </div>

        <div style={{ padding: "20px 20px 0" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{c.title}</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: "var(--ink-2)", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              <Icon name="star" size={12} filled/> <strong style={{ color: "var(--ink)" }}>{c.rating}</strong> ({c.reviews} reseñas)
            </span>
            <span>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="location" size={11}/>{c.address}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16, background: "var(--bg-sunken)", borderRadius: 12, padding: "14px 12px" }}>
            {[
              { label: "Precio final", value: `S/${c.finalPrice}`, sub: `antes S/${c.originalPrice}` },
              { label: "Distancia", value: distLabel, sub: `${walk} min a pie` },
              { label: "Stock", value: `${c.stock}`, sub: `de ${c.totalStock} dispon.` },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--ink-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="stock-bar" style={{ marginTop: 8 }}>
            <div className="stock-fill" style={{ width: `${(c.stock / c.totalStock) * 100}%` }}/>
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Sobre la oferta</div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 }}>{c.description}</p>
          </div>

          <div style={{ marginTop: 20, padding: 14, background: "var(--bg-sunken)", borderRadius: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-elev)", border: "1px solid var(--line)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon name="clock" size={14}/>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Horario de válido</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.7, fontFamily: "var(--font-mono)" }}>{schedule}</div>
            </div>
          </div>

          <button className="btn btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: 14, gap: 10 }} onClick={handleRoute}>
            <Icon name="map" size={16}/> Ver ruta en Google Maps
          </button>

          {reserved && (
            <div className="cd-reserved scale-in" style={{ marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="cd-check"><Icon name="check" size={16}/></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Reservado a tu nombre</div>
                  <div style={{ fontSize: 12, color: "var(--ink-2)" }}>Muestra esta pantalla en el local. Stock reservado 30 min.</div>
                </div>
              </div>
              <div className="cd-code">
                <div className="cd-code-pattern">
                  <div className="cd-code-id mono">GEOPS · {c.id.toUpperCase()} · 7K3X</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, borderTop: "1px solid var(--line)", paddingTop: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Restricciones</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {restrictions.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--ink-2)" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, background: "var(--bg-sunken)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                    <Icon name="close" size={9}/>
                  </div>
                  {r}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            <button style={{ width: "100%", appearance: "none", border: 0, background: "transparent", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", color: "var(--ink)" }}
                    onClick={() => setTcOpen(o => !o)}>
              <span className="eyebrow">Términos y condiciones</span>
              <Icon name={tcOpen ? "chevronDown" : "chevron"} size={14}/>
            </button>
            {tcOpen && (
              <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--ink-3)", lineHeight: 1.65 }}>{TNC}</p>
            )}
          </div>

          <div style={{ marginTop: 20, borderTop: "1px solid var(--line)", paddingTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div className="eyebrow">Reseñas</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}>
                <Icon name="star" size={13} filled style={{ color: "var(--warn)" }}/>
                <strong>{c.rating}</strong>
                <span style={{ color: "var(--ink-3)" }}>({c.reviews})</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {reviews.map((r, i) => (
                <div key={i} style={{ padding: 14, background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-sunken)", border: "1px solid var(--line)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600 }}>
                        {r.name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.date}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: 5 }, (_, s) => (
                        <Icon key={s} name="star" size={11} filled={s < r.rating} style={{ color: s < r.rating ? "var(--warn)" : "var(--line-strong)" }}/>
                      ))}
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 90 }}/>
        </div>
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)", background: "var(--bg-elev)", flexShrink: 0 }}>
        {reserved ? (
          <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={onBack}>
            Listo · ir al local <Icon name="walking" size={16}/>
          </button>
        ) : (
          <button className="btn btn-brand btn-lg" style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => setShowPayment(true)}>
            {c.finalPrice === 0 ? "Reservar gratis" : `Reservar · S/${c.finalPrice}`}
            <Icon name="arrowRight" size={16}/>
          </button>
        )}
      </div>

      {showPayment && (
        <PaymentModal coupon={c} onSuccess={handleReserve} onClose={() => setShowPayment(false)}/>
      )}
    </div>
  );
}

interface CategoriesViewProps {
  coupons: Coupon[];
  onPick: (catId: string) => void;
  onOpenCoupon?: (c: Coupon) => void;
}

function CategoriesView({ coupons, onPick, onOpenCoupon }: CategoriesViewProps) {
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    coupons.forEach(c => { m[c.category] = (m[c.category] || 0) + 1; });
    return m;
  }, [coupons]);
  const cats = CATEGORIES.filter(c => c.id !== "all");
  const totalDiscount = coupons.reduce((s, c) => s + (c.originalPrice - c.finalPrice), 0);
  const trending = [...coupons].sort((a, b) => b.reviews - a.reviews).slice(0, 3);

  return (
    <div className="cat-view">
      <div className="cat-hero">
        <div>
          <div className="eyebrow">Explorar</div>
          <h1 style={{ margin: "6px 0 0", fontSize: 36, fontWeight: 600, letterSpacing: "-0.03em" }}>
            ¿Qué se te antoja <em style={{ fontStyle: "normal", color: "var(--brand-strong)" }}>hoy</em>?
          </h1>
          <p style={{ margin: "10px 0 0", color: "var(--ink-2)", maxWidth: 520 }}>
            Cupones activos en tu zona, agrupados por categoría. Toca una para ver los locales en el mapa.
          </p>
        </div>
        <div className="cat-hero-stats">
          <div>
            <div className="eyebrow">Cupones activos</div>
            <div className="mono" style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em" }}>{coupons.length}</div>
          </div>
          <div>
            <div className="eyebrow">Ahorro potencial</div>
            <div className="mono" style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--brand-strong)" }}>S/{totalDiscount}</div>
          </div>
        </div>
      </div>

      <div className="cat-grid stagger">
        {cats.map(cat => {
          const n = counts[cat.id] || 0;
          const sample = coupons.find(c => c.category === cat.id);
          return (
            <button key={cat.id} className="cat-card" onClick={() => onPick(cat.id)} disabled={n === 0}>
              <div className="cat-card-bg" style={{
                background: `linear-gradient(135deg, color-mix(in oklab, var(--brand) ${20 + (cat.id.charCodeAt(0) % 30)}%, var(--bg-elev)) 0%, color-mix(in oklab, var(--accent-2) ${10 + (cat.id.charCodeAt(0) % 20)}%, var(--bg-elev)) 100%)`
              }}/>
              <div className="cat-card-icon"><Icon name={cat.icon} size={28} stroke={1.4}/></div>
              <div className="cat-card-body">
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
                  {n === 0 ? "Sin ofertas activas" : `${n} ${n === 1 ? "cupón disponible" : "cupones disponibles"}`}
                </div>
                {sample && n > 0 && (
                  <div className="cat-card-sample">
                    Desde <span className="mono" style={{ color: "var(--ink)", fontWeight: 600 }}>{sample.brand}</span>
                  </div>
                )}
              </div>
              <div className="cat-card-arrow"><Icon name="arrowRight" size={16}/></div>
            </button>
          );
        })}
      </div>

      <div className="cat-section">
        <div className="cat-section-head">
          <div>
            <div className="eyebrow">Lo más reservado</div>
            <h2 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>Trending esta semana</h2>
          </div>
          <button className="btn btn-sm" onClick={() => onPick("all")}>Ver todo <Icon name="arrowRight" size={13}/></button>
        </div>
        <div className="cat-trending">
          {trending.map((c, i) => (
            <div key={c.id} className="trend-row" onClick={() => onOpenCoupon ? onOpenCoupon(c) : onPick(c.category)}>
              <div className="trend-rank mono">0{i + 1}</div>
              <div className="cc-thumb" style={{
                width: 56, height: 56, borderRadius: 10,
                background: `linear-gradient(135deg, color-mix(in oklab, var(--brand) ${c.featured ? 70 : 30}%, var(--bg-sunken)) 0%, color-mix(in oklab, var(--accent-2) ${c.featured ? 30 : 10}%, var(--bg-sunken)) 100%)`,
                display: "grid", placeItems: "center", color: "var(--brand-ink)",
                fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 14
              }}>−{c.discount}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{c.brand}</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
              </div>
              <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "right" }}>
                <Icon name="star" size={11} filled style={{ color: "var(--warn)" }}/> {c.rating}
                <div style={{ marginTop: 2 }}>{c.reviews} reservas</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ProfileViewProps {
  favCount: number;
  reservedCount: number;
  reservedCoupons?: Coupon[];
  onOpenCoupon?: (c: Coupon) => void;
  theme?: string;
  onThemeChange?: (t: string) => void;
  onSignOut?: () => void;
}

function ProfileView({ favCount, reservedCount, reservedCoupons = [], onOpenCoupon, theme = "light", onThemeChange, onSignOut }: ProfileViewProps) {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: "Daniela Gómez",
    email: "daniela@email.com",
    phone: "",
    neighborhood: "",
  });
  const [draft, setDraft] = useState(profile);
  const [prefs, setPrefs] = useState({
    darkMode: theme === "dark",
    notifications: true,
    shareLocation: false,
    newsletter: false,
  });

  useEffect(() => { setPrefs(p => ({ ...p, darkMode: theme === "dark" })); }, [theme]);

  const saveProfile = () => { setProfile(draft); setEditMode(false); };
  const cancelEdit = () => { setDraft(profile); setEditMode(false); };

  const togglePref = (key: keyof typeof prefs) => {
    if (key === "darkMode") {
      const next = !prefs.darkMode;
      setPrefs(p => ({ ...p, darkMode: next }));
      onThemeChange?.(next ? "dark" : "light");
    } else {
      setPrefs(p => ({ ...p, [key]: !p[key] }));
    }
  };

  const initials = profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const PREFS = [
    { key: "notifications" as const, label: "Alertas de cupones cercanos", icon: "bell", desc: "Notificaciones cuando hay ofertas cerca" },
    { key: "darkMode" as const, label: "Modo oscuro", icon: "layers", desc: "Cambia la apariencia de la app" },
    { key: "shareLocation" as const, label: "Compartir ubicación con marcas", icon: "location", desc: "Mejora las recomendaciones" },
    { key: "newsletter" as const, label: "Boletín semanal por email", icon: "food", desc: "Resumen de las mejores ofertas" },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", overflow: "auto" }}>
      <div className="profile-head">
        <div className="profile-avatar" style={{ background: "var(--brand)", color: "var(--brand-ink)", fontSize: 20, userSelect: "none" }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editMode ? (
            <div className="field">
              <input className="input" value={draft.name} placeholder="Tu nombre"
                     onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                     style={{ fontSize: 18, fontWeight: 600 }}/>
            </div>
          ) : (
            <>
              <div className="eyebrow">Perfil de cliente</div>
              <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>{profile.name}</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon name="user" size={11}/> {profile.email || "sin email"}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon name="clock" size={11}/> Miembro desde may 2026
                </span>
              </div>
            </>
          )}
        </div>
        {editMode ? (
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button className="btn btn-sm btn-ghost" onClick={cancelEdit}>Cancelar</button>
            <button className="btn btn-sm btn-brand" onClick={saveProfile}><Icon name="check" size={13}/> Guardar</button>
          </div>
        ) : (
          <button className="btn btn-sm" onClick={() => { setDraft(profile); setEditMode(true); }} style={{ flexShrink: 0 }}>
            <Icon name="sliders" size={14}/> Editar
          </button>
        )}
      </div>

      {editMode && (
        <div style={{ padding: "0 28px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, borderBottom: "1px solid var(--line)" }}>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Nombre completo</label>
            <input className="input" value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="Tu nombre"/>
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} placeholder="tu@email.com"/>
          </div>
          <div className="field">
            <label>Teléfono</label>
            <input className="input" type="tel" value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} placeholder="+51 999 000 000"/>
          </div>
          <div className="field">
            <label>Distrito</label>
            <input className="input" value={draft.neighborhood} onChange={e => setDraft(d => ({ ...d, neighborhood: e.target.value }))} placeholder="Miraflores"/>
          </div>
        </div>
      )}

      {(() => {
        const savings = reservedCoupons.reduce((s, c) => s + (c.originalPrice - c.finalPrice), 0);
        return (
          <div className="profile-stats">
            {[
              { label: "Cupones guardados", value: favCount, sub: favCount === 0 ? "Guarda desde el mapa" : `${favCount} activo${favCount > 1 ? "s" : ""}` },
              { label: "Reservas activas", value: reservedCount, sub: reservedCount === 0 ? "Reserva un cupón" : `${reservedCount} pendiente${reservedCount > 1 ? "s" : ""}` },
              { label: "Ahorro acumulado", value: `S/ ${savings}`, sub: savings === 0 ? "Empieza a canjear" : "¡Buen ahorro!", mono: true },
              { label: "Canjes realizados", value: reservedCoupons.length, sub: reservedCoupons.length === 0 ? "Sin historial aún" : `${reservedCoupons.length} cupón${reservedCoupons.length > 1 ? "es" : ""}`, mono: true },
            ].map((s, i) => (
              <div key={i} className="ps-card">
                <div className="eyebrow">{s.label}</div>
                <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 6, fontFamily: (s as any).mono ? "var(--font-mono)" : "var(--font-sans)" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        );
      })()}

      <div className="profile-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="eyebrow">Mis canjes</div>
          {reservedCoupons.length > 0 && (
            <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>{reservedCoupons.length} cupón{reservedCoupons.length > 1 ? "es" : ""}</span>
          )}
        </div>
        {reservedCoupons.length === 0 ? (
          <div style={{ padding: "28px 0", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-sunken)", display: "grid", placeItems: "center", margin: "0 auto 12px", color: "var(--ink-3)" }}>
              <Icon name="ticket" size={22}/>
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink-2)" }}>Sin canjes todavía</div>
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
              Reserva un cupón desde el mapa y aparecerá aquí.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reservedCoupons.map((c) => (
              <button key={c.id} onClick={() => onOpenCoupon?.(c)}
                      style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 14px",
                               background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 14,
                               cursor: "pointer", fontFamily: "inherit", color: "var(--ink)", textAlign: "left", width: "100%" }}>
                <div style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0, overflow: "hidden",
                               background: c.imageUrl ? "transparent"
                                 : `linear-gradient(135deg, color-mix(in oklab, var(--brand) 60%, var(--bg-sunken)), color-mix(in oklab, var(--accent-2) 40%, var(--bg-sunken)))`,
                               display: "grid", placeItems: "center", position: "relative" }}>
                  {c.imageUrl
                    ? <img src={c.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt=""/>
                    : <Icon name="ticket" size={20} style={{ color: "var(--brand-ink)" }}/>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 2 }}>{c.brand}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 6, background: "color-mix(in oklab, var(--brand) 15%, var(--bg-sunken))", color: "var(--brand-strong)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      −{c.discount}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      GEOPS · {c.id.toUpperCase()} · 7K3X
                    </span>
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <div style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: "#22c55e18", color: "#16a34a", fontWeight: 600 }}>
                    Reservado
                  </div>
                  <Icon name="chevron" size={13} style={{ color: "var(--ink-3)" }}/>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="profile-section">
        <div className="eyebrow" style={{ marginBottom: 4 }}>Preferencias</div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14 }}>Los cambios se aplican de inmediato</div>
        <div className="pref-grid">
          {PREFS.map(p => (
            <button key={p.key} className="pref-row"
                    style={{ width: "100%", background: "transparent", border: 0, fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}
                    onClick={() => togglePref(p.key)}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--bg-sunken)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon name={p.icon} size={15}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{p.desc}</div>
              </div>
              <div className={"toggle" + (prefs[p.key] ? " on" : "")} style={{ flexShrink: 0 }}>
                <span className="toggle-knob"/>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button className="signout-btn" onClick={onSignOut}>
        <Icon name="arrowLeft" size={14}/> Cerrar sesión
      </button>
    </div>
  );
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const p1 = lat1 * Math.PI / 180, p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180, dl = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dp/2)**2 + Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

interface UserLocation { lat: number; lng: number; name: string; source: "gps"|"manual"|"default" }
const DEFAULT_LOCATION: UserLocation = { lat: -12.1211, lng: -77.0297, name: "Miraflores", source: "default" };

interface LocationModalProps {
  onSelect: (loc: UserLocation) => void;
  onClose?: () => void;
  isFirst?: boolean;
}

const LIMA_ALL_PLACES = [
  { name: "Miraflores",           sub: "Lima Moderna",        lat: -12.1211, lng: -77.0297 },
  { name: "San Isidro",           sub: "Lima Moderna",        lat: -12.0971, lng: -77.0369 },
  { name: "Barranco",             sub: "Lima Moderna",        lat: -12.1494, lng: -77.0213 },
  { name: "San Borja",            sub: "Lima Moderna",        lat: -12.1006, lng: -76.9990 },
  { name: "Magdalena del Mar",    sub: "Lima Moderna",        lat: -12.0882, lng: -77.0724 },
  { name: "Pueblo Libre",         sub: "Lima Moderna",        lat: -12.0775, lng: -77.0689 },
  { name: "Surco",                sub: "Lima Sur",            lat: -12.0890, lng: -76.9770 },
  { name: "Chorrillos",           sub: "Lima Sur",            lat: -12.1692, lng: -77.0207 },
  { name: "Surquillo",            sub: "Lima Sur",            lat: -12.1117, lng: -77.0108 },
  { name: "Villa María del Triunfo", sub: "Lima Sur",         lat: -12.1617, lng: -76.9321 },
  { name: "La Molina",            sub: "Lima Este",           lat: -12.0800, lng: -76.9433 },
  { name: "Ate",                  sub: "Lima Este",           lat: -12.0266, lng: -76.9167 },
  { name: "Santa Anita",          sub: "Lima Este",           lat: -12.0472, lng: -76.9696 },
  { name: "Lurigancho",           sub: "Lima Este",           lat: -11.9912, lng: -76.9706 },
  { name: "Lima Centro",          sub: "Cercado de Lima",     lat: -12.0464, lng: -77.0428 },
  { name: "Breña",                sub: "Lima Centro",         lat: -12.0663, lng: -77.0515 },
  { name: "La Victoria",          sub: "Lima Centro",         lat: -12.0671, lng: -77.0185 },
  { name: "Rímac",                sub: "Lima Centro",         lat: -12.0281, lng: -77.0319 },
  { name: "Los Olivos",           sub: "Lima Norte",          lat: -11.9880, lng: -77.0641 },
  { name: "San Martín de Porres", sub: "Lima Norte",          lat: -12.0267, lng: -77.1027 },
  { name: "Comas",                sub: "Lima Norte",          lat: -11.9363, lng: -77.0546 },
  { name: "Independencia",        sub: "Lima Norte",          lat: -12.0000, lng: -77.0540 },
  { name: "Jesús María",          sub: "Lima Moderna",        lat: -12.0731, lng: -77.0473 },
  { name: "Lince",                sub: "Lima Moderna",        lat: -12.0847, lng: -77.0363 },
  { name: "San Miguel",           sub: "Lima Moderna",        lat: -12.0781, lng: -77.0897 },
  { name: "Av. La Marina",        sub: "San Miguel",          lat: -12.0747, lng: -77.0889 },
  { name: "Av. Larco",            sub: "Miraflores",          lat: -12.1293, lng: -77.0303 },
  { name: "Av. Javier Prado",     sub: "San Isidro",          lat: -12.0944, lng: -77.0209 },
  { name: "Av. La Molina",        sub: "La Molina",           lat: -12.0814, lng: -76.9500 },
  { name: "Av. Las Flores de Primavera", sub: "San Juan de Lurigancho", lat: -12.0200, lng: -76.9800 },
  { name: "Av. La Paz",           sub: "Lima",                lat: -12.1195, lng: -77.0282 },
  { name: "Av. Las Palmeras",     sub: "Los Olivos",          lat: -11.9750, lng: -77.0610 },
  { name: "Av. Universitaria",    sub: "Los Olivos",          lat: -11.9700, lng: -77.0600 },
];

const LOC_SUGGESTED = [
  "Miraflores", "San Isidro", "Barranco", "Surco", "La Molina",
  "Los Olivos", "San Martín de Porres", "Lima Centro",
];

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    suburb?: string; city_district?: string; borough?: string;
    county?: string; state?: string; road?: string; town?: string; village?: string;
  };
}
function parseNominatim(r: NominatimResult) {
  const parts = r.display_name.split(",");
  const name = parts[0]?.trim() ?? r.display_name;
  const a = r.address ?? {};
  const sub = a.city_district ?? a.suburb ?? a.borough ?? a.county ?? parts[1]?.trim() ?? "";
  return { name, sub, lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
}

function LocationModal({ onSelect, onClose, isFirst = false }: LocationModalProps) {
  const [query, setQuery] = useState("");
  const [osm, setOsm] = useState<ReturnType<typeof parseNominatim>[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 120); }, []);

  useEffect(() => {
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) { setOsm([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=pe&viewbox=-77.25,-12.30,-76.65,-11.75&bounded=1&addressdetails=1&limit=7&accept-language=es`;
        const res = await fetch(url, { headers: { "Accept-Language": "es" } });
        const data: NominatimResult[] = await res.json();
        setOsm(data.map(parseNominatim));
      } catch { setOsm([]); }
      setLoading(false);
    }, 340);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const isSearching = query.trim().length >= 2;
  const suggested = LIMA_ALL_PLACES.filter(p => LOC_SUGGESTED.includes(p.name));

  const pickOsm = (p: ReturnType<typeof parseNominatim>) =>
    onSelect({ lat: p.lat, lng: p.lng, name: p.name, source: "manual" });
  const pickSuggested = (p: typeof LIMA_ALL_PLACES[0]) =>
    onSelect({ lat: p.lat, lng: p.lng, name: p.name, source: "manual" });

  const highlight = (text: string, q: string) => {
    if (!q) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return <>{text.slice(0, idx)}<strong style={{ color: "var(--ink)", fontWeight: 700 }}>{text.slice(idx, idx + q.length)}</strong>{text.slice(idx + q.length)}</>;
  };

  return createPortal(
    <div className="overlay" onClick={isFirst ? undefined : onClose}
         style={{ alignItems: "flex-start", paddingTop: "6vh", zIndex: 95 }}>
      <div className="modal" onClick={e => e.stopPropagation()}
           style={{ width: "min(440px, calc(100vw - 20px))", padding: 0, overflow: "hidden",
                    borderRadius: 18, boxShadow: "0 12px 48px rgba(0,0,0,0.22)" }}>

        <div style={{ padding: "20px 20px 16px", background: "var(--bg-elev)",
                      borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13,
                             background: "color-mix(in oklab, var(--brand) 16%, var(--bg-sunken))",
                             display: "grid", placeItems: "center", color: "var(--brand-strong)", flexShrink: 0 }}>
                <Icon name="pin" size={22}/>
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.3px" }}>
                  ¿Dónde te encuentras?
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.5 }}>
                  GeoPS muestra cupones activos cerca de ti
                </div>
              </div>
            </div>
            {!isFirst && onClose && (
              <button className="btn btn-icon btn-sm" onClick={onClose} style={{ flexShrink: 0, marginTop: 2 }}>
                <Icon name="close" size={14}/>
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10,
                        background: "var(--bg-sunken)", borderRadius: 12,
                        padding: "10px 14px", border: "1.5px solid var(--line)" }}>
            {loading
              ? <div style={{ width: 17, height: 17, border: "2px solid var(--brand)", borderTopColor: "transparent",
                               borderRadius: "50%", animation: "loc-spin 0.65s linear infinite", flexShrink: 0 }}/>
              : <Icon name="search" size={17} style={{ color: "var(--ink-3)", flexShrink: 0 }}/>}
            <input ref={inputRef} value={query}
                   onChange={e => setQuery(e.target.value)}
                   placeholder="Busca tu distrito, avenida o lugar…"
                   autoComplete="off"
                   style={{ flex: 1, border: "none", outline: "none", background: "transparent",
                            fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--ink)" }}/>
            {query && (
              <button onClick={() => { setQuery(""); setOsm([]); inputRef.current?.focus(); }}
                      style={{ appearance: "none", border: 0, background: "transparent",
                               cursor: "pointer", color: "var(--ink-3)", padding: 2, display: "flex", flexShrink: 0 }}>
                <Icon name="close" size={13}/>
              </button>
            )}
          </div>
        </div>

        <div style={{ background: "var(--bg-elev)", maxHeight: "52vh", overflowY: "auto" }}>
          <div style={{ padding: "10px 16px 4px" }}>
            <span style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "uppercase",
                           letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>
              {isSearching
                ? loading ? "Buscando…" : `${osm.length} resultado${osm.length !== 1 ? "s" : ""}`
                : "Zonas populares"}
            </span>
          </div>

          {!isSearching && suggested.map((p, i) => (
            <button key={p.name} onClick={() => pickSuggested(p)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px",
                             width: "100%", background: "transparent", border: 0, cursor: "pointer",
                             fontFamily: "inherit", textAlign: "left", transition: "background 80ms",
                             borderBottom: i < suggested.length - 1 ? "1px solid var(--line)" : "none" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-sunken)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                             background: "var(--bg-sunken)", display: "grid", placeItems: "center",
                             color: "var(--ink-3)" }}>
                <Icon name="clock" size={15}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{p.sub}</div>
              </div>
            </button>
          ))}

          {isSearching && !loading && osm.length > 0 && osm.map((p, i) => (
            <button key={`osm-${i}-${p.lat}-${p.lng}`} onClick={() => pickOsm(p)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px",
                             width: "100%", background: "transparent", border: 0, cursor: "pointer",
                             fontFamily: "inherit", textAlign: "left", transition: "background 80ms",
                             borderBottom: i < osm.length - 1 ? "1px solid var(--line)" : "none" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-sunken)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                             background: "color-mix(in oklab, var(--brand) 12%, var(--bg-sunken))",
                             display: "grid", placeItems: "center", color: "var(--brand-strong)" }}>
                <Icon name="pin" size={16}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500,
                               whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {highlight(p.name, query.trim())}
                </div>
                {p.sub && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>{p.sub}</div>}
              </div>
            </button>
          ))}

          {isSearching && !loading && osm.length === 0 && (
            <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column",
                          alignItems: "center", gap: 8, color: "var(--ink-3)" }}>
              <Icon name="search" size={28}/>
              <div style={{ fontSize: 13, textAlign: "center" }}>
                Sin resultados para <strong style={{ color: "var(--ink)" }}>«{query}»</strong>
                <br/>
                <span style={{ fontSize: 11 }}>Intenta con el nombre del distrito o avenida</span>
              </div>
            </div>
          )}

          {loading && [1,2,3].map(i => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px",
                                   borderBottom: "1px solid var(--line)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-sunken)",
                             animation: "loc-pulse 1.2s ease-in-out infinite" }}/>
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, borderRadius: 6, background: "var(--bg-sunken)",
                               width: `${55 + i * 12}%`, animation: "loc-pulse 1.2s ease-in-out infinite" }}/>
                <div style={{ height: 10, borderRadius: 6, background: "var(--bg-sunken)",
                               width: "40%", marginTop: 6, animation: "loc-pulse 1.2s ease-in-out infinite" }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes loc-spin  { to { transform: rotate(360deg); } }
        @keyframes loc-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
      `}</style>
    </div>,
    document.getElementById("geops-portal-root") ?? document.body
  );
}

function parseDiscount(d: string): number {
  const pct = d.match(/(\d+)%/); if (pct) return parseInt(pct[1]);
  if (/\dx\d/i.test(d)) return 50;
  return 0;
}
function parseExpiry(e: string): number {
  if (/hoy/i.test(e)) return 0;
  const days = e.match(/(\d+)\s*d/i); if (days) return parseInt(days[1]);
  const wks = e.match(/(\d+)\s*sem/i); if (wks) return parseInt(wks[1]) * 7;
  return 999;
}
function radiusToZoom(r: number): number {
  if (r <= 1000) return 14;
  if (r <= 3000) return 13;
  if (r <= 5000) return 12;
  if (r <= 10000) return 12;
  return 11;
}

interface CustomerMapProps {
  onSwitchRole: () => void;
  onSignOut?: () => void;
  mapEngine?: string;
  theme?: string;
  onThemeChange?: (t: string) => void;
}

const RADIUS_OPTIONS = [
  { label: "1km",  value: 1000 },
  { label: "3km",  value: 3000 },
  { label: "5km",  value: 5000 },
  { label: "10km", value: 10000 },
  { label: "Lima", value: Infinity },
];

const SORT_OPTIONS = [
  { id: "distance", label: "Más cerca" },
  { id: "discount", label: "Mayor descuento" },
  { id: "expiry",   label: "Por vencer" },
  { id: "featured", label: "Destacados" },
];

function CustomerMap({ onSwitchRole, onSignOut, mapEngine = "osm", theme = "light", onThemeChange }: CustomerMapProps) {
  const [tab, setTab] = useState("map");
  const [activeCategory, setActiveCategory] = useState("all");
  const [detailCoupon, setDetailCoupon] = useState<Coupon | null>(null);
  const [favorites, setFavorites] = useState(new Set<string>());
  const [reserved, setReserved] = useState(new Set<string>());
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [radius, setRadius] = useState(5000);
  const [sortBy, setSortBy] = useState("distance");
  const [showLocationModal, setShowLocationModal] = useState(true);
  const showFavorites = tab === "saved";

  useEffect(() => { if (tab === "saved") setActiveCategory("all"); }, [tab]);

  const realDist = (c: Coupon) => Math.round(haversine(userLocation.lat, userLocation.lng, c.lat, c.lng));
  const realWalk = (c: Coupon) => Math.round(realDist(c) / 80);

  const filtered = useMemo(() => {
    const r = radius === Infinity ? Infinity : radius;
    const list = COUPONS.filter(c => {
      if (activeCategory !== "all" && c.category !== activeCategory) return false;
      if (search && !`${c.brand} ${c.title}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (showFavorites && !favorites.has(c.id)) return false;
      if (r !== Infinity && haversine(userLocation.lat, userLocation.lng, c.lat, c.lng) > r) return false;
      return true;
    });
    return list.sort((a, b) => {
      if (sortBy === "discount") return parseDiscount(b.discount) - parseDiscount(a.discount);
      if (sortBy === "expiry")   return parseExpiry(a.expiresIn) - parseExpiry(b.expiresIn);
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return haversine(userLocation.lat, userLocation.lng, a.lat, a.lng)
           - haversine(userLocation.lat, userLocation.lng, b.lat, b.lng);
    });
  }, [activeCategory, search, showFavorites, favorites, userLocation, radius, sortBy]);

  const countWithoutRadius = useMemo(() => COUPONS.filter(c => {
    if (activeCategory !== "all" && c.category !== activeCategory) return false;
    if (search && !`${c.brand} ${c.title}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (showFavorites && !favorites.has(c.id)) return false;
    return true;
  }).length, [activeCategory, search, showFavorites, favorites]);

  const emptyByRadius = filtered.length === 0 && countWithoutRadius > 0;

  const toggleFav = (id: string) => {
    setFavorites(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const reserve = (id: string) => {
    setReserved(prev => new Set(prev).add(id));
  };

  const handleSelectLocation = (loc: UserLocation) => {
    setUserLocation(loc);
    setShowLocationModal(false);
  };

  const hudCoords = `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;

  return (
    <div className="customer-app">
      <CustomerTopbar
        onProfileClick={() => setTab("profile")}
        onSignOut={onSignOut}
        locationName={userLocation.name}
        onLocationClick={() => setShowLocationModal(true)}
      />

      <div className="map-shell" style={{ display: tab === "map" || tab === "saved" ? "grid" : "block" }}>
        {(tab === "map" || tab === "saved") && (
          <>
            <div className="map-area">
              <GeoMap engine={mapEngine} theme={theme}
                      pins={filtered} activePin={detailCoupon?.id}
                      onPinClick={(p: any) => setDetailCoupon(p)}
                      userPos={{ x: 520, y: 400 }} userCoord={userLocation}
                      zoom={radiusToZoom(radius)}/>

              <div className="map-controls fade-up">
                <div className="search-wrap">
                  <Icon name="search" size={16}/>
                  <input className="search-input" placeholder="Buscar cupones, locales..."
                         value={search} onChange={e => setSearch(e.target.value)}/>
                  {search && (
                    <button style={{ appearance: "none", border: 0, background: "transparent", padding: 4, cursor: "pointer" }} onClick={() => setSearch("")}>
                      <Icon name="close" size={14}/>
                    </button>
                  )}
                </div>
                <div className="cat-row">
                  {CATEGORIES.map(cat => {
                    const count = cat.id === "all"
                      ? COUPONS.length
                      : COUPONS.filter(c => c.category === cat.id).length;
                    return (
                      <button key={cat.id}
                              className={"chip " + (activeCategory === cat.id ? "active" : "")}
                              onClick={() => setActiveCategory(cat.id)}>
                        <Icon name={cat.icon} size={14}/>
                        {cat.label}
                        <span className="mono" style={{ fontSize: 10, opacity: 0.6 }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="map-hud">
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: userLocation.source === "gps" ? "#22c55e" : "var(--brand)", flexShrink: 0 }}/>
                <span className="mono" style={{ fontSize: 11 }}>{hudCoords}</span>
                <span style={{ color: "var(--ink-3)" }}>·</span>
                <span style={{ fontSize: 11 }}>{userLocation.name}</span>
                {userLocation.source === "gps" && <span style={{ fontSize: 9, background: "#22c55e20", color: "#16a34a", borderRadius: 4, padding: "1px 5px", fontFamily: "var(--font-mono)" }}>GPS</span>}
              </div>

              <div className="map-tools">
                <button className="btn btn-icon tip" data-tip="Centrar en mi ubicación"
                        onClick={() => setShowLocationModal(true)}>
                  <Icon name="location" size={16}/>
                </button>
                <button className="btn btn-icon tip" data-tip="Capas">
                  <Icon name="layers" size={16}/>
                </button>
                <div className="zoom-stack">
                  <button className="btn btn-icon" style={{ borderRadius: "10px 10px 0 0", borderBottom: 0 }}><Icon name="plus" size={16}/></button>
                  <button className="btn btn-icon" style={{ borderRadius: "0 0 10px 10px" }}><Icon name="close" size={14}/></button>
                </div>
              </div>
            </div>

            <aside className="results-pane">
              {detailCoupon ? (
                <CouponDetailView
                  c={detailCoupon}
                  isFav={favorites.has(detailCoupon.id)}
                  isReserved={reserved.has(detailCoupon.id)}
                  onToggleFav={() => toggleFav(detailCoupon.id)}
                  onReserve={() => reserve(detailCoupon.id)}
                  onBack={() => setDetailCoupon(null)}
                  realDist={realDist(detailCoupon)}
                  realWalk={realWalk(detailCoupon)}
                />
              ) : (<>
              <div className="results-head">
                <div>
                  <div className="eyebrow">{showFavorites ? "Tus guardados" : `Radio: ${radius === Infinity ? "Lima completa" : radius >= 1000 ? `${radius/1000}km` : `${radius}m`}`}</div>
                  <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>
                    {filtered.length} cupone{filtered.length !== 1 ? "s" : ""}{showFavorites ? " guardados" : " cercanos"}
                  </div>
                </div>
              </div>

              {!showFavorites && (
                <div style={{ borderBottom: "1px solid var(--line)" }}>
                  <div className="results-sort" style={{ flexWrap: "nowrap", overflowX: "auto", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontSize: 10, color: "var(--ink-3)", flexShrink: 0, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", paddingRight: 2 }}>Radio</span>
                    {RADIUS_OPTIONS.map(o => (
                      <button key={o.label}
                              className={"chip" + (radius === o.value ? " active" : "")}
                              style={{ fontSize: 11, padding: "3px 9px", flexShrink: 0 }}
                              onClick={() => setRadius(o.value)}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <div className="results-sort" style={{ flexWrap: "nowrap", overflowX: "auto" }}>
                    <span style={{ fontSize: 10, color: "var(--ink-3)", flexShrink: 0, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", paddingRight: 2 }}>Orden</span>
                    {SORT_OPTIONS.map(o => (
                      <button key={o.id}
                              className={"chip" + (sortBy === o.id ? " active" : "")}
                              style={{ fontSize: 11, padding: "3px 9px", flexShrink: 0 }}
                              onClick={() => setSortBy(o.id)}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="results-list">
                {filtered.length === 0 ? (
                  <div style={{ padding: "36px 24px", textAlign: "center" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-sunken)", display: "grid", placeItems: "center", margin: "0 auto 14px", color: "var(--ink-3)" }}>
                      <Icon name="location" size={24}/>
                    </div>
                    {showFavorites ? (
                      <>
                        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Aún no tienes guardados</div>
                        <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
                          Explora el mapa y guarda los cupones que más te interesen.
                        </div>
                        <button className="btn btn-brand btn-sm" style={{ marginTop: 14 }} onClick={() => setTab("map")}>
                          Explorar cupones <Icon name="arrowRight" size={13}/>
                        </button>
                      </>
                    ) : emptyByRadius ? (
                      <>
                        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Sin ofertas en este radio</div>
                        <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
                          No hay cupones{activeCategory !== "all" ? ` de "${CATEGORIES.find(c => c.id === activeCategory)?.label}"` : ""} en un radio de {radius >= 1000 ? `${radius/1000}km` : `${radius}m`} cerca de <strong>{userLocation.name}</strong>.
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 14 }}>
                          <button className="btn btn-brand btn-sm" onClick={() => setRadius(Infinity)}>
                            Ver toda Lima <Icon name="arrowRight" size={13}/>
                          </button>
                          {activeCategory !== "all" && (
                            <button className="btn btn-sm" onClick={() => setActiveCategory("all")}>
                              Quitar filtro
                            </button>
                          )}
                          <button className="btn btn-sm" onClick={() => setShowLocationModal(true)}>
                            <Icon name="location" size={13}/> Cambiar zona
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No hay resultados</div>
                        <div style={{ fontSize: 13, color: "var(--ink-3)" }}>
                          Prueba con otra categoría o ajusta el radio de búsqueda.
                        </div>
                        <button className="btn btn-sm" style={{ marginTop: 14 }} onClick={() => { setActiveCategory("all"); setRadius(Infinity); }}>
                          Ver todos los cupones
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  filtered.map(c => (
                    <CouponCard key={c.id} c={c}
                                isFav={favorites.has(c.id)}
                                isReserved={reserved.has(c.id)}
                                onToggleFav={() => toggleFav(c.id)}
                                onClick={() => setDetailCoupon(c)}
                                isSelected={detailCoupon !== null && detailCoupon.id === c.id}
                                realDist={realDist(c)}
                                realWalk={realWalk(c)}/>
                  ))
                )}
              </div>
            </>)}
            </aside>
          </>
        )}

        {tab === "categories" && (
          <CategoriesView
            coupons={COUPONS}
            onPick={catId => { setActiveCategory(catId); setTab("map"); }}
            onOpenCoupon={c => { setDetailCoupon(c); setTab("map"); }}
          />
        )}

        {tab === "profile" && (
          <ProfileView
            favCount={favorites.size}
            reservedCount={reserved.size}
            reservedCoupons={COUPONS.filter(c => reserved.has(c.id))}
            onOpenCoupon={c => { setDetailCoupon(c); setTab("map"); }}
            theme={theme}
            onThemeChange={onThemeChange}
            onSignOut={onSignOut}
          />
        )}
      </div>

      <BottomNav tab={tab} setTab={setTab} favCount={favorites.size}/>

      {showLocationModal && (
        <LocationModal
          onSelect={handleSelectLocation}
          onClose={() => setShowLocationModal(false)}
          isFirst={userLocation.source === "default"}
        />
      )}

      <style>{`
        .customer-app { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); }
        .map-shell { flex: 1; display: grid; grid-template-columns: 1fr 420px; gap: 0; min-height: 0; }
        @media (max-width: 980px) { .map-shell { grid-template-columns: 1fr; grid-template-rows: 60vh auto; } }
        .map-area { position: relative; background: var(--map-bg); overflow: hidden; min-height: calc(100vh - 60px); }
        @media (max-width: 980px) { .map-area { min-height: 0; } }
        .map-controls { position: absolute; top: 18px; left: 18px; right: 18px; display: flex; flex-direction: column; gap: 10px; max-width: 720px; pointer-events: none; }
        .map-controls > * { pointer-events: auto; }
        .search-wrap { display: flex; align-items: center; gap: 8px; background: var(--bg-elev); border: 1px solid var(--line); border-radius: 14px; padding: 10px 14px; box-shadow: var(--shadow); color: var(--ink-3); }
        .search-input { flex: 1; appearance: none; border: 0; outline: none; background: transparent; color: var(--ink); font-size: 14px; font-family: inherit; }
        .search-input::placeholder { color: var(--ink-3); }
        .cat-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .map-hud { position: absolute; bottom: 18px; left: 18px; display: flex; align-items: center; gap: 6px; background: var(--bg-elev); border: 1px solid var(--line); padding: 6px 12px; border-radius: 10px; box-shadow: var(--shadow-sm); color: var(--ink-2); }
        .map-tools { position: absolute; top: 18px; right: 18px; display: flex; flex-direction: column; gap: 10px; }
        .zoom-stack { display: flex; flex-direction: column; box-shadow: var(--shadow-sm); border-radius: 10px; }
        .results-pane { background: var(--bg-elev); border-left: 1px solid var(--line); display: flex; flex-direction: column; height: calc(100vh - 60px); overflow: hidden; }
        @media (max-width: 980px) { .results-pane { height: auto; } }
        .results-head { padding: 18px 20px 12px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--line); }
        .results-sort { padding: 10px 20px; display: flex; gap: 6px; align-items: center; }
        .results-list { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
      `}</style>
    </div>
  );
}

interface CustomerAppProps {
  onSwitchRole: () => void;
  mapEngine?: string;
  theme?: string;
  onThemeChange?: (t: string) => void;
}

export function CustomerApp({ onSwitchRole, mapEngine = "osm", theme = "light", onThemeChange }: CustomerAppProps) {
  const [stage, setStage] = useState<"onboarding" | "login" | "app">("onboarding");
  const [authMode, setAuthMode] = useState("signin");

  if (stage === "onboarding") {
    return <Onboarding onContinue={() => setStage("login")} onSkip={() => setStage("app")}/>;
  }
  if (stage === "login") {
    return <AuthScreen mode={authMode} setMode={setAuthMode} onSuccess={() => setStage("app")} onBack={() => setStage("onboarding")} onSwitchRole={onSwitchRole}/>;
  }
  return <CustomerMap onSwitchRole={onSwitchRole} onSignOut={() => setStage("login")} mapEngine={mapEngine} theme={theme} onThemeChange={onThemeChange}/>;
}
