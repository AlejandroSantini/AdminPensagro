import { type JSX } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Table } from './Table';
import { Input } from './Input';
import { ContainedButton } from './ContainedButton';

export interface ProductWithQuantity {
  id: number;
  name: string;
  price?: number;
  quantity?: number;
  sku?: string;
}

interface ProductsTableProps {
  products: ProductWithQuantity[];
  onAddProduct: () => void;
  onRemoveProduct: (productId: number) => void;
  onUpdateQuantity?: (productId: number, quantity: number) => void;
  allowQuantityEdit?: boolean;
  showTotal?: boolean;
  emptyMessage?: string;
  title?: string;
  errors?: string;
}

export const ProductsTable = ({
  products,
  onAddProduct,
  onRemoveProduct,
  onUpdateQuantity,
  allowQuantityEdit = false,
  showTotal = false,
  emptyMessage = "No hay productos seleccionados",
  title = "Productos seleccionados",
  errors
}: ProductsTableProps) => {
  
  const calculateTotal = () => {
    return products.reduce((sum, product) => {
      const quantity = product.quantity || 1;
      return sum + ((product.price || 0) * quantity);
    }, 0);
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
                  sx={{ width: 70, '& .MuiInputBase-input': { py: 0.5, px: 1 } }}
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
        render: (p: ProductWithQuantity) => `$${p.price || 0}`,
        width: '100px',
        align: 'right'
      },
      { 
        label: 'Subtotal', 
        render: (p: ProductWithQuantity) => `$${((p.price || 0) * (p.quantity || 1)).toFixed(2)}`,
        width: '120px',
        align: 'right'
      },
      {
        label: 'Acciones',
        render: (p: ProductWithQuantity) => (
          <Tooltip title="Eliminar">
            <IconButton 
              color="error" 
              size="small" 
              onClick={() => onRemoveProduct(p.id)}
            >
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