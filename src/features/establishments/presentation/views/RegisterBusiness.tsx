import { Icon } from "@/shared/ui/components/Icon.tsx";
import { BrandMark } from "@/shared/ui/components/BrandMark.tsx";
import { Business } from "@/shared/types.ts";
import { BusinessForm } from "@/features/establishments/presentation/components/BusinessForm.tsx";

interface RegisterBusinessProps {
    onDone: (business: Business) => void;
    onBack: () => void;
}

export function RegisterBusiness({ onDone, onBack }: RegisterBusinessProps) {
    return (
        <div className="rb-root">
            <div className="rb-head">
                <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>
                    <Icon name="arrowLeft" size={14}/> Atrás
                </button>
                <div className="brand"><BrandMark/><span>GeoPS</span></div>
                <span className="badge badge-line">Negocio</span>
            </div>

            <div className="rb-body">
                <div className="rb-intro">
                    <div className="eyebrow rb-intro-eyebrow">Registro de establecimiento</div>
                    <h1 className="rb-intro-title">Registra tu negocio</h1>
                    <p className="rb-intro-text">
                        Carga tu logo, fotos, descripción y horarios para mejorar tu visibilidad en el mapa.
                    </p>
                </div>

                <BusinessForm
                    submitLabel="Registrar negocio"
                    onSubmit={onDone}
                    onCancel={onBack}
                />
                <div className="rb-bottom-space"/>
            </div>
        </div>
    );
}