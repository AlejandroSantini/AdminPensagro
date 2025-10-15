import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Table } from '../../../../components/common/Table';
import type { Product, CategoryRef } from '../../../../../types/product';
import api from '../../../../services/api';
import { getProductsRoute, deleteProductRoute } from '../../../../services/products';
import { ContainedButton } from '../../../../components/common/ContainedButton';
import { ConfirmDialog } from '../../../../components/common/ConfirmDialog';

export default function ProductTab() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [openDelete, setOpenDelete] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await api.get(getProductsRoute());
      setProducts(res.data.data || []);
    } catch (e) {
      setProducts([]);
    }
  };

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

  useEffect(() => {
    loadProducts();
  }, []);

  const goToNewProduct = () => {
    navigate('/productos/nuevo');
  };

  const goToEditProduct = (product: Product) => {
    navigate(`/productos/${product.id}`);
  };

  return (
    <Box>
      <Box mb={2} display="flex" justifyContent="right" alignItems="center">
        <ContainedButton startIcon={<AddIcon />} onClick={goToNewProduct}>Nuevo producto</ContainedButton>
      </Box>
      <Table
        columns={[
          { label: 'SKU', render: (p: Product) => p.sku },
          { label: 'Nombre', render: (p: Product) => p.name },
          { label: 'Precio', render: (p: Product) => p.price_usd },
          { label: 'Stock', render: (p: Product) => p.stock },
          { label: 'IVA', render: (p: Product) => p.iva },
          { label: 'Destacado', render: (p: Product) => (p.featured ? 'Sí' : 'No') },
          { label: 'Categoría', render: (p: Product) => p.categories.map((c: CategoryRef) => c.name).join(', ') },
          { label: 'Subcategoría', render: (p: Product) => p.subcategories.map((sc: CategoryRef) => sc.name).join(', ') },
          {
            label: 'Acciones',
            render: (p: Product) => (
              <>
                <Tooltip title="Editar">
                  <IconButton color="primary" size="small" onClick={() => goToEditProduct(p)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton color="error" size="small" onClick={() => handleDelete(p)}>
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
