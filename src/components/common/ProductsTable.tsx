import { type JSX } from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Table } from './Table';
import { Input } from './Input';
import { Select } from './Select';
import { ContainedButton } from './ContainedButton';

export interface ProductWithQuantity {
  id: number;
  name: string;
  price?: number;
  quantity?: number;
  sku?: string;
  variants?: Array<{
    id: number | string;
    name: string;
    price_wholesale_usd: number | string;
    price_retail_usd: number | string;
    quantity: number | string;
  }>;
  selectedVariantId?: number | string | null;
}

interface ProductsTableProps {
  products: ProductWithQuantity[];
  onAddProduct: () => void;
  onRemoveProduct: (productId: number) => void;
  onUpdateQuantity?: (productId: number, quantity: number) => void;
  onUpdateVariant?: (productId: number, variantId: number | string | null) => void;
  allowQuantityEdit?: boolean;
  showTotal?: boolean;
  emptyMessage?: string;
  title?: string;
  errors?: string;
  getRowSx?: (product: ProductWithQuantity) => object;
}

export const ProductsTable = ({
  products,
  onAddProduct,
  onRemoveProduct,
  onUpdateQuantity,
  onUpdateVariant,
  allowQuantityEdit = false,
  showTotal = false,
  emptyMessage = "No hay productos seleccionados",
  title = "Productos seleccionados",
  errors,
  getRowSx
}: ProductsTableProps) => {
  
  const calculateTotal = () => {
    return products.reduce((sum, product) => {
      const quantity = product.quantity || 1;
      const price = getProductPrice(product);
      return sum + (price * quantity);
    }, 0);
  };

  const getProductPrice = (product: ProductWithQuantity): number => {
    if (product.selectedVariantId && product.variants) {
      const variant = product.variants.find(v => v.id == product.selectedVariantId); // usar == para comparar string y number
      if (variant) {
        return typeof variant.price_retail_usd === 'string' 
          ? parseFloat(variant.price_retail_usd) 
          : variant.price_retail_usd;
      }
    }
    return product.price || 0;
  };

  const getColumns = () => {
    const columns: {
      label: string;
      render: (p: ProductWithQuantity) => string | JSX.Element;
      align?: 'left' | 'right' | 'center';
      width?: string;
    }[] = [
      { 
        label: 'SKU', 
        render: (p: ProductWithQuantity) => p.sku || '-',
        width: '120px'
      },
      { 
        label: 'Nombre', 
        render: (p: ProductWithQuantity) => p.name 
      },
      { 
        label: 'Variante', 
        render: (p: ProductWithQuantity) => {
          console.log('📦 7. Renderizando fila en ProductsTable para:', p.name, '| Objeto completo:', p);
          
          if (!p.variants || p.variants.length === 0) {
            return <Typography variant="body2" color="text.secondary">Sin variantes</Typography>;
          }
          
          if (onUpdateVariant) {
            return (
              <Select 
                label=""
                value={String(p.selectedVariantId || '')}
                onChange={(e) => onUpdateVariant(p.id, e.target.value ? String(e.target.value) : null)}
                options={[
                  { value: '', label: 'Producto base' },
                  ...p.variants.map(v => ({
                    value: String(v.id),
                    label: `${v.name} - $${v.price_retail_usd}`
                  }))
                ]}
              />
            );
          }
          
          if (p.selectedVariantId) {
            const variant = p.variants.find(v => v.id == p.selectedVariantId); // usar == para comparar string y number
            return variant ? variant.name : 'Producto base';
          }
          
          return 'Producto base';
        },
        width: '200px'
      },
      { 
        label: 'Cantidad', 
        render: (p: ProductWithQuantity) => {
          if (allowQuantityEdit && onUpdateQuantity) {
            return (
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <Input 
                  type="number" 
                  label=""
                  value={p.quantity || 1} 
                  onChange={(e) => onUpdateQuantity(p.id, parseInt(e.target.value) || 1)}
                  variant="outlined" 
                  inputProps={{ min: 1 }}
                />
              </Box>
            );
          }
          return String(p.quantity || 1);
        },
        width: '100px',
        align: 'center'
      },
      { 
        label: 'Precio', 
        render: (p: ProductWithQuantity) => `$${getProductPrice(p)}`,
        width: '100px',
        align: 'right'
      },
      {
        label: 'Acciones',
        render: (p: ProductWithQuantity) => (
          <Tooltip title="Eliminar">
            <IconButton size="small" onClick={(e: any) => { e.stopPropagation(); onRemoveProduct(p.id); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
        align: 'center',
        width: '80px'
      }
    ];
    
    return columns;
  };

  return (
    <Box>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" fontWeight={500}>{title}</Typography>
        <ContainedButton startIcon={<AddIcon />} onClick={onAddProduct} size="small">
          Añadir un producto
        </ContainedButton>
      </Box>
      
      <Table
        columns={getColumns()}
        data={products}
        getRowKey={(p: ProductWithQuantity) => p.id}
        emptyMessage={emptyMessage}
        sx={{ boxShadow: 'none' }}
        getRowSx={getRowSx}
      />
      
      {showTotal && products.length > 0 && (
        <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', textAlign: 'right' }}>
          Total calculado: ${calculateTotal().toFixed(2)}
        </Typography>
      )}
      
      {errors && (
        <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
          {errors}
        </Typography>
      )}
    </Box>
  );
};