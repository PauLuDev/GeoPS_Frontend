import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Modal } from "@/shared/ui/components/Modal.tsx";
import { Coupon } from "@/shared/types.ts";
import { reservationCode } from "@/shared/utils/reservationCode.ts";

function fmt(val: string, type: "card" | "expiry" | "cvv") {
  const d = val.replace(/\D/g, "");
  if (type === "card")   return d.slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  if (type === "expiry") return d.slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
  if (type === "cvv")    return d.slice(0, 4);
  return val;
}

function CardIcon({ brand }: { brand: string }) {
  if (brand === "visa") return (
    <svg viewBox="0 0 38 24" width="38" height="24" className="pay-card-svg">
      <rect width="38" height="24" rx="4" fill="#1A1F71"/>
      <text x="7" y="17" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fill="#FFFFFF" letterSpacing="-0.5">VISA</text>
    </svg>
  );
  if (brand === "mastercard") return (
    <svg viewBox="0 0 38 24" width="38" height="24" className="pay-card-svg">
      <rect width="38" height="24" rx="4" fill="#252525"/>
      <circle cx="14" cy="12" r="8" fill="#EB001B"/>
      <circle cx="24" cy="12" r="8" fill="#F79E1B"/>
      <path d="M 19 5.8 a 8 8 0 0 1 0 12.4 A 8 8 0 0 1 19 5.8 Z" fill="#FF5F00"/>
    </svg>
  );
  if (brand === "amex") return (
    <svg viewBox="0 0 38 24" width="38" height="24" className="pay-card-svg">
      <rect width="38" height="24" rx="4" fill="#007BC1"/>
      <text x="5" y="17" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="10" fill="#FFFFFF" letterSpacing="0.2">AMEX</text>
    </svg>
  );
  return <div className="pay-card-fallback"><Icon name="card" size={14}/></div>;
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
  const { t } = useTranslation();
  const [step, setStep]       = useState<Step>("method");
  const [, setMethod]         = useState<"izipay" | "yape" | "plin" | "">("");
  const [card, setCard]       = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const isFree = coupon.finalPrice === 0;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!card.name.trim())                                      e.name   = t("payment.errName");
    if (card.number.replace(/\s/g, "").length < 16)            e.number = t("payment.errNumber");
    if (card.expiry.length < 5)                                 e.expiry = t("payment.errExpiry");
    if (card.cvv.length < 3)                                    e.cvv    = t("payment.errCvv");
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

  return (
    <Modal onClose={onClose} ariaLabel="Reservar cupón" className="pay-modal">

        {step !== "success" && step !== "processing" && (
          <div className="pay-head">
            <div className="pay-head-left">
              {step === "card" && (
                <button type="button" className="btn btn-icon btn-sm" onClick={() => setStep("method")}>
                  <Icon name="arrowLeft" size={14}/>
                </button>
              )}
              <div>
                <div className="pay-eyebrow">
                  {step === "method" ? t("payment.secureCheckout") : t("payment.cardData")}
                </div>
                <div className="pay-title">
                  {t("payment.reserveCoupon")}
                </div>
              </div>
            </div>
            <button type="button" className="btn btn-icon btn-sm" onClick={onClose}><Icon name="close" size={15}/></button>
          </div>
        )}

        {(step === "method" || step === "card") && (
          <div className="pay-summary">
            {coupon.imageUrl ? (
              <div className="pay-sum-thumb">
                <img src={coupon.imageUrl} alt={coupon.brand} className="pay-sum-thumb-img"/>
              </div>
            ) : (
              <div className="pay-sum-thumb pay-sum-thumb-ph">
                <Icon name="food" size={22}/>
              </div>
            )}
            <div className="pay-sum-main">
              <div className="pay-sum-brand">{coupon.brand}</div>
              <div className="pay-sum-title">{coupon.title}</div>
              <div className="pay-sum-disc">{t("payment.discount", { discount: coupon.discount })}</div>
            </div>
            <div className="pay-sum-price">
              <div className="pay-sum-orig">S/{coupon.originalPrice}</div>
              <div className={"pay-sum-final" + (isFree ? " free" : "")}>
                {isFree ? t("payment.free") : `S/${coupon.finalPrice}`}
              </div>
            </div>
          </div>
        )}

        {step === "method" && (
          <div className="pay-method-list">
            <div className="pay-method-head">
              <div className="pay-method-head-label">
                {t("payment.secureWith")}
              </div>
              <div className="pay-brand-badge">IziPay</div>
            </div>

            {isFree ? (
              <button type="button" className="btn btn-brand pay-btn-block" onClick={pay}>
                {t("payment.confirmFree")} <Icon name="arrowRight" size={16}/>
              </button>
            ) : (
              <>
                <button type="button" className="pay-method-btn" onClick={() => { setMethod("yape"); pay(); }}>
                  <div className="pay-mb-icon yape">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                      <circle cx="12" cy="12" r="11" fill="#6A0DAD"/>
                      <path d="M7 9l5 6 5-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="pay-mb-main">
                    <div className="pay-mb-title">Yape</div>
                    <div className="pay-mb-sub">{t("payment.yapeSub")}</div>
                  </div>
                  <Icon name="arrowRight" size={14} />
                </button>

                <button type="button" className="pay-method-btn" onClick={() => { setMethod("plin"); pay(); }}>
                  <div className="pay-mb-icon plin">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                      <path d="M5 12l5 5L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="pay-mb-main">
                    <div className="pay-mb-title">Plin</div>
                    <div className="pay-mb-sub">{t("payment.plinSub")}</div>
                  </div>
                  <Icon name="arrowRight" size={14}/>
                </button>

                <button type="button" className="pay-method-btn" onClick={() => { setMethod("izipay"); setStep("card"); }}>
                  <div className="pay-mb-icon izipay">
                    <Icon name="card" size={20}/>
                  </div>
                  <div className="pay-mb-main">
                    <div className="pay-mb-title">{t("payment.cardOption")}</div>
                    <div className="pay-mb-cards">
                      <CardIcon brand="visa"/><CardIcon brand="mastercard"/><CardIcon brand="amex"/>
                    </div>
                  </div>
                  <Icon name="arrowRight" size={14}/>
                </button>
              </>
            )}

            <div className="pay-ssl">
              <Icon name="check" size={12}/> {t("payment.sslNote")}
            </div>
          </div>
        )}

        {step === "card" && (
          <div className="pay-card-form">
            <div className="pay-card-preview">
              <div className="pay-card-deco1"/>
              <div className="pay-card-deco2"/>
              <div className="pay-card-top">
                <div className="pay-card-label">{t("payment.card")}</div>
                <CardIcon brand={brand}/>
              </div>
              <div className="pay-card-number">
                {card.number || "•••• •••• •••• ••••"}
              </div>
              <div className="pay-card-bottom">
                <div>
                  <div className="pay-card-sublabel">{t("payment.holder")}</div>
                  <div className="pay-card-holder">
                    {card.name || t("payment.holderPlaceholder")}
                  </div>
                </div>
                <div className="pay-card-right">
                  <div className="pay-card-sublabel">{t("payment.expiresShort")}</div>
                  <div className="pay-card-value">{card.expiry || t("payment.dateFormat")}</div>
                </div>
              </div>
            </div>

            <div className="field">
              <label htmlFor="pay-name">{t("payment.nameLabel")}</label>
              <input id="pay-name" className={"input" + (errors.name ? " input-error" : "")}
                     placeholder={t("payment.namePlaceholder")}
                     value={card.name}
                     onChange={e => { setCard(c => ({ ...c, name: e.target.value })); setErrors(er => ({ ...er, name: "" })); }}/>
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="field">
              <label htmlFor="pay-number">{t("payment.numberLabel")}</label>
              <div className="pay-input-wrap">
                <input id="pay-number" className={"input pay-input-card" + (errors.number ? " input-error" : "")}
                       placeholder="0000 0000 0000 0000"
                       value={card.number}
                       maxLength={19}
                       onChange={e => { setCard(c => ({ ...c, number: fmt(e.target.value, "card") })); setErrors(er => ({ ...er, number: "" })); }}/>
                <div className="pay-card-badge">
                  <CardIcon brand={brand}/>
                </div>
              </div>
              {errors.number && <span className="field-error">{errors.number}</span>}
            </div>

            <div className="pay-grid2">
              <div className="field">
                <label htmlFor="pay-expiry">{t("payment.expiryLabel")}</label>
                <input id="pay-expiry" className={"input" + (errors.expiry ? " input-error" : "")}
                       placeholder={t("payment.dateFormat")}
                       value={card.expiry}
                       maxLength={5}
                       onChange={e => { setCard(c => ({ ...c, expiry: fmt(e.target.value, "expiry") })); setErrors(er => ({ ...er, expiry: "" })); }}/>
                {errors.expiry && <span className="field-error">{errors.expiry}</span>}
              </div>
              <div className="field">
                <label htmlFor="pay-cvv">{t("payment.cvvLabel")}</label>
                <input id="pay-cvv" className={"input" + (errors.cvv ? " input-error" : "")}
                       placeholder="•••"
                       type="password"
                       value={card.cvv}
                       maxLength={4}
                       onChange={e => { setCard(c => ({ ...c, cvv: fmt(e.target.value, "cvv") })); setErrors(er => ({ ...er, cvv: "" })); }}/>
                {errors.cvv && <span className="field-error">{errors.cvv}</span>}
              </div>
            </div>

            <button type="button" className="btn btn-brand pay-btn-block pay-btn-pay" onClick={handleCardPay}>
              {t("payment.pay", { price: coupon.finalPrice })} <Icon name="arrowRight" size={16}/>
            </button>

            <div className="pay-ssl pay-ssl-card">
              <Icon name="check" size={12}/> {t("payment.encNote")}
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="pay-processing">
            <div className="pay-spinner">
              <svg width="72" height="72" viewBox="0 0 72 72" className="pay-spinner-svg">
                <circle cx="36" cy="36" r="30" fill="none" stroke="var(--line)" strokeWidth="5"/>
                <circle cx="36" cy="36" r="30" fill="none" stroke="var(--brand)" strokeWidth="5"
                        strokeLinecap="round" strokeDasharray="94.2" strokeDashoffset="25"
                        className="pay-spinner-arc"/>
              </svg>
              <div className="pay-spinner-center">
                <div className="pay-izipay-badge">IziPay</div>
              </div>
            </div>
            <div className="pay-proc-text">
              <div className="pay-proc-title">{t("payment.processing")}</div>
              <div className="pay-proc-sub">{t("payment.dontClose")}</div>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="pay-success">
            <div className="pay-success-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
                <path d="M5 13l4 4L19 7" stroke="var(--brand-strong)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="pay-success-title">{t("payment.successTitle")}</div>
              <div className="pay-success-text">
                {t("payment.successText", { brand: coupon.brand })}
              </div>
            </div>
            <div className="pay-code-box">
              <div className="pay-code-label">{t("payment.codeLabel")}</div>
              <div className="pay-code-value">
                GEOPS-{coupon.id.toUpperCase()}-{reservationCode(coupon.id)}
              </div>
            </div>
            <div className="pay-closing">{t("payment.closing")}</div>
          </div>
        )}

    </Modal>
  );
}