import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon.tsx";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    id?: string;
    placeholder?: string;
}

/* dropdown estilizado (reemplazo del select nativo) -> se ve como el menu de exportar/filtros */
export function Select({ value, options, onChange, id, placeholder = "Selecciona" }: SelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    const current = options.find(o => o.value === value);

    return (
        <div className="ui-select" ref={ref}>
            <button type="button" id={id} className="input ui-select-btn" aria-haspopup="listbox" aria-expanded={open}
                    onClick={() => setOpen(o => !o)}>
                <span className={current ? "" : "ui-select-ph"}>{current?.label ?? placeholder}</span>
                <Icon name="chevronDown" size={14}/>
            </button>
            {open && (
                <div className="ui-select-menu" role="listbox">
                    {options.map(o => (
                        <button type="button" key={o.value} role="option" aria-selected={o.value === value}
                                className={"ui-select-item" + (o.value === value ? " active" : "")}
                                onClick={() => { onChange(o.value); setOpen(false); }}>
                            {o.label}
                            {o.value === value && <Icon name="check" size={13}/>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}