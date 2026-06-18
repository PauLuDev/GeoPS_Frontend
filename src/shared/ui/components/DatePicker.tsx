import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./Icon.tsx";

interface DatePickerProps {
    value: string;            // yyyy-MM-dd
    onChange: (value: string) => void;
    id?: string;
    placeholder?: string;
    min?: string;             // yyyy-MM-dd (no deja elegir antes)
    error?: boolean;          // pinta el borde de rojo igual que los demas inputs
}

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const display = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return y && m && d ? `${pad(d)}/${pad(m)}/${y}` : iso;
};

/* date picker propio (calendario estilizado, sin el nativo del navegador) */
export function DatePicker({ value, onChange, id, placeholder = "dd/mm/aaaa", min, error = false }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const base = value ? value.split("-").map(Number) : null;
    const [viewYear, setViewYear] = useState(base ? base[0] : new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(base ? base[1] - 1 : new Date().getMonth());

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    /* al abrir, posiciona el calendario en el mes del valor elegido */
    useEffect(() => {
        if (open && value) {
            const [y, m] = value.split("-").map(Number);
            setViewYear(y); setViewMonth(m - 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const cells = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();   // 0 = domingo
        const lead = (firstDay + 6) % 7;                              // la semana empieza en lunes
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const out: (number | null)[] = [];
        for (let i = 0; i < lead; i++) out.push(null);
        for (let d = 1; d <= daysInMonth; d++) out.push(d);
        return out;
    }, [viewYear, viewMonth]);

    const prev = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
    const next = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

    const pick = (d: number) => {
        const iso = toISO(viewYear, viewMonth, d);
        if (min && iso < min) return;
        onChange(iso);
        setOpen(false);
    };

    return (
        <div className="ui-select ui-date" ref={ref}>
            <button type="button" id={id} className={"input ui-select-btn" + (error ? " input-error" : "")} onClick={() => setOpen(o => !o)}>
                <span className={value ? "" : "ui-select-ph"}>{value ? display(value) : placeholder}</span>
                <Icon name="clock" size={14}/>
            </button>
            {open && (
                <div className="ui-date-pop">
                    <div className="ui-date-head">
                        <button type="button" className="ui-date-nav" onClick={prev} aria-label="Mes anterior"><Icon name="arrowLeft" size={14}/></button>
                        <span className="ui-date-title">{MONTHS[viewMonth]} {viewYear}</span>
                        <button type="button" className="ui-date-nav" onClick={next} aria-label="Mes siguiente"><Icon name="arrowRight" size={14}/></button>
                    </div>
                    <div className="ui-date-grid ui-date-weekdays">
                        {WEEKDAYS.map(w => <span key={w} className="ui-date-wd">{w}</span>)}
                    </div>
                    <div className="ui-date-grid">
                        {cells.map((d, i) => d === null
                            ? <span key={i}/>
                            : (
                                <button type="button" key={i}
                                        disabled={!!min && toISO(viewYear, viewMonth, d) < min}
                                        className={"ui-date-day" + (value === toISO(viewYear, viewMonth, d) ? " selected" : "")}
                                        onClick={() => pick(d)}>
                                    {d}
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}