import { useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../../../../ui/components/Icon.tsx";
import { Coupon } from "../../../../core/common/mockData.ts";

function fmt(val: string, type: "card" | "expiry" | "cvv") {
  const d = val.replace(/\D/g, "");
  if (type === "card")   return d.slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  if (type === "expiry") return d.slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
  if (type === "cvv")    return d.slice(0, 4);
  return val;
}

function CardIcon({ brand }: { brand: string }) {
  if (brand === "visa") return (
    <svg viewBox="0 0 38 24" width="38" height="24" style={{ display: "block" }}>
      <rect width="38" height="24" rx="4" fill="#1A1F71"/>
      <text x="7" y="17" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fill="#FFFFFF" letterSpacing="-0.5">VISA</text>
    </svg>
  );
  if (brand === "mastercard") return (
    <svg viewBox="0 0 38 24" width="38" height="24" style={{ display: "block" }}>
      <rect width="38" height="24" rx="4" fill="#252525"/>
      <circle cx="14" cy="12" r="8" fill="#EB001B"/>
      <circle cx="24" cy="12" r="8" fill="#F79E1B"/>
      <path d="M 19 5.8 a 8 8 0 0 1 0 12.4 A 8 8 0 0 1 19 5.8 Z" fill="#FF5F00"/>
    </svg>
  );
  if (brand === "amex") return (
    <svg viewBox="0 0 38 24" width="38" height="24" style={{ display: "block" }}>
      <rect width="38" height="24" rx="4" fill="#007BC1"/>
      <text x="5" y="17" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="10" fill="#FFFFFF" letterSpacing="0.2">AMEX</text>
    </svg>
  );
  return <div style={{ width: 38, height: 24, borderRadius: 4, background: "var(--line)", display: "grid", placeItems: "center" }}><Icon name="card" size={14}/></div>;
}

function detectBrand(num: string): string {
  const n = num.replace(/\s/g, "");
  if (n.startsWith("4")) return "visa";
  if (n.match(/^5[1-5]/)) return "mastercard";
  if (n.match(/^3[47]/)) return "amex";
  return "unknown";
}

interface PaymentModalProps {
  coupon: Coupon;
  onSuccess: () => void;
  onClose: () => void;
}

type Step = "method" | "card" | "processing" | "success";

export function PaymentModal({ coupon, onSuccess, onClose }: PaymentModalProps) {
  const [step, setStep]       = useState<Step>("method");
  const [method, setMethod]   = useState<"izipay" | "yape" | "plin" | "">("");
  const [card, setCard]       = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const isFree = coupon.finalPrice === 0;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!card.name.trim())                                      e.name   = "Ingresa tu nombre";
    if (card.number.replace(/\s/g, "").length < 16)            e.number = "Número inválido";
    if (card.expiry.length < 5)                                 e.expiry = "Fecha inválida";
    if (card.cvv.length < 3)                                    e.cvv    = "CVV inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCardPay = () => {
    if (!validate()) return;
    pay();
  };

  const pay = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      setTimeout(() => { onSuccess(); onClose(); }, 2200);
    }, 2000);
  };

  const brand = detectBrand(card.number);

  const content = (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}
         style={{ alignItems: "center" }}>
      <div className="modal" onClick={e => e.stopPropagation()}
           style={{ width: "min(480px, calc(100vw - 24px))", maxHeight: "90vh", overflow: "auto", borderRadius: 20 }}>

        {step !== "success" && step !== "processing" && (
          <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {step === "card" && (
                <button className="btn btn-icon btn-sm" onClick={() => setStep("method")}>
                  <Icon name="arrowLeft" size={14}/>
                </button>
              )}
              <div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {step === "method" ? "Checkout seguro" : "Datos de tarjeta"}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>
                  Reservar cupón
                </div>
              </div>
            </div>
            <button className="btn btn-icon btn-sm" onClick={onClose}><Icon name="close" size={15}/></button>
          </div>
        )}

        {(step === "method" || step === "card") && (
          <div style={{ margin: "16px 24px", background: "var(--bg-sunken)", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center" }}>
            {coupon.imageUrl ? (
              <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                <img src={coupon.imageUrl} alt={coupon.brand} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              </div>
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 10, background: "var(--brand-soft)", flexShrink: 0, display: "grid", placeItems: "center" }}>
                <Icon name="food" size={22}/>
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{coupon.brand}</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{coupon.title}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>Descuento: −{coupon.discount}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: "var(--ink-3)", textDecoration: "line-through" }}>S/{coupon.originalPrice}</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color: isFree ? "var(--brand-strong)" : "var(--ink)" }}>
                {isFree ? "GRATIS" : `S/${coupon.finalPrice}`}
              </div>
            </div>
          </div>
        )}

        {step === "method" && (
          <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Pago seguro con
              </div>
              <div style={{
                background: "linear-gradient(90deg, #F7941D 0%, #E42128 100%)",
                color: "#fff", borderRadius: 6, padding: "2px 9px",
                fontSize: 11, fontWeight: 800, letterSpacing: "0.02em", fontFamily: "var(--font-mono)"
              }}>IziPay</div>
            </div>

            {isFree ? (
              <button className="btn btn-brand" style={{ width: "100%", justifyContent: "center", padding: "14px" }}
                      onClick={pay}>
                Confirmar reserva gratis <Icon name="arrowRight" size={16}/>
              </button>
            ) : (
              <>
                <button className="pay-method-btn" onClick={() => { setMethod("yape"); pay(); }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#6A0DAD", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                      <circle cx="12" cy="12" r="11" fill="#6A0DAD"/>
                      <path d="M7 9l5 6 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Yape</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Paga con tu celular BCP</div>
                  </div>
                  <Icon name="arrowRight" size={14} />
                </button>

                <button className="pay-method-btn" onClick={() => { setMethod("plin"); pay(); }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#00A859", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                      <path d="M5 12l5 5L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Plin</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Interbank, BBVA, Scotiabank</div>
                  </div>
                  <Icon name="arrowRight" size={14}/>
                </button>

                <button className="pay-method-btn" onClick={() => { setMethod("izipay"); setStep("card"); }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #F7941D, #E42128)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon name="card" size={20}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Tarjeta de crédito / débito</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 3, alignItems: "center" }}>
                      <CardIcon brand="visa"/><CardIcon brand="mastercard"/><CardIcon brand="amex"/>
                    </div>
                  </div>
                  <Icon name="arrowRight" size={14}/>
                </button>
              </>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4, color: "var(--ink-3)", fontSize: 11 }}>
              <Icon name="check" size={12}/> Pago cifrado SSL · Sin guardar datos
            </div>
          </div>
        )}

        {step === "card" && (
          <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
              borderRadius: 16, padding: "18px 22px", color: "#fff", position: "relative", overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}/>
              <div style={{ position: "absolute", bottom: -30, left: -10, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }}/>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, opacity: 0.7, letterSpacing: "0.12em" }}>TARJETA</div>
                <CardIcon brand={brand}/>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.18em", fontWeight: 600, marginBottom: 12 }}>
                {card.number || "•••• •••• •••• ••••"}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>TITULAR</div>
                  <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600, marginTop: 2, textTransform: "uppercase" }}>
                    {card.name || "NOMBRE APELLIDO"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}>VENCE</div>
                  <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 600, marginTop: 2 }}>{card.expiry || "MM/AA"}</div>
                </div>
              </div>
            </div>

            <div className="field">
              <label>Nombre en la tarjeta</label>
              <input className={"input" + (errors.name ? " input-error" : "")}
                     placeholder="Juan Pérez"
                     value={card.name}
                     onChange={e => { setCard(c => ({ ...c, name: e.target.value })); setErrors(er => ({ ...er, name: "" })); }}/>
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="field">
              <label>Número de tarjeta</label>
              <div style={{ position: "relative" }}>
                <input className={"input" + (errors.number ? " input-error" : "")}
                       placeholder="0000 0000 0000 0000"
                       value={card.number}
                       maxLength={19}
                       style={{ paddingRight: 52 }}
                       onChange={e => { setCard(c => ({ ...c, number: fmt(e.target.value, "card") })); setErrors(er => ({ ...er, number: "" })); }}/>
                <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
                  <CardIcon brand={brand}/>
                </div>
              </div>
              {errors.number && <span className="field-error">{errors.number}</span>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>Vencimiento</label>
                <input className={"input" + (errors.expiry ? " input-error" : "")}
                       placeholder="MM/AA"
                       value={card.expiry}
                       maxLength={5}
                       onChange={e => { setCard(c => ({ ...c, expiry: fmt(e.target.value, "expiry") })); setErrors(er => ({ ...er, expiry: "" })); }}/>
                {errors.expiry && <span className="field-error">{errors.expiry}</span>}
              </div>
              <div className="field">
                <label>CVV</label>
                <input className={"input" + (errors.cvv ? " input-error" : "")}
                       placeholder="•••"
                       type="password"
                       value={card.cvv}
                       maxLength={4}
                       onChange={e => { setCard(c => ({ ...c, cvv: fmt(e.target.value, "cvv") })); setErrors(er => ({ ...er, cvv: "" })); }}/>
                {errors.cvv && <span className="field-error">{errors.cvv}</span>}
              </div>
            </div>

            <button className="btn btn-brand" style={{ width: "100%", justifyContent: "center", padding: "14px", marginTop: 2 }}
                    onClick={handleCardPay}>
              Pagar S/{coupon.finalPrice} <Icon name="arrowRight" size={16}/>
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--ink-3)", fontSize: 11 }}>
              <Icon name="check" size={12}/> Cifrado de 256-bit · IziPay certificado
            </div>
          </div>
        )}

        {step === "processing" && (
          <div style={{ padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", width: 72, height: 72 }}>
              <svg width="72" height="72" viewBox="0 0 72 72" style={{ position: "absolute", inset: 0 }}>
                <circle cx="36" cy="36" r="30" fill="none" stroke="var(--line)" strokeWidth="5"/>
                <circle cx="36" cy="36" r="30" fill="none" stroke="var(--brand)" strokeWidth="5"
                        strokeLinecap="round" strokeDasharray="94.2" strokeDashoffset="25"
                        style={{ transformOrigin: "center", animation: "spin 1s linear infinite" }}/>
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                <div style={{
                  background: "linear-gradient(135deg, #F7941D, #E42128)", color: "#fff",
                  borderRadius: 8, padding: "3px 8px", fontSize: 9, fontWeight: 800,
                  fontFamily: "var(--font-mono)", letterSpacing: "0.04em"
                }}>IziPay</div>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Procesando pago…</div>
              <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6 }}>No cierres esta pantalla</div>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {step === "success" && (
          <div style={{ padding: "48px 24px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "var(--brand-soft)", display: "grid", placeItems: "center",
              animation: "geops-scale-in 400ms cubic-bezier(.2,.8,.2,1) both"
            }}>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
                <path d="M5 13l4 4L19 7" stroke="var(--brand-strong)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>¡Cupón reservado!</div>
              <div style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8, maxWidth: 280, lineHeight: 1.5 }}>
                Muestra esta pantalla al llegar a <strong>{coupon.brand}</strong>. Tu reserva expira en 30 minutos.
              </div>
            </div>
            <div style={{ background: "var(--bg-sunken)", borderRadius: 14, padding: "14px 20px", width: "100%", textAlign: "left" }}>
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>CÓDIGO DE RESERVA</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: 4, letterSpacing: "0.1em", color: "var(--brand-strong)" }}>
                GEOPS-{coupon.id.toUpperCase()}-7K3X
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Cerrando automáticamente…</div>
          </div>
        )}

        <style>{`
          .pay-method-btn {
            display: flex; align-items: center; gap: 14px;
            padding: 14px 16px; border-radius: 14px;
            border: 1.5px solid var(--line); background: var(--bg-elev);
            color: var(--ink); cursor: pointer; font-family: var(--font-sans);
            transition: border-color 160ms ease, background 160ms ease;
            width: 100%; text-align: left;
          }
          .pay-method-btn:hover { border-color: var(--ink); background: var(--bg-sunken); }
          .field-error { font-size: 11px; color: var(--danger); margin-top: 4px; display: block; }
          .input-error { border-color: var(--danger) !important; }
        `}</style>
      </div>
    </div>
  );

  const portalTarget = document.getElementById("geops-portal-root") ?? document.body;
  return createPortal(content, portalTarget);
}
