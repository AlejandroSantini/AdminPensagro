export interface ProductRef {
  id: number;
  name: string;
  price?: number;
  quantity?: number;
}

export interface ApiCombo {
  id: string;
  name: string;
  description: string;
  products: ProductRef[];
  total_price: string;
  featured: boolean;
  active: boolean;
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
}

export interface ComboFormData {
  id?: number;
  name: string;
  description: string;
  products: number[];
  price: string;
  featured: boolean;
}