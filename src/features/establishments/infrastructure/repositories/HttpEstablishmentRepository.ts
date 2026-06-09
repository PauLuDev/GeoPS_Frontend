import { Business } from "@/shared/types.ts";
import { BUSINESSES } from "@/shared/constants.ts";
import { IEstablishmentRepository } from "../../domain/repositories/IEstablishmentRepository.ts";
// contrato de integracion (business-service):
// import { toBusiness, toCreateEstablishmentResource, toUpdateEstablishmentResource } from "../../application/mappers/EstablishmentMapper.ts";

/* base del API business */
const API_BASE = import.meta.env.VITE_BUSINESS_URL ?? "http://localhost:8083/api/v1";

/**
 * implementacion del repositorio de establecimientos contra el backend (HTTP)
 */
export class HttpEstablishmentRepository implements IEstablishmentRepository {
    private establishments: Business[];

    constructor(seed: Business[] = BUSINESSES.slice(0, 2)) {
        this.establishments = [...seed];
    }

    getAll(): Business[] {
        void API_BASE;
        return [...this.establishments];
    }

    save(establishment: Business): void {
        const exists = this.establishments.some(e => e.id === establishment.id);
        this.establishments = exists
            ? this.establishments.map(e => (e.id === establishment.id ? establishment : e))
            : [establishment, ...this.establishments];
    }

    remove(id: string): void {
        this.establishments = this.establishments.filter(e => e.id !== id);
    }
}