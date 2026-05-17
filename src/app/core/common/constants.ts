import { Category, Coupon, UserCoord } from "./types";

export const CATEGORIES: Category[] = [
    { id: "all",      label: "Todo",      icon: "grid" },
    { id: "food",     label: "Comida",    icon: "food" },
    { id: "cafe",     label: "Café",      icon: "cafe" },
    { id: "shop",     label: "Tiendas",   icon: "cart" },
    { id: "health",   label: "Salud",     icon: "health" },
    { id: "services", label: "Servicios", icon: "sparkles" },
];

export const USER_COORD: UserCoord = { lat: -12.1211, lng: -77.0297 };
export const MAP_CENTER: UserCoord  = { lat: -12.1211, lng: -77.0297 };

export const COUPONS: Coupon[] = [
    {
        id: "c1", brand: "Tanta", category: "food",
        x: 460, y: 380, lat: -12.1232, lng: -77.0301,
        title: "2x1 en lomo saltado", discount: "50%", originalPrice: 48, finalPrice: 24,
        distance: 220, walking: 3, address: "Av. Pardo 1145, Miraflores",
        stock: 23, totalStock: 60, expiresIn: "2h 14m", rating: 4.7, reviews: 312, featured: true,
        description: "Aplica de lunes a jueves de 12:00 a 16:00. Válido para consumo en local.",
        imageUrl: "https://images.unsplash.com/photo-1761315414522-a732eb715497?w=600&q=80"
    },
    {
        id: "c2", brand: "La Bodega Verde", category: "cafe",
        x: 620, y: 290, lat: -12.1185, lng: -77.0265,
        title: "Café + croissant por S/15", discount: "30%", originalPrice: 22, finalPrice: 15,
        distance: 380, walking: 5, address: "Calle Berlín 320, Miraflores",
        stock: 8, totalStock: 30, expiresIn: "5h 02m", rating: 4.8, reviews: 187,
        description: "Solo en horario de mañana, hasta agotar stock.",
        imageUrl: "https://images.unsplash.com/photo-1737700088850-d0b53f9d39ec?w=600&q=80"
    },
    {
        id: "c3", brand: "Farmacia Cruz Verde", category: "health",
        x: 720, y: 480, lat: -12.1265, lng: -77.0252,
        title: "20% en multivitamínicos", discount: "20%", originalPrice: 60, finalPrice: 48,
        distance: 540, walking: 7, address: "Av. Larco 880, Miraflores",
        stock: 41, totalStock: 50, expiresIn: "1d 8h", rating: 4.5, reviews: 96,
        description: "Aplica con presentación de cupón en caja.",
        imageUrl: "https://images.unsplash.com/photo-1739289696449-cba3a5ef085d?w=600&q=80"
    },
    {
        id: "c4", brand: "Vivanda", category: "shop",
        x: 380, y: 520, lat: -12.1278, lng: -77.0335,
        title: "S/15 OFF en compras +S/100", discount: "S/15", originalPrice: 100, finalPrice: 85,
        distance: 410, walking: 6, address: "Ovalo Gutiérrez, Miraflores",
        stock: 156, totalStock: 200, expiresIn: "3d", rating: 4.6, reviews: 1204,
        description: "Aplica una vez por cliente. No acumulable.",
        imageUrl: "https://images.unsplash.com/photo-1714224247661-ee250f55a842?w=600&q=80"
    },
    {
        id: "c5", brand: "Astrid & Gastón", category: "food",
        x: 560, y: 200, lat: -12.1145, lng: -77.0288,
        title: "Menú degustación 2x1", discount: "50%", originalPrice: 320, finalPrice: 160,
        distance: 720, walking: 10, address: "Av. Paz Soldán 290, San Isidro",
        stock: 4, totalStock: 12, expiresIn: "12h", rating: 4.9, reviews: 2870, featured: true,
        description: "Reserva previa requerida. Solo para 2 personas.",
        imageUrl: "https://images.unsplash.com/photo-1611262359546-64e2822b2ab5?w=600&q=80"
    },
    {
        id: "c6", brand: "Wong Benavides", category: "shop",
        x: 820, y: 380, lat: -12.1228, lng: -77.0205,
        title: "3x2 en frutas seleccionadas", discount: "33%", originalPrice: 30, finalPrice: 20,
        distance: 680, walking: 9, address: "Av. Benavides 2050, Miraflores",
        stock: 88, totalStock: 100, expiresIn: "1d", rating: 4.4, reviews: 502,
        description: "Frutas de estación según disponibilidad.",
        imageUrl: "https://images.unsplash.com/photo-1714224247661-ee250f55a842?w=600&q=80"
    },
    {
        id: "c7", brand: "Starbucks Larcomar", category: "cafe",
        x: 480, y: 580, lat: -12.1310, lng: -77.0310,
        title: "Frappuccino mediano S/9", discount: "40%", originalPrice: 15, finalPrice: 9,
        distance: 290, walking: 4, address: "Larcomar nivel 2, Miraflores",
        stock: 67, totalStock: 80, expiresIn: "6h", rating: 4.3, reviews: 423,
        description: "De 14:00 a 17:00. No incluye toppings premium.",
        imageUrl: "https://images.unsplash.com/photo-1716808681381-52cf8055b02d?w=600&q=80"
    },
    {
        id: "c8", brand: "Spa Luna", category: "services",
        x: 700, y: 600, lat: -12.1295, lng: -77.0240,
        title: "Masaje 60min con 35% off", discount: "35%", originalPrice: 120, finalPrice: 78,
        distance: 820, walking: 11, address: "Calle Las Camelias 750, San Borja",
        stock: 6, totalStock: 15, expiresIn: "2d", rating: 4.9, reviews: 142,
        description: "Citas previas. Aplica de lunes a viernes.",
        imageUrl: "https://images.unsplash.com/photo-1757689314932-bec6e9c39e51?w=600&q=80"
    },
    {
        id: "c9", brand: "Osaka San Isidro", category: "food",
        x: 430, y: 190, lat: -12.0971, lng: -77.0369,
        title: "Sushi rolls 2x1 al mediodía", discount: "50%", originalPrice: 72, finalPrice: 36,
        distance: 1400, walking: 18, address: "Calle Santa Luisa 295, San Isidro",
        stock: 14, totalStock: 30, expiresIn: "3h 30m", rating: 4.8, reviews: 890, featured: true,
        description: "Solo de 12:00 a 15:00 h. Incluye rolls de la carta clásica.",
        imageUrl: "https://images.unsplash.com/photo-1717838207789-62684e75a770?w=600&q=80"
    },
    {
        id: "c10", brand: "Il Postino", category: "food",
        x: 360, y: 230, lat: -12.0932, lng: -77.0453,
        title: "Pizza napolitana 30% off", discount: "30%", originalPrice: 44, finalPrice: 31,
        distance: 1850, walking: 23, address: "Av. 2 de Mayo 704, San Isidro",
        stock: 19, totalStock: 40, expiresIn: "4h", rating: 4.6, reviews: 341,
        description: "Aplica en todo el menú de pizzas. No válido fines de semana.",
        imageUrl: "https://images.unsplash.com/photo-1724232865752-4af928d13989?w=600&q=80"
    },
    {
        id: "c11", brand: "Starbucks San Isidro", category: "cafe",
        x: 390, y: 170, lat: -12.0990, lng: -77.0449,
        title: "Bebida Venti a precio Grande", discount: "25%", originalPrice: 22, finalPrice: 16,
        distance: 1600, walking: 20, address: "Av. Conquistadores 785, San Isidro",
        stock: 50, totalStock: 80, expiresIn: "1d 5h", rating: 4.2, reviews: 631,
        description: "Válido para bebidas frías o calientes. Un cupón por persona.",
        imageUrl: "https://images.unsplash.com/photo-1716808681381-52cf8055b02d?w=600&q=80"
    },
    {
        id: "c12", brand: "La Canta Rana", category: "food",
        x: 350, y: 598, lat: -12.1494, lng: -77.0213,
        title: "Ceviche + chicharrón combo", discount: "25%", originalPrice: 52, finalPrice: 39,
        distance: 3100, walking: 38, address: "Génova 101, Barranco",
        stock: 10, totalStock: 20, expiresIn: "5h", rating: 4.7, reviews: 1120, featured: true,
        description: "Combo incluye ceviche mixto + chicharrón + chicha morada.",
        imageUrl: "https://images.unsplash.com/photo-1611262359546-64e2822b2ab5?w=600&q=80"
    },
    {
        id: "c13", brand: "Barranco Beer Company", category: "cafe",
        x: 400, y: 615, lat: -12.1465, lng: -77.0229,
        title: "2 cervezas artesanales S/28", discount: "20%", originalPrice: 35, finalPrice: 28,
        distance: 2900, walking: 36, address: "Av. Grau 308, Barranco",
        stock: 30, totalStock: 60, expiresIn: "8h", rating: 4.5, reviews: 278,
        description: "Incluye 2 pintas de temporada. De 17:00 a 22:00.",
        imageUrl: "https://images.unsplash.com/photo-1758165532022-a68f291317ba?w=600&q=80"
    },
    {
        id: "c14", brand: "El Huerto Surco", category: "food",
        x: 760, y: 280, lat: -12.0890, lng: -76.9770,
        title: "Bowl healthy 40% off", discount: "40%", originalPrice: 35, finalPrice: 21,
        distance: 4200, walking: 52, address: "Av. Monte de los Olivos 265, Surco",
        stock: 22, totalStock: 50, expiresIn: "6h 30m", rating: 4.6, reviews: 198,
        description: "Bowl de quinua, palta, pollo y aderezo de maracuyá.",
        imageUrl: "https://images.unsplash.com/photo-1761315414522-a732eb715497?w=600&q=80"
    },
    {
        id: "c15", brand: "Ripley Jockey Plaza", category: "shop",
        x: 800, y: 250, lat: -12.0872, lng: -76.9758,
        title: "20% en toda moda mujer", discount: "20%", originalPrice: 180, finalPrice: 144,
        distance: 4500, walking: 55, address: "Jockey Plaza, Av. Javier Prado Este 4200",
        stock: 200, totalStock: 300, expiresIn: "2d", rating: 4.3, reviews: 2150,
        description: "Aplica en ropa, calzado y accesorios para mujer. No en outlet.",
        imageUrl: "https://images.unsplash.com/photo-1759299983432-e0097fad9b15?w=600&q=80"
    },
    {
        id: "c16", brand: "Pronto La Molina", category: "cafe",
        x: 890, y: 195, lat: -12.0800, lng: -76.9433,
        title: "Café americano + sandwichazo", discount: "35%", originalPrice: 28, finalPrice: 18,
        distance: 7100, walking: 88, address: "Av. La Universidad 175, La Molina",
        stock: 25, totalStock: 40, expiresIn: "3h", rating: 4.4, reviews: 87,
        description: "Menú express disponible de 8:00 a 11:00.",
        imageUrl: "https://images.unsplash.com/photo-1737700088850-d0b53f9d39ec?w=600&q=80"
    },
    {
        id: "c17", brand: "FitLife La Molina", category: "services",
        x: 930, y: 230, lat: -12.0760, lng: -76.9400,
        title: "Membresía 1 mes −45%", discount: "45%", originalPrice: 180, finalPrice: 99,
        distance: 7400, walking: 92, address: "Av. Raúl Ferrero 1330, La Molina",
        stock: 8, totalStock: 20, expiresIn: "4d", rating: 4.7, reviews: 63,
        description: "Incluye acceso ilimitado a máquinas y clases grupales.",
        imageUrl: "https://images.unsplash.com/photo-1467818488384-3a21f2b79959?w=600&q=80"
    },
    {
        id: "c18", brand: "Don Belisario", category: "food",
        x: 320, y: 275, lat: -12.0821, lng: -77.0476,
        title: "Pollo a la brasa entero S/45", discount: "28%", originalPrice: 62, finalPrice: 45,
        distance: 4800, walking: 60, address: "Av. Brasil 650, Jesús María",
        stock: 35, totalStock: 60, expiresIn: "1d 2h", rating: 4.5, reviews: 746,
        description: "Incluye papas fritas, ensalada y salsa criolla.",
        imageUrl: "https://images.unsplash.com/photo-1688912739425-67191f6823f3?w=600&q=80"
    },
    {
        id: "c19", brand: "Metro San Borja", category: "shop",
        x: 740, y: 370, lat: -12.1080, lng: -77.0039,
        title: "S/20 OFF en compras +S/120", discount: "S/20", originalPrice: 120, finalPrice: 100,
        distance: 3200, walking: 40, address: "Av. Aviación 2999, San Borja",
        stock: 300, totalStock: 400, expiresIn: "3d", rating: 4.3, reviews: 3410,
        description: "Una vez por cliente. Válido en todas las secciones.",
        imageUrl: "https://images.unsplash.com/photo-1714224247661-ee250f55a842?w=600&q=80"
    },
    {
        id: "c20", brand: "InBody Lab", category: "health",
        x: 770, y: 345, lat: -12.1052, lng: -77.0021,
        title: "Análisis corporal + consulta", discount: "50%", originalPrice: 80, finalPrice: 40,
        distance: 3100, walking: 38, address: "Av. San Borja Norte 1220, San Borja",
        stock: 10, totalStock: 20, expiresIn: "1d", rating: 4.8, reviews: 45,
        description: "Incluye análisis InBody 570 + consulta nutricional de 30 min.",
        imageUrl: "https://images.unsplash.com/photo-1739289696449-cba3a5ef085d?w=600&q=80"
    },
    {
        id: "c21", brand: "La Tranquera Lince", category: "food",
        x: 595, y: 305, lat: -12.0820, lng: -77.0345,
        title: "Parrilla premium 2x1", discount: "50%", originalPrice: 98, finalPrice: 49,
        distance: 4300, walking: 53, address: "Av. Arequipa 2455, Lince",
        stock: 12, totalStock: 25, expiresIn: "7h", rating: 4.7, reviews: 521, featured: true,
        description: "Cortes importados. Válido de martes a jueves de 13:00 a 16:00.",
        imageUrl: "https://images.unsplash.com/photo-1688912739425-67191f6823f3?w=600&q=80"
    },
    {
        id: "c22", brand: "Isolina Taberna", category: "food",
        x: 655, y: 410, lat: -12.1183, lng: -77.0097,
        title: "Seco de res + chicha 30% off", discount: "30%", originalPrice: 45, finalPrice: 31,
        distance: 2200, walking: 27, address: "Av. San Martín 101, Barranco",
        stock: 18, totalStock: 35, expiresIn: "4h 30m", rating: 4.9, reviews: 680, featured: true,
        description: "Comida criolla de autor. Reserva recomendada.",
        imageUrl: "https://images.unsplash.com/photo-1611262359546-64e2822b2ab5?w=600&q=80"
    },
    {
        id: "c23", brand: "Mercado N°1 Surquillo", category: "shop",
        x: 620, y: 432, lat: -12.1177, lng: -77.0114,
        title: "Canasta de frutas S/25", discount: "37%", originalPrice: 40, finalPrice: 25,
        distance: 2100, walking: 26, address: "Jr. Narciso de la Colina 582, Surquillo",
        stock: 45, totalStock: 60, expiresIn: "2d", rating: 4.5, reviews: 210,
        description: "Canasta de 5 kg de frutas mixtas de temporada.",
        imageUrl: "https://images.unsplash.com/photo-1714224247661-ee250f55a842?w=600&q=80"
    },
    {
        id: "c24", brand: "La Costa Verde", category: "food",
        x: 295, y: 625, lat: -12.1558, lng: -77.0381,
        title: "Ceviche + vista al mar 25% off", discount: "25%", originalPrice: 68, finalPrice: 51,
        distance: 4800, walking: 60, address: "Circuito de Playas s/n, Barranco",
        stock: 16, totalStock: 30, expiresIn: "9h", rating: 4.6, reviews: 432,
        description: "Solo en horario de almuerzo. Vista panorámica al Pacífico.",
        imageUrl: "https://images.unsplash.com/photo-1611262359546-64e2822b2ab5?w=600&q=80"
    },
    {
        id: "c25", brand: "D'Luca Pizzería", category: "food",
        x: 295, y: 88, lat: -11.9880, lng: -77.0641,
        title: "Pizza familiar S/39", discount: "35%", originalPrice: 60, finalPrice: 39,
        distance: 14500, walking: 181, address: "Av. Universitaria 3845, Los Olivos",
        stock: 40, totalStock: 80, expiresIn: "1d 6h", rating: 4.4, reviews: 315,
        description: "Pizza de 12 pulgadas a elección. Delivery disponible.",
        imageUrl: "https://images.unsplash.com/photo-1724232865752-4af928d13989?w=600&q=80"
    },
    {
        id: "c26", brand: "Saga Falabella Mega Plaza", category: "shop",
        x: 330, y: 72, lat: -11.9945, lng: -77.0592,
        title: "15% en electrónica", discount: "15%", originalPrice: 500, finalPrice: 425,
        distance: 14200, walking: 177, address: "Mega Plaza, Av. Alfredo Mendiola, Independencia",
        stock: 80, totalStock: 150, expiresIn: "2d", rating: 4.2, reviews: 1820,
        description: "Aplica en smartphones, tablets y accesorios seleccionados.",
        imageUrl: "https://images.unsplash.com/photo-1759299983432-e0097fad9b15?w=600&q=80"
    },
    {
        id: "c27", brand: "El Mercado Hinostroza", category: "food",
        x: 500, y: 340, lat: -12.1265, lng: -77.0293,
        title: "Ceviche clásico + leche de tigre", discount: "20%", originalPrice: 50, finalPrice: 40,
        distance: 680, walking: 8, address: "Hipólito Unanue 203, Miraflores",
        stock: 20, totalStock: 40, expiresIn: "3h 15m", rating: 4.8, reviews: 960, featured: true,
        description: "El auténtico ceviche limeño. Solo en servicio de almuerzo.",
        imageUrl: "https://images.unsplash.com/photo-1611262359546-64e2822b2ab5?w=600&q=80"
    },
    {
        id: "c28", brand: "Fitness Point Miraflores", category: "services",
        x: 525, y: 405, lat: -12.1194, lng: -77.0310,
        title: "7 días de gimnasio gratis", discount: "100%", originalPrice: 45, finalPrice: 0,
        distance: 310, walking: 4, address: "Av. Reducto 1254, Miraflores",
        stock: 15, totalStock: 30, expiresIn: "1d 12h", rating: 4.5, reviews: 184,
        description: "Prueba gratis 7 días. Solo nuevos socios. Registro previo.",
        imageUrl: "https://images.unsplash.com/photo-1467818488384-3a21f2b79959?w=600&q=80"
    },
    {
        id: "c29", brand: "Gelatería Lima", category: "cafe",
        x: 545, y: 455, lat: -12.1242, lng: -77.0285,
        title: "2 bolas de gelato S/10", discount: "33%", originalPrice: 15, finalPrice: 10,
        distance: 450, walking: 6, address: "Calle Schell 130, Miraflores",
        stock: 60, totalStock: 100, expiresIn: "6h", rating: 4.6, reviews: 223,
        description: "Más de 20 sabores artesanales. Solo en local.",
        imageUrl: "https://images.unsplash.com/photo-1765478006783-2df9698dfef6?w=600&q=80"
    },
    {
        id: "c30", brand: "El Bolivariano", category: "food",
        x: 270, y: 295, lat: -12.0735, lng: -77.0604,
        title: "Anticucho + chicha S/22", discount: "27%", originalPrice: 30, finalPrice: 22,
        distance: 6200, walking: 77, address: "Pasaje Santa Rosa 291, Pueblo Libre",
        stock: 28, totalStock: 50, expiresIn: "5h", rating: 4.7, reviews: 890,
        description: "Tradición criolla desde 1967. Anticuchos al carbón.",
        imageUrl: "https://images.unsplash.com/photo-1688912739425-67191f6823f3?w=600&q=80"
    },
    {
        id: "c31", brand: "Real Plaza SJL", category: "shop",
        x: 950, y: 100, lat: -11.9818, lng: -76.9888,
        title: "S/30 OFF en compras +S/200", discount: "S/30", originalPrice: 200, finalPrice: 170,
        distance: 18000, walking: 225, address: "Av. Próceres de la Independencia 1700, SJL",
        stock: 100, totalStock: 200, expiresIn: "3d", rating: 4.1, reviews: 2890,
        description: "Válido en tiendas participantes del centro comercial.",
        imageUrl: "https://images.unsplash.com/photo-1759299983432-e0097fad9b15?w=600&q=80"
    },
    {
        id: "c32", brand: "Chifa Gran China", category: "food",
        x: 900, y: 320, lat: -12.0615, lng: -76.9390,
        title: "Wantán frito + sopa wantán", discount: "30%", originalPrice: 38, finalPrice: 27,
        distance: 11000, walking: 137, address: "Av. Nicolás Ayllón 3420, Ate",
        stock: 22, totalStock: 45, expiresIn: "4h", rating: 4.4, reviews: 178,
        description: "Chifa familiar con más de 25 años. Incluye té.",
        imageUrl: "https://images.unsplash.com/photo-1666278170520-f4fdd96292ea?w=600&q=80"
    },
    {
        id: "c33", brand: "Studio 78 Estética", category: "services",
        x: 608, y: 348, lat: -12.1200, lng: -77.0270,
        title: "Corte + lavado + secado S/39", discount: "35%", originalPrice: 60, finalPrice: 39,
        distance: 560, walking: 7, address: "Av. José Larco 785, Miraflores",
        stock: 9, totalStock: 15, expiresIn: "1d 3h", rating: 4.6, reviews: 312,
        description: "Para damas. Incluye corte, lavado, secado y styling.",
        imageUrl: "https://images.unsplash.com/photo-1711274094763-ff442e4719ef?w=600&q=80"
    },
    {
        id: "c34", brand: "Clínica Vesalio", category: "health",
        x: 680, y: 262, lat: -12.1160, lng: -77.0258,
        title: "Check-up básico 40% off", discount: "40%", originalPrice: 180, finalPrice: 108,
        distance: 1100, walking: 14, address: "Av. Los Conquistadores 1075, San Isidro",
        stock: 7, totalStock: 15, expiresIn: "2d", rating: 4.8, reviews: 67,
        description: "Incluye hemograma, glucosa, perfil lipídico y examen médico.",
        imageUrl: "https://images.unsplash.com/photo-1739289696449-cba3a5ef085d?w=600&q=80"
    },
    {
        id: "c35", brand: "Cinerama Larcomar", category: "services",
        x: 450, y: 556, lat: -12.1315, lng: -77.0315,
        title: "2 entradas + combo palomitas", discount: "25%", originalPrice: 56, finalPrice: 42,
        distance: 380, walking: 5, address: "Larcomar nivel -1, Miraflores",
        stock: 30, totalStock: 60, expiresIn: "1d 8h", rating: 4.4, reviews: 1430,
        description: "Válido para funciones de lunes a jueves. Excluye estrenos.",
        imageUrl: "https://images.unsplash.com/photo-1758165532022-a68f291317ba?w=600&q=80"
    },
];