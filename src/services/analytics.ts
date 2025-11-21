const API_BASE = import.meta.env.VITE_API_URL || '';
const ANALYTICS_BASE = `${API_BASE}/api/analytics`;

export const getAnalyticsSalesRoute = (): string => `${ANALYTICS_BASE}/sales`;

export const getAnalyticsCustomersRoute = (): string => `${ANALYTICS_BASE}/customers`;

export const getAnalyticsStockRoute = (): string => `${ANALYTICS_BASE}/stock`;

export const getAnalyticsProductsRoute = (): string => `${ANALYTICS_BASE}/products`;

export const exportAnalyticsRoute = (): string => `${ANALYTICS_BASE}/export`;
