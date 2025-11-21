const API_BASE = import.meta.env.VITE_API_URL || '';
const POPUPS_BASE = `${API_BASE}/api/popup`;

export const getPopupsRoute = (): string => `${POPUPS_BASE}s`;

export const postPopupRoute = (): string => `${POPUPS_BASE}/upload`;

export const putPopupRoute = (id: number | string): string => `${POPUPS_BASE}/upload/${id}`;

export const deletePopupRoute = (id: number | string): string => `${POPUPS_BASE}/${id}`;

export default {} as const;
