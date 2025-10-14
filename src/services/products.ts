const API_BASE = import.meta.env.VITE_API_URL || '';
const PRODUCTS_BASE = `${API_BASE}api/products`;

export const getProductsRoute = (): string => PRODUCTS_BASE;

export const postProductRoute = (): string => PRODUCTS_BASE;

export const getProductByIdRoute = (id: number | string): string => `${PRODUCTS_BASE}/${id}`;

export const putProductRoute = (id: number | string): string => `${PRODUCTS_BASE}/${id}`;

export const deleteProductRoute = (id: number | string): string => `${PRODUCTS_BASE}/${id}`;

export const bulkProductsRoute = (): string => `${PRODUCTS_BASE}/bulk`;

export const searchProductsRoute = (query?: string): string => {
  if (!query) return `${PRODUCTS_BASE}/search`;
  const encoded = encodeURIComponent(query);
  return `${PRODUCTS_BASE}/search?q=${encoded}`;
};

export const updateProductStockRoute = (id: number | string): string => `${PRODUCTS_BASE}/${id}/stock`;
