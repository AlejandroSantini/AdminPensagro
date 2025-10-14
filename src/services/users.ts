const API_BASE = import.meta.env.VITE_API_URL || '';
const USERS_BASE = `${API_BASE}api/users`;

export const registerUserRoute = (): string => `${USERS_BASE}/register`;

export const loginUserRoute = (): string => `${USERS_BASE}/login`;

export const getUsersRoute = (): string => USERS_BASE;

export const getUserByIdRoute = (id: number | string): string => `${USERS_BASE}/${id}`;

export const putUserRoute = (id: number | string): string => `${USERS_BASE}/${id}`;

export const deleteUserRoute = (id: number | string): string => `${USERS_BASE}/${id}`;
