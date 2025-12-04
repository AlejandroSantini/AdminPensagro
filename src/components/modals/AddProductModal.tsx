import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Paper,
  CircularProgress
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Paginator } from '../common/Paginator';
import { OutlinedButton } from '../common/OutlinedButton';
import { Table } from '../common/Table';
import api from '../../services/api';
import { getProductsRoute } from '../../services/products';

export interface VariantItem {
  id: number | string;
  product_id: number | string;
  name: string;
  quantity: number;
  price_wholesale_usd: string | number;
  price_retail_usd: string | number;
  price_usd?: number;
  price_ars?: number;
}

export interface ProductItem {
  id: number;
  name: string;
  price?: number;
  price_usd?: number | string;
  sku?: string;
  stock?: number;
  variants?: VariantItem[];
}

export interface SelectedProductWithVariant {
  product: ProductItem;
  variant: VariantItem | null;
}

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onProductSelect: (selection: SelectedProductWithVariant) => void;
}

// Tipo para las filas "aplanadas" de la tabla
interface FlattenedRow {
  product: any;
  variant: VariantItem | null;
  displayName: string;
  displaySku: string;
  displayPrice: string;
  displayStock: number | string;
}

export const AddProductModal = ({ open, onClose, onProductSelect }: AddProductModalProps) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'active',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Aplanar productos y variantes en filas individuales
  const flattenedRows = useMemo((): FlattenedRow[] => {
    const rows: FlattenedRow[] = [];
    
    products.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        // Si tiene variantes, crear una fila por cada variante
        product.variants.forEach((variant: VariantItem) => {
          rows.push({
            product,
            variant,
            displayName: `${product.name} - ${variant.name}`,
            displaySku: product.sku,
            displayPrice: `$${variant.price_retail_usd}`,
            displayStock: variant.quantity
          });
        });
      } else {
        // Si no tiene variantes, mostrar el producto solo
        rows.push({
          product,
          variant: null,
          displayName: product.name,
          displaySku: product.sku,
          displayPrice: `$${product.price_usd || '0'}`,
          displayStock: product.stock
        });
      }
    });
    
    return rows;
  }, [products]);

  const loadProducts = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const res = await api.get(getProductsRoute(), { params: { ...filters, page: pageNum, per_page: 10 } });
      setProducts(res.data.data || []);
      
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalItems(res.data.meta.totalItems || 0);
      }
    } catch (e) {
      console.error('Error loading products:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    loadProducts(newPage);
  };

  const handleFilterInputChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleFilterApply = () => {
    setPage(1);
    loadProducts(1);
  };

  const handleRowClick = (row: FlattenedRow) => {
    const productItem: ProductItem = {
      id: parseInt(row.product.id),
      name: row.product.name,
      sku: row.product.sku,
      stock: row.product.stock,
      price_usd: row.product.price_usd,
      variants: row.product.variants || []
    };

    onProductSelect({ product: productItem, variant: row.variant });
    onClose();
  };

  useEffect(() => {
    if (open) {
      setPage(1);
      loadProducts(1);
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
                onChange={(e) => handleFilterInputChange('search', e.target.value)}
                onBlur={handleFilterApply}
                placeholder="Nombre, SKU..."
                sx={{ mt: 0, mb: 0 }}
              />
              <Select
                label="Estado"
                value={filters.status}
                onChange={(e) => {
                  handleFilterInputChange('status', e.target.value as string);
                  handleFilterApply();
                }}
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
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <Table
              columns={[
                { label: 'SKU', render: (row: FlattenedRow) => row.displaySku, width: '120px' },
                { label: 'Nombre', render: (row: FlattenedRow) => row.displayName },
                { label: 'Precio', render: (row: FlattenedRow) => row.displayPrice, width: '100px' },
                { label: 'Stock', render: (row: FlattenedRow) => row.displayStock, width: '80px', align: 'center' }
              ]}
              data={flattenedRows}
              getRowKey={(row: FlattenedRow) => row.variant ? `${row.product.id}-${row.variant.id}` : row.product.id}
              onRowClick={handleRowClick}
              emptyMessage="No hay productos"
              sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}
            />
          )}
          <Paginator
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
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