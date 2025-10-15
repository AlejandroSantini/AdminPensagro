export type ClientType = 'minorista' | 'mayorista';

export type ApiClientType = 'retailer' | 'wholesaler' | string;

export type ClientStatus = 'active' | 'inactive' | string;

export interface Client {
  id: number;
  userId?: number | string;
  name: string;
  email: string;
  type: ClientType | string;
  tipo?: ClientType | string; 
  clientType?: ApiClientType;
  fiscalType?: string | null;
  fiscalCondition?: string | null;
  status: ClientStatus;
  createdAt?: string;
  updatedAt?: string;
  phone?: string | null;
  companyName?: string | null;
}

export type ClientFormValues = Client;

export interface ClientPurchase {
  id: number;
  saleId: number;
  date: string;
  product: string;
  quantity: number;
  total: number;
  status: string;
}
