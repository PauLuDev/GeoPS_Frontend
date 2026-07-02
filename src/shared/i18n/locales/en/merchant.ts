export const merchant = {
    merchant: {
        navDashboard: "Overview",
        navCampaigns: "Campaigns",
        navNewCampaign: "New campaign",
        navRedeem: "Redeem coupon",
        navMyBusiness: "My business",
        navEstablishments: "Establishments",
        navCoupons: "Coupons",
        navSubscription: "Subscription",
        navAccount: "My account",
        customerView: "Customer view",
        signOut: "Sign out",
        guest: "Guest",
    },
    account: {
        title: "My account",
        owner: "Business owner",
        coversAll_one: "Your plan covers your {{count}} establishment",
        coversAll_other: "Your plan covers your {{count}} establishments",
        planSection: "Your plan",
        coversAll: "Your plan covers your registered spot",
    },
    dashboard: {
        range: {
            today: "Today",
            "7d": "Last 7 days",
            "30d": "Last 30 days"
        },
        kpi: {
            views: "Views",
            redeemed: "Redeemed",
            reserved: "Reserved",
            conversion: "Conversion"
        },
        period: {
            historic: "Historic"
        },
        funnel: {
            views: "Coupon views",
            reserved: "Reservations",
            redeemed: "Redemptions",
            title: "Funnel",
            mapToStore: "From map to store"
        },
        eyebrow: "My business · {{name}}",
        yourBusiness: "your business",
        greetingWithName: "Hello, {{name}}!",
        greeting: "Hello!",
        subtitle: "Here are the key metrics for your business.",
        export: "Export",
        exportPdf: "Export PDF",
        exportExcel: "Export Excel",
        exportCsv: "Export CSV",
        newCampaign: "New campaign",
        establishment: "Establishment",
        mode: {
            summary: "Summary",
            campaigns: "By campaign"
        },
        campaign: "Campaign",
        noEstablishment: "Select a business to view metrics.",
        loading: "Loading metrics…",
        noCampaignMetrics: "No metrics available for this campaign.",
        campaignHint: "This view shows the detailed performance of all coupons in this campaign.",
        error: "Error loading metrics: {{message}}",
        noMetrics: "No metrics available.",
        performance: "Performance",
        performanceSubtitle: "When your coupons are redeemed",
        legend: {
            reserved: "Reserved",
            redeemed: "Redeemed"
        },
        peak: "Peak: {{hour}}",
        topCampaigns: "Top campaigns",
        yourCampaigns: "Your campaigns",
        seeAll: "See all",
        noCampaigns: "You don't have any campaigns in this business yet.",
        miniMetrics: "{{views}} views · {{reserved}} reserved · {{redeemed}} redeemed · {{rate}}% conv.",
        standaloneCoupons: "Coupons without campaign",
        yourStandaloneCoupons: "Your standalone coupons",
        noStandaloneCoupons: "You don't have any standalone coupons in this business yet."
    }
} as const;
