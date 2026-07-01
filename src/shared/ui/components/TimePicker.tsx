import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "./Icon.tsx";

interface TimePickerProps {
    value: string;                 // "HH:mm"
    onChange: (value: string) => void;
    "aria-label"?: string;
    className?: string;
    minuteStep?: number;           // por defecto 1 (00..59); usa 5/15 para listas mas cortas
}

const pad = (n: number) => (n < 10 ? "0" + n : "" + n);
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));

/* selector de hora propio (dos columnas desplegables, sin el picker nativo del
   navegador -> mismo look oscuro que el resto de menus de la app) */
export function TimePicker({ value, onChange, className = "", minuteStep = 1, ...rest }: TimePickerProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const hourColRef = useRef<HTMLDivElement>(null);
    const minColRef = useRef<HTMLDivElement>(null);

    const [h, m] = value && value.includes(":") ? value.split(":") : ["", ""];
    const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => pad(i * minuteStep));

    /* cierra al hacer clic fuera */
    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    /* al abrir, centra cada columna en el valor seleccionado */
    useLayoutEffect(() => {
        if (!open) return;
        for (const col of [hourColRef.current, minColRef.current]) {
            const sel = col?.querySelector<HTMLElement>(".ui-time-opt.selected");
            if (sel && col) col.scrollTop = sel.offsetTop - col.clientHeight / 2 + sel.clientHeight / 2;
        }
    }, [open]);

    const pickHour = (hh: string) => onChange(`${hh}:${m || "00"}`);
    const pickMin = (mm: string) => onChange(`${h || "00"}:${mm}`);

    return (
        <div className={"ui-select ui-time " + className} ref={ref}>
            <button type="button" className="input ui-select-btn ui-time-btn"
                    aria-label={rest["aria-label"]} onClick={() => setOpen(o => !o)}>
                <span className={value ? "" : "ui-select-ph"}>{value || "--:--"}</span>
                <Icon name="clock" size={14}/>
            </button>
            {open && (
                <div className="ui-time-pop" role="dialog">
                    <div className="ui-time-col" ref={hourColRef}>
                        {HOURS.map(hh => (
                            <button type="button" key={hh}
                                    className={"ui-time-opt" + (hh === h ? " selected" : "")}
                                    onClick={() => pickHour(hh)}>{hh}</button>
                        ))}
                    </div>
                    <div className="ui-time-sep">:</div>
                    <div className="ui-time-col" ref={minColRef}>
                        {minutes.map(mm => (
                            <button type="button" key={mm}
                                    className={"ui-time-opt" + (mm === m ? " selected" : "")}
                                    onClick={() => pickMin(mm)}>{mm}</button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
