export const merchant = {
    merchant: {
        navDashboard: "Resumen",
        navCampaigns: "Campañas",
        navNewCampaign: "Nueva campaña",
        navRedeem: "Canjear cupón",
        navMyBusiness: "Mi negocio",
        navEstablishments: "Establecimientos",
        navCoupons: "Cupones",
        navSubscription: "Suscripción",
        navAccount: "Mi cuenta",
        customerView: "Vista cliente",
        signOut: "Cerrar sesión",
        guest: "Invitado",
    },
    account: {
        title: "Mi cuenta",
        owner: "Dueño del negocio",
        coversAll_one: "Tu plan cubre tu {{count}} establecimiento",
        coversAll_other: "Tu plan cubre tus {{count}} establecimientos",
        planSection: "Tu plan",
        coversAll: "Tu plan cubre tu local registrado",
    },
    dashboard: {
        range: {
            today: "Hoy",
            "7d": "Últimos 7 días",
            "30d": "Últimos 30 días"
        },
        kpi: {
            views: "Vistas",
            redeemed: "Canjeados",
            reserved: "Reservados",
            conversion: "Conversión"
        },
        period: {
            historic: "Histórico"
        },
        funnel: {
            views: "Vistas del cupón",
            reserved: "Reservas",
            redeemed: "Canjes",
            title: "Funnel",
            mapToStore: "Del mapa al local"
        },
        eyebrow: "Mi negocio · {{name}}",
        yourBusiness: "tu establecimiento",
        greetingWithName: "¡Hola, {{name}}!",
        greeting: "¡Hola!",
        subtitle: "Aquí tienes las estadísticas clave de tu establecimiento.",
        export: "Exportar",
        exportPdf: "Exportar PDF",
        exportExcel: "Exportar Excel",
        exportCsv: "Exportar CSV",
        newCampaign: "Nueva campaña",
        establishment: "Establecimiento",
        mode: {
            summary: "Resumen",
            campaigns: "Por campaña"
        },
        campaign: "Campaña",
        noEstablishment: "Selecciona un establecimiento para ver las métricas.",
        loading: "Cargando métricas…",
        noCampaignMetrics: "Aún no hay métricas para esta campaña.",
        campaignHint: "Esta vista muestra el rendimiento detallado de todos los cupones que componen esta campaña.",
        error: "Error al cargar métricas: {{message}}",
        noMetrics: "No hay métricas disponibles.",
        performance: "Rendimiento",
        performanceSubtitle: "Cuándo se redimen tus cupones",
        legend: {
            reserved: "Reservados",
            redeemed: "Redimidos"
        },
        peak: "Pico: {{hour}}",
        topCampaigns: "Top campañas",
        yourCampaigns: "Tus campañas",
        seeAll: "Ver todas",
        noCampaigns: "Aún no tienes campañas en este establecimiento.",
        miniMetrics: "{{views}} vistos · {{reserved}} reservados · {{redeemed}} redimidos · {{rate}}% conv.",
        standaloneCoupons: "Cupones sin campaña",
        yourStandaloneCoupons: "Tus cupones independientes",
        noStandaloneCoupons: "Aún no tienes cupones sin campaña en este establecimiento."
    }
} as const;
