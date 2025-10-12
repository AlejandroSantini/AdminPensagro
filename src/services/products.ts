import type { Product } from '../types';

const MOCK: Product[] = [
  {
    id: 1,
    sku: 'SKU001',
    name: 'Product 1',
    description: 'First product',
    price_usd: 10.00,
    stock: 100,
    iva: 21.00,
    featured: true,
    status: 'active',
    created_at: '2025-10-10T12:00:00Z',
    updated_at: '2025-10-10T12:00:00Z',
  },
  {
    id: 2,
    sku: 'SKU002',
    name: 'Product 2',
    description: 'Second product',
    price_usd: 20.00,
    stock: 0,
    iva: 21.00,
    featured: false,
    status: 'archived',
    created_at: '2025-10-09T12:00:00Z',
    updated_at: '2025-10-09T12:00:00Z',
  },
];

export async function getProducts(): Promise<Product[]> {
  return Promise.resolve(MOCK);
}
