import { useState } from "react";
import {CATEGORIES, COUPONS} from "@/shared/constants.ts";
import { Icon } from '@/shared/ui/components/Icon.tsx';
import { BrandMark } from "@/shared/ui/components/BrandMark.tsx";
import { BackgroundGrid } from "@/shared/ui/components/BackgroundGrid.tsx";
import { LimaMap } from "@/features/geolocation/presentation/components/LimaMap";

interface OnboardingProps {
    onContinue: () => void;
    onSkip: () => void;
}

const SLIDES = [
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

export function Onboarding({ onContinue, onSkip }: OnboardingProps) {
    const [step, setStep] = useState(0);
    const cur = SLIDES[step];
    const next = () => step < SLIDES.length - 1 ? setStep(s => s + 1) : onContinue();

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
                            {SLIDES.map((slide, i) => (
                                <button type="button" key={slide.eyebrow} className={"dot " + (i === step ? "active" : "")} onClick={() => setStep(i)} aria-label={`Paso ${i + 1}`}/>
                            ))}
                        </div>
                        <div className="btn-row">
                            <button type="button" className="btn btn-ghost" onClick={onSkip}>Saltar</button>
                            <button type="button" className="btn btn-brand btn-lg" onClick={next}>
                                {step === SLIDES.length - 1 ? "Empezar" : "Siguiente"}
                                <Icon name="arrowRight" size={16}/>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="onboarding-visual">
                    <OnboardingVisual variant={cur.visual} key={step}/>
                </div>
            </div>

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