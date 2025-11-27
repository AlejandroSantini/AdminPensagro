const API_BASE = import.meta.env.VITE_API_URL || '';
const CLIENTS_BASE = `${API_BASE}/api/clients`;

export const getClientsRoute = (): string => CLIENTS_BASE;

export const getClientByIdRoute = (id: number | string): string => `${CLIENTS_BASE}/${id}`;

export const putClientRoute = (id: number | string): string => `${CLIENTS_BASE}/${id}`;

export const postClientRoute = (): string => `${CLIENTS_BASE}`;

export const searchClientsRoute = (): string => `${CLIENTS_BASE}/search`;
