import { useRef, useState } from "react";
import { Business } from "@/shared/types.ts";
import { IEstablishmentRepository } from "../../domain/repositories/IEstablishmentRepository.ts";
import { HttpEstablishmentRepository } from "../../infrastructure/repositories/HttpEstablishmentRepository.ts";
import { listEstablishments } from "../../application/use-cases/ListEstablishments.ts";
import { saveEstablishment } from "../../application/use-cases/SaveEstablishment.ts";
import { deleteEstablishment } from "../../application/use-cases/DeleteEstablishment.ts";

/**
 * hook de presentacion: expone los establecimientos y las acciones CRUD,
 * apoyandose en los use-cases y el repositorio
 */
export function useEstablishments(repository?: IEstablishmentRepository) {
    const repoRef = useRef<IEstablishmentRepository>(repository ?? new HttpEstablishmentRepository());
    const [establishments, setEstablishments] = useState<Business[]>(() => listEstablishments(repoRef.current));

    const save = (establishment: Business) => {
        saveEstablishment(repoRef.current, establishment);
        setEstablishments(listEstablishments(repoRef.current));
    };

    const remove = (id: string) => {
        deleteEstablishment(repoRef.current, id);
        setEstablishments(listEstablishments(repoRef.current));
    };

    return { establishments, save, remove };
}