const API_BASE = import.meta.env.VITE_API_URL || '';
const COMBOS_BASE = `${API_BASE}api/combos`;

export const getCombosRoute = (): string => COMBOS_BASE;

export const getComboByIdRoute = (id: number | string): string => `${COMBOS_BASE}/${id}`;

export const postComboRoute = (): string => COMBOS_BASE;

export const putComboRoute = (id: number | string): string => `${COMBOS_BASE}/${id}`;

export const deleteComboRoute = (id: number | string): string => `${COMBOS_BASE}/${id}`;
