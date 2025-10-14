const API_BASE = import.meta.env.VITE_API_URL || '';

export function getCategoriesRoute(): string {
  return `${API_BASE}api/categories`;
}

export function getSubcategoriesRoute(): string {
  return `${API_BASE}api/subcategories`;
}