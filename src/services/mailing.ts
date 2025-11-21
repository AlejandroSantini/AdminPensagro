const API_BASE = import.meta.env.VITE_API_URL || '';
const MAILING_BASE = `${API_BASE}/api/mailing`;

export const postMailingOrderConfirmationRoute = (): string => `${MAILING_BASE}/order-confirmation`;

export const postMailingCouponRoute = (): string => `${MAILING_BASE}/coupon`;

export const postMailingRecoverPasswordRoute = (): string => `${MAILING_BASE}/recover-password`;

export const getMailingTemplatesRoute = (): string => `${MAILING_BASE}/templates`;
