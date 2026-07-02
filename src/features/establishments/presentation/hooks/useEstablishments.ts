import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Business } from "@/shared/types.ts";
import { IEstablishmentRepository } from "../../domain/repositories/IEstablishmentRepository.ts";
import { HttpEstablishmentRepository } from "../../infrastructure/repositories/HttpEstablishmentRepository.ts";
import { listEstablishments } from "../../application/use-cases/ListEstablishments.ts";
import { saveEstablishment } from "../../application/use-cases/SaveEstablishment.ts";
import { deleteEstablishment } from "../../application/use-cases/DeleteEstablishment.ts";
import { mapApiError, AppError } from "@/shared/api/errorMapper.ts";

/**
 * hook de presentacion: expone los establecimientos y las acciones CRUD,
 * apoyandose en los use-cases y el repositorio
 */
export function useEstablishments(repository?: IEstablishmentRepository) {
    const { t } = useTranslation();
    const repoRef = useRef<IEstablishmentRepository>(repository ?? new HttpEstablishmentRepository());
    const [establishments, setEstablishments] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AppError | null>(null);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setEstablishments(await listEstablishments(repoRef.current));
        } catch (e) {
            setError(mapApiError(e, t));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { void reload(); }, [reload]);

    const save = async (establishment: Business) => {
        await saveEstablishment(repoRef.current, establishment);
        await reload();
    };

    const remove = async (id: string) => {
        await deleteEstablishment(repoRef.current, id);
        await reload();
    };

    return { establishments, loading, error, save, remove };
}