import { Business } from "@/shared/types.ts";

/**
 * puerto (interface) del repositorio de establecimientos
 * el tipo `Business` vive en shared porque es un kernel compartido
 * con el BC `coupons` (vista cliente del local)
 */
export interface IEstablishmentRepository {
    getAll(): Business[];
    save(establishment: Business): void;   // crea o actualiza (upsert por id)
    remove(id: string): void;
}