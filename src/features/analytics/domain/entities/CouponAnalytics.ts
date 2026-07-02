/**
 * metricas de un cupon (con o sin campaña)
 */
export interface CouponAnalytics {
    couponId: string;
    viewsCount: number;
    reservationsCount: number;
    redemptionsCount: number;
    conversionRate: number;
}
