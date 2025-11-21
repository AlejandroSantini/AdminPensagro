const API_BASE = import.meta.env.VITE_API_URL || '';
const PAYMENTS_BASE = `${API_BASE}/api/payments`;

export const paymentsMpWebhookRoute = (): string => `${PAYMENTS_BASE}/mp/webhook`;

export const paymentsGetnetWebhookRoute = (): string => `${PAYMENTS_BASE}/getnet/webhook`;

export const postManualPaymentRoute = (): string => `${PAYMENTS_BASE}/manual`;

export const getPaymentsBySaleRoute = (saleId: number | string): string => `${PAYMENTS_BASE}/${saleId}`;
