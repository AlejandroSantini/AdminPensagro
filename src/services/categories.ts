const API_BASE = import.meta.env.VITE_API_URL || '';
const CATEGORIES_BASE = `${API_BASE}/api/categories`;

export const getCategoriesRoute = (): string => CATEGORIES_BASE;

export const getCategoryByIdRoute = (id: number | string): string => `${CATEGORIES_BASE}/${id}`;

export const postCategoryRoute = (): string => CATEGORIES_BASE;

export const putCategoryRoute = (id: number | string): string => `${CATEGORIES_BASE}/${id}`;

export const deleteCategoryRoute = (id: number | string): string => `${CATEGORIES_BASE}/${id}`;

export const linkCategoryRoute = (): string => `${CATEGORIES_BASE}/link`;

export const unlinkCategoryRoute = (): string => `${CATEGORIES_BASE}/unlink`;

export const getCategoriesByProductRoute = (productId: number | string): string => `${CATEGORIES_BASE}/product/${productId}`;

// Subcategories helper (no explicit spec but still used in UI)
export const getSubcategoriesRoute = (): string => `${API_BASE}/api/subcategories`;