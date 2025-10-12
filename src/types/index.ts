export interface User {
  id: number;
  name: string;
  email: string;
  tipo: 'minorista' | 'mayorista';
  fiscalType?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price_usd: number;
  stock: number;
  iva: number;
  featured: boolean;
  status: 'active' | 'archived';
  created_at: string; 
  updated_at: string;
}

export interface TableRow {
  [key: string]: unknown;
}

export interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

export interface StatsData {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}