import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Tooltip, 
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Input } from '../../../../components/common/Input';
import { Select } from '../../../../components/common/Select';
import type { SelectOption } from '../../../../components/common/Select';
import { Table } from '../../../../components/common/Table';
import type { Product, CategoryRef } from '../../../../../types/product';
import api from '../../../../services/api';
import { deleteProductRoute, getProductsRoute } from '../../../../services/products';
import { ContainedButton } from '../../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../../components/common/OutlinedButton';
import { ConfirmDialog } from '../../../../components/common/ConfirmDialog';

export default function ProductTab() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    status: 'active',
    stock: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(getProductsRoute(), { params: filters });
      setProducts(res.data.data || []);
    } catch (e) {
      console.error('Error al cargar productos:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
    setOpenDelete(true);
  };

  const closeDelete = () => {
    setOpenDelete(false);
    setDeletingProduct(null);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await api.delete(deleteProductRoute(deletingProduct.id));
      closeDelete();
      loadProducts();
    } catch (e) {
      // Opcional: mostrar error
    }
  };
  
  const handleFilterInputChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleFilterApply = () => {
    loadProducts();
  };

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const goToNewProduct = () => {
    navigate('/productos/nuevo');
  };

  const goToEditProduct = (product: Product) => {
    navigate(`/productos/${product.id}`);
  };

  return (
    <Box>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <OutlinedButton 
          icon={<FilterListIcon />} 
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </OutlinedButton>
        <ContainedButton startIcon={<AddIcon />} onClick={goToNewProduct}>Nuevo producto</ContainedButton>
      </Box>
      
      {showFilters && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
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
                handleFilterApply(); // Apply immediately for select fields
              }}
              options={[
                { value: '', label: 'Todos' },
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' }
              ]}
              sx={{ mt: 0, mb: 0 }}
            />
            <Input
              label="Stock mínimo"
              variant="outlined"
              type="number"
              value={filters.stock}
              onChange={(e) => handleFilterInputChange('stock', e.target.value)}
              onBlur={handleFilterApply}
              sx={{ mt: 0, mb: 0 }}
            />
          </Box>
        </Paper>
      )}
      
      <Table
        columns={[
          { label: 'SKU', render: (p: Product) => p.sku },
          { label: 'Nombre', render: (p: Product) => p.name },
          { 
            label: 'Variantes', 
            render: (p: Product) => {
              if (!p.variants || p.variants.length === 0) {
                return p.price_usd ? `$${p.price_usd}` : '-';
              }
              return `${p.variants.length} variante${p.variants.length > 1 ? 's' : ''}`;
            }
          },
          { label: 'Stock', render: (p: Product) => p.stock },
          { label: 'IVA', render: (p: Product) => `${p.iva}%` },
          { label: 'Destacado', render: (p: Product) => (p.featured ? 'Sí' : 'No') },
          { label: 'Categoría', render: (p: Product) => p.categories.map((c: CategoryRef) => c.name).join(', ') },
          { label: 'Subcategoría', render: (p: Product) => p.subcategories.map((sc: CategoryRef) => sc.name).join(', ') },
          {
            label: 'Acciones',
            render: (p: Product) => (
              <>
                <Tooltip title="Eliminar">
                  <IconButton 
                    color="error" 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ),
            align: 'center',
          },
        ]}
        data={products}
        getRowKey={(p: Product) => p.id}
        onRowClick={goToEditProduct}
        emptyMessage="No hay productos"
      />

      <ConfirmDialog
        open={openDelete}
        title="¿Eliminar producto?"
        description={deletingProduct?.name}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </Box>
  );
}
