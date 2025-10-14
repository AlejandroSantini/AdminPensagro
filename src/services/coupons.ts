const API_BASE = import.meta.env.VITE_API_URL || '';
const COUPONS_BASE = `${API_BASE}api/coupons`;

export const getCouponsRoute = (): string => COUPONS_BASE;

export const getCouponByIdRoute = (id: number | string): string => `${COUPONS_BASE}/${id}`;

export const postCouponRoute = (): string => COUPONS_BASE;

export const putCouponRoute = (id: number | string): string => `${COUPONS_BASE}/${id}`;

export const deleteCouponRoute = (id: number | string): string => `${COUPONS_BASE}/${id}`;

export const validateCouponRoute = (): string => `${COUPONS_BASE}/validate`;
