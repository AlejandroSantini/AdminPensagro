// Mapa de traducción para tipos de cliente
export const clientTypeTranslations: Record<string, string> = {
  // API -> UI
  'retailer': 'minorista',
  'wholesaler': 'mayorista',
  // UI -> API
  'minorista': 'retailer',
  'mayorista': 'wholesaler',
};

// Mapa de traducción para estados
export const statusTranslations: Record<string, string> = {
  // API -> UI
  'active': 'activo',
  'inactive': 'inactivo',
  'pending': 'pendiente',
  'completed': 'completado',
  'cancelled': 'cancelado',
  'processing': 'procesando',
  'shipped': 'enviado',
  'delivered': 'entregado',
  'refunded': 'reembolsado',
  // UI -> API
  'activo': 'active',
  'inactivo': 'inactive',
  'pendiente': 'pending',
  'completado': 'completed',
  'cancelado': 'cancelled',
  'procesando': 'processing',
  'enviado': 'shipped',
  'entregado': 'delivered',
  'reembolsado': 'refunded',
};

// Función para traducir del inglés al español
export function translateToSpanish(value: string, type: 'clientType' | 'status'): string {
  const map = type === 'clientType' ? clientTypeTranslations : statusTranslations;
  return map[value.toLowerCase()] || value;
}

// Función para traducir del español al inglés
export function translateToEnglish(value: string, type: 'clientType' | 'status'): string {
  const map = type === 'clientType' ? clientTypeTranslations : statusTranslations;
  return map[value.toLowerCase()] || value;
}