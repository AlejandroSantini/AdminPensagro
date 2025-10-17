import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Paper
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Table } from '../common/Table';
import { OutlinedButton } from '../common/OutlinedButton';
import api from '../../services/api';
import { getProductsRoute } from '../../services/products';

export interface ProductItem {
  id: number;
  name: string;
  price?: number;
  price_usd?: number | string;
  sku?: string;
  stock?: number;
}

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onProductSelect: (product: ProductItem) => void;
}

export const AddProductModal = ({ open, onClose, onProductSelect }: AddProductModalProps) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'active',
    search: ''
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(getProductsRoute(), { params: filters });
      setProducts(res.data.data || []);
    } catch (e) {
      console.error('Error loading products:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectProduct = (product: any) => {
    const productToAdd: ProductItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price_usd || 0),
      sku: product.sku,
      stock: product.stock
    };
    
    onProductSelect(productToAdd);
  };

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open, loadProducts]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Seleccionar un producto</DialogTitle>
      <DialogContent>
        <Box mb={2} mt={1} display="flex" justifyContent="space-between" alignItems="center">
          <OutlinedButton
            icon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            size="small"
          >
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </OutlinedButton>
        </Box>

        {showFilters && (
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Input
                label="Buscar producto"
                variant="outlined"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Nombre, SKU..."
                sx={{ mt: 0, mb: 0 }}
              />
              <Select
                label="Estado"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value as string)}
                options={[
                  { value: '', label: 'Todos' },
                  { value: 'active', label: 'Activo' },
                  { value: 'inactive', label: 'Inactivo' }
                ]}
                sx={{ mt: 0, mb: 0 }}
              />
            </Box>
          </Paper>
        )}

        <Box sx={{ mt: 2 }}>
          <Table
            sx={{ boxShadow: 'none' }}
            columns={[
              { label: 'SKU', render: (p: any) => p.sku },
              { label: 'Nombre', render: (p: any) => p.name },
              { label: 'Precio', render: (p: any) => `$${p.price_usd}` },
              { label: 'Stock', render: (p: any) => p.stock },
            ]}
            data={products}
            getRowKey={(p: any) => p.id}
            emptyMessage={loading ? "Cargando..." : "No hay productos"}
            onRowClick={handleSelectProduct}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <OutlinedButton onClick={onClose}>
          Cancelar
        </OutlinedButton>
      </DialogActions>
    </Dialog>
  );
};