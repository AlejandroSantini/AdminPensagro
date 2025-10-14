const API_BASE = import.meta.env.VITE_API_URL || '';
const SALES_BASE = `${API_BASE}api/sales`;

export const getSalesRoute = (): string => SALES_BASE;

export const getSaleByIdRoute = (id: number | string): string => `${SALES_BASE}/${id}`;

export const postSaleRoute = (): string => SALES_BASE;

export const putSaleRoute = (id: number | string): string => `${SALES_BASE}/${id}`;

export const deleteSaleRoute = (id: number | string): string => `${SALES_BASE}/${id}`;

export const exportSalesRoute = (): string => `${SALES_BASE}/export`;
