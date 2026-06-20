/**
 * value object: catalogo de tipos de campana (ocasiones)
 * el dueno puede elegir uno preestablecido o escribir uno propio
 */
export interface CampaignType {
    id: string;     // se usa como etiqueta visible tambien
    icon: string;
}

export const CAMPAIGN_TYPES: CampaignType[] = [
    { id: "Día de la Madre", icon: "heart"    },
    { id: "Día del Padre",   icon: "user"     },
    { id: "Día del Niño",    icon: "sparkles" },
    { id: "San Valentín",    icon: "heart"    },
    { id: "Navidad",         icon: "sparkles" },
    { id: "Año Nuevo",       icon: "sparkles" },
    { id: "Fiestas Patrias", icon: "flag"     },
    { id: "Día del Maestro", icon: "star"     },
];