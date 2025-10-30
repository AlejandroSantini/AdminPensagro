export type ClientType = 'minorista' | 'mayorista';

export type ApiClientType = 'retailer' | 'wholesaler' | string;

export type ClientStatus = 'active' | 'inactive' | string;

export type CondicionIVA = 
  | 'Responsable Inscripto' 
  | 'Monotributo' 
  | 'IVA Excento' 
  | 'Consumidor Final';

export interface Client {
  id: number;
  userId?: number | string;
  name: string;
  lastName?: string;
  fullName?: string;
  email: string;
  type: ClientType | string;
  tipo?: ClientType | string; 
  clientType?: ApiClientType;
  razonSocial?: string | null;
  condicionIVA?: CondicionIVA | string | null;
  dni?: string | null;
  cuit?: string | null;
  domicilio?: string | null;
  phone?: string | null;
  // Campos legacy para compatibilidad
  fiscalType?: string | null;
  fiscalCondition?: string | null;
  companyName?: string | null;
  status: ClientStatus;
  createdAt?: string;
  updatedAt?: string;
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
