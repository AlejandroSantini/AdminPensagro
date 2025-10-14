const API_BASE = import.meta.env.VITE_API_URL || '';
const SHIPPING_BASE = `${API_BASE}api/shipping`;

export const getShippingProvidersRoute = (): string => `${SHIPPING_BASE}/providers`;

export const putShippingProviderRoute = (id: number | string): string => `${SHIPPING_BASE}/providers/${id}`;

export const postShippingEstimateRoute = (): string => `${SHIPPING_BASE}/estimate`;

export const postShippingLabelRoute = (saleId: number | string): string => `${SHIPPING_BASE}/label/${saleId}`;
