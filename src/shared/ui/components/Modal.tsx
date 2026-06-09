import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    onClose: () => void;
    /** etiqueta accesible (si no hay un título referenciable por id) */
    ariaLabel?: string;
    /** id del título dentro del modal (preferido sobre ariaLabel) */
    labelledBy?: string;
    /** clases extra para la caja del diálogo (tamaño/posición por caso) */
    className?: string;
    /** si false, Esc y click en el backdrop no cierran (ej. paso obligatorio) */
    dismissable?: boolean;
    children: React.ReactNode;
}

/**
 * Modal accesible sobre <dialog> nativo: focus-trap, Esc y fondo inerte
 * los aporta el navegador. El estado de apertura lo controla el padre
 * (montar/desmontar este componente).
 */
export function Modal({ onClose, ariaLabel, labelledBy, className = "", dismissable = true, children }: ModalProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dlg = ref.current;
        if (dlg && !dlg.open) dlg.showModal();
        return () => { if (dlg?.open) dlg.close(); };
    }, []);

    /* Esc dispara 'cancel': lo controlamos nosotros para no cerrar sin avisar al padre */
    const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
        e.preventDefault();
        if (dismissable) onClose();
    };
    /* click en el backdrop: el target es el propio <dialog> */
    const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (dismissable && e.target === ref.current) onClose();
    };

    const target = document.getElementById("geops-portal-root") ?? document.body;
    return createPortal(
        <dialog ref={ref} className={"geops-dialog " + className}
                aria-label={ariaLabel} aria-labelledby={labelledBy}
                onCancel={handleCancel} onClick={handleClick}>
            {children}
        </dialog>,
        target
    );
}