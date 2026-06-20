import { Business } from "@/shared/types.ts";

/*
 contrato del repositorio de establecimientos
 el tipo Business vive en shared porque lo comparte con la vista del cliente
*/
export interface IEstablishmentRepository {
    getAll(): Promise<Business[]>;
    save(establishment: Business): Promise<Business>;   // crea o actualiza segun el id
    remove(id: string): Promise<void>;
}