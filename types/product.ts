export interface CategoryRef {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price_usd: number;
  stock: number;
  iva: number;
  featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  categories: CategoryRef[];
  subcategories: CategoryRef[];
}

export interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  price_usd: number;
  stock: number;
  iva: number;
  featured: boolean;
  categoryId: number;
  subcategoryId: number;
}
