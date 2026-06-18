import { useEffect, useState } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";
import { Select } from "@/shared/ui/components/Select.tsx";
import { DatePicker } from "@/shared/ui/components/DatePicker.tsx";
import { Business } from "@/shared/types.ts";
import { PromotionType, PROMOTION_TYPES } from "@/features/campaigns/domain/value-objects/PromotionType.ts";
import { useCoupons } from "@/features/coupons/presentation/hooks/useCoupons.ts";

interface NewCouponFormProps {
    establishments: Business[];
    onCreated: () => void;
    onCancel: () => void;
}

/* form de cupon suelto -> se crea sin campana (campaignId null) con sus propias fechas */
export function NewCouponForm({ establishments, onCreated, onCancel }: NewCouponFormProps) {
    const { create, loading, error: rawError } = useCoupons();
    const error = rawError
        ? rawError.includes("402") || rawError.includes("403") || rawError.includes("400")
            ? "Has alcanzado el límite de cupones de tu plan. Mejora tu plan para crear más."
            : "No se pudo crear el cupón. Intenta de nuevo."
        : null;

    const [establishmentId, setEstablishmentId] = useState(establishments[0]?.id ?? "");

    /* los establecimientos cargan async: si el id quedo vacio en el primer render
       (cuando aun no habian llegado), lo completamos al primero disponible. sin
       esto, con un unico establecimiento el select esta oculto y no hay forma de
       setearlo -> el form se queda en "completa los campos obligatorios" */
    useEffect(() => {
        if (!establishmentId && establishments.length > 0) {
            setEstablishmentId(establishments[0].id);
        }
    }, [establishments, establishmentId]);
    const [title, setTitle]               = useState("");
    const [promotionType, setPromotionType] = useState<PromotionType>("PERCENTAGE");
    const [discountValue, setDiscountValue] = useState("");
    const [minPurchase, setMinPurchase]   = useState("");
    const [stock, setStock]               = useState("");
    const [description, setDescription]   = useState("");
    const [startDate, setStartDate]       = useState("");
    const [endDate, setEndDate]           = useState("");
    const [submitted, setSubmitted]       = useState(false);

    const needsDiscount = promotionType !== "BUY_X_GET_Y";
    const discountNum = parseFloat(discountValue);
    const stockNum    = parseInt(stock);

    const errors = {
        establishment: !establishmentId,
        title: !title.trim(),
        discount: needsDiscount && (isNaN(discountNum) || discountNum <= 0 || (promotionType === "PERCENTAGE" && discountNum > 100)),
        stock: isNaN(stockNum) || stockNum < 1,
        start: !startDate,
        end: !endDate || (!!startDate && endDate < startDate),
    };
    const isValid = !Object.values(errors).some(Boolean);
    const err = (f: keyof typeof errors) => submitted && errors[f];

    const submit = async () => {
        setSubmitted(true);
        if (!isValid) return;
        const created = await create({
            establishmentId,
            campaignId: null,
            title: title.trim(),
            description: description.trim() || undefined,
            stock: stockNum,
            promotionType,
            discountValue: needsDiscount ? discountNum : 0,
            minPurchaseAmount: minPurchase.trim() ? parseFloat(minPurchase) : null,
            startDate,
            endDate,
        });
        if (created) onCreated();
    };

    if (establishments.length === 0) {
        return (
            <div className="card cl-empty">
                <div className="cl-empty-icon"><Icon name="store" size={30}/></div>
                <div className="cl-empty-title">Registra un establecimiento primero</div>
                <p className="page-subtitle">Un cupón siempre pertenece a un establecimiento tuyo.</p>
                <button type="button" className="btn" onClick={onCancel}>Volver</button>
            </div>
        );
    }

    const discountLabel = promotionType === "FIXED_AMOUNT" ? "Monto de descuento (S/)" : "Descuento (%)";

    return (
        <div className="card nc-card cl-new-coupon">
            <div className="eyebrow nc-eyebrow">Nuevo cupón</div>

            {submitted && !isValid && (
                <div className="nc-coupons-err"><Icon name="close" size={12}/> Completa los campos obligatorios</div>
            )}
            {error && <div className="nc-coupons-err"><Icon name="close" size={12}/> {error}</div>}

            <div className="nc-fields">
                {establishments.length > 1 && (
                    <div className="field">
                        <label htmlFor="ncf-est">Establecimiento</label>
                        <select id="ncf-est" className="input" value={establishmentId}
                                onChange={e => setEstablishmentId(e.target.value)}>
                            {establishments.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                )}

                <div className="field">
                    <label htmlFor="ncf-title">Nombre del cupón</label>
                    <input id="ncf-title" className={"input" + (err("title") ? " input-error" : "")}
                           placeholder='Ej. "2x1 en lomo saltado"'
                           value={title} onChange={e => setTitle(e.target.value)}/>
                </div>

                <div className="nc-row2">
                    <div className="field">
                        <label htmlFor="ncf-promo">Tipo de cupón</label>
                        <Select id="ncf-promo" value={promotionType}
                                options={PROMOTION_TYPES.map(p => ({ value: p.id, label: p.label }))}
                                onChange={v => setPromotionType(v as PromotionType)}/>
                    </div>
                    {needsDiscount && (
                        <div className="field">
                            <label htmlFor="ncf-disc">{discountLabel}</label>
                            <input id="ncf-disc" className={"input" + (err("discount") ? " input-error" : "")}
                                   type="number" min={0} step={promotionType === "PERCENTAGE" ? 1 : 0.5}
                                   value={discountValue} onChange={e => setDiscountValue(e.target.value)}/>
                        </div>
                    )}
                </div>

                <div className="nc-row2">
                    <div className="field">
                        <label htmlFor="ncf-stock">Stock (unidades)</label>
                        <input id="ncf-stock" className={"input" + (err("stock") ? " input-error" : "")}
                               type="number" min={1} step={1}
                               value={stock} onChange={e => setStock(e.target.value)}/>
                    </div>
                    <div className="field">
                        <label htmlFor="ncf-min">Compra mínima (S/) <span className="nc-optional">opcional</span></label>
                        <input id="ncf-min" className="input" type="number" min={0} step={0.5}
                               value={minPurchase} onChange={e => setMinPurchase(e.target.value)}/>
                    </div>
                </div>

                <div className="nc-row2">
                    <div className="field">
                        <label htmlFor="ncf-start">Inicio</label>
                        <DatePicker id="ncf-start" value={startDate} onChange={setStartDate}/>
                    </div>
                    <div className="field">
                        <label htmlFor="ncf-end">Fin</label>
                        <DatePicker id="ncf-end" value={endDate} onChange={setEndDate} min={startDate || undefined}/>
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="ncf-desc">Descripción <span className="nc-optional">opcional</span></label>
                    <textarea id="ncf-desc" className="input" rows={2}
                              placeholder="Condiciones o detalles del cupón..."
                              value={description} onChange={e => setDescription(e.target.value)}/>
                </div>
            </div>

            <div className="nc-form-actions">
                <button type="button" className="btn" onClick={onCancel} disabled={loading}>Cancelar</button>
                <button type="button" className="btn btn-brand nc-grow" onClick={submit} disabled={loading}>
                    {loading ? "Guardando…" : <>Publicar cupón <Icon name="arrowRight" size={14}/></>}
                </button>
            </div>
        </div>
    );
}