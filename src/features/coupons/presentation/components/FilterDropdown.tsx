import { useEffect, useRef, useState } from "react";
import { Icon } from "@/shared/ui/components/Icon.tsx";

interface DropItem {
    key: string;
    label: string;
    active: boolean;
    onSelect: () => void;
}

interface FilterDropdownProps {
    label: string;     // texto del lado izquierdo (radio, orden, mostrar)
    display: string;   // opcion actual en el boton
    items: DropItem[];
}

/* selector tipo dropdown para los filtros del mapa */
export function FilterDropdown({ label, display, items }: FilterDropdownProps) {
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

    return (
        <div className="rp-dd-group">
            <span className="rp-sort-label">{label}</span>
            <div className="rp-dd" ref={ref}>
                <button type="button" className="rp-dd-btn" onClick={() => setOpen(o => !o)}>
                    {display} <Icon name="chevronDown" size={13}/>
                </button>
                {open && (
                    <div className="rp-dd-menu" role="menu">
                        {items.map(it => (
                            <button type="button" key={it.key} role="menuitem"
                                    className={"rp-dd-item" + (it.active ? " active" : "")}
                                    onClick={() => { it.onSelect(); setOpen(false); }}>
                                {it.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}