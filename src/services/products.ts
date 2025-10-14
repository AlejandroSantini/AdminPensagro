const API_BASE = import.meta.env.VITE_API_URL || '';

export function getProductsRoute(): string {
  return `${API_BASE}api/products`;
}

export function postProductRoute(): string {
  return `${API_BASE}api/products`;
}

export function putProductRoute(id: number | string): string {
  return `${API_BASE}api/products/${id}`;
}
