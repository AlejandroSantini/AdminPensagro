export interface ProductRef {
  id: number;
  name: string;
  price?: number;
  quantity?: number;
  variantId?: number;
  variantName?: string;
}

export interface ApiCombo {
  id: string;
  name: string;
  description: string;
  products: ProductRef[];
  total_price: string;
  featured: boolean;
  active: boolean;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface Combo {
  id: number;
  name: string;
  description: string;
  products: ProductRef[];
  price: number;
  featured: boolean;
  status: 'active' | 'archived';
  image?: string;
}

export interface ComboFormData {
  id?: number;
  name: string;
  description: string;
  products: number[];
  price: string;
  featured: boolean;
  image?: string;
}