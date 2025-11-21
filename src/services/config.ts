const API_BASE = import.meta.env.VITE_API_URL || '';
const CONFIG_BASE = `${API_BASE}/api/config`;

export const getConfigRoute = (): string => CONFIG_BASE;

export const putConfigRoute = (): string => CONFIG_BASE;

export const getConfigTaxRoute = (): string => `${CONFIG_BASE}/tax`;

export const putConfigTaxRoute = (): string => `${CONFIG_BASE}/tax`;
