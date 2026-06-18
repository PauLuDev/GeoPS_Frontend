/**
 * dTOs (business-service · establishments)
 */

/* categoria (entidad propia, gestionada por ADMIN) */
export interface CategoryResource {
    id: number;            // long
    name: string;
    description?: string;
}

export interface EstablishmentResource {
    id: string;            // UUID
    ownerId: string;       // UUID (del token)
    name: string;
    ruc: string;
    address: string;
    openingTime?: string;  // "HH:mm:ss" - un solo horario para todos los dias
    closingTime?: string;
    latitude: number;
    longitude: number;
    categories: CategoryResource[];
}

/* body de creacion */
export interface CreateEstablishmentResource {
    name: string;
    ruc: string;
    address: string;
    openingTime?: string;
    closingTime?: string;
    latitude: number;
    longitude: number;
    categoryIds: number[];
}

/* body de edicion */
export interface UpdateEstablishmentResource {
    name: string;
    address: string;
    openingTime?: string;
    closingTime?: string;
    latitude: number;
    longitude: number;
    categoryIds: number[];
}