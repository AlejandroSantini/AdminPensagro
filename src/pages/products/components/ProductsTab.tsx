

import { Table } from '../../../components/common/Table';
import { useCallback } from 'react';
import { Box, Typography, FormControlLabel, Checkbox, MenuItem, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/ArchiveOutlined';
import { Input } from '../../../components/common/Input';
import { ContainedButton } from '../../../components/common/ContainedButton';
import { useForm, Controller } from 'react-hook-form';

interface ProductFormData {
  name: string;
  sku: string;
  price: string;
  stock: string;
  description: string;
  image: string;
  category: string;
  featured: boolean;
}

function ProductsTab() {
  const { handleSubmit, control, reset, formState: { errors }, setError } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      sku: '',
      price: '',
      stock: '',
      description: '',
      image: '',
      category: '',
      featured: false,
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (!data.name || !data.sku || !data.price || !data.stock) {
      setError('name', { message: 'Completa los campos obligatorios' });
      return;
    }
    // TODO: enviar datos al backend
    alert('Producto cargado: ' + JSON.stringify(data, null, 2));
    reset();
  };

  const handleEdit = useCallback((product: any) => {
    alert('Editar producto: ' + product.name);
  }, []);
  const handleArchive = useCallback((product: any) => {
    alert('Archivar producto: ' + product.name);
  }, []);

  // Mock categorías
  const categories = [
    { value: '', label: 'Sin categoría' },
    { value: 'cat1', label: 'Categoría 1' },
    { value: 'cat2', label: 'Categoría 2' },
  ];

  return (
    <Box>
      <Box mb={4}>
        <Typography fontWeight={600} mb={2}>Cargar nuevo producto</Typography>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'El nombre es obligatorio' }}
                render={({ field }) => (
                  <Input label="Nombre" {...field} sx={{ mb: 2 }} variant="outlined" required error={!!errors.name} helperText={errors.name?.message} />
                )}
              />
              <Controller
                name="sku"
                control={control}
                rules={{ required: 'El SKU es obligatorio' }}
                render={({ field }) => (
                  <Input label="SKU" {...field} sx={{ mb: 2 }} variant="outlined" required error={!!errors.sku} helperText={errors.sku?.message} />
                )}
              />
              <Controller
                name="price"
                control={control}
                rules={{ required: 'El precio es obligatorio' }}
                render={({ field }) => (
                  <Input label="Precio (USD)" type="number" {...field} sx={{ mb: 2 }} variant="outlined" required error={!!errors.price} helperText={errors.price?.message} />
                )}
              />
              <Controller
                name="stock"
                control={control}
                rules={{ required: 'El stock es obligatorio' }}
                render={({ field }) => (
                  <Input label="Stock" type="number" {...field} sx={{ mb: 2 }} variant="outlined" required error={!!errors.stock} helperText={errors.stock?.message} />
                )}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input label="Descripción" multiline minRows={2} {...field} sx={{ mb: 2 }} variant="outlined" />
                )}
              />
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <Input label="Imagen (URL)" {...field} sx={{ mb: 2 }} variant="outlined" />
                )}
              />
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Categoría"
                    select
                    {...field}
                    value={field.value || ''}
                    sx={{ mb: 2 }}
                    variant="outlined"
                  >
                    {categories.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Input>
                )}
              />
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox checked={!!field.value} onChange={e => field.onChange(e.target.checked)} name="featured" color="primary" />}
                    label="Destacado"
                    sx={{ mb: 2, ml: 0 }}
                  />
                )}
              />
            </Box>
          </Box>
          <ContainedButton type="submit" sx={{ mt: 2 }}>Cargar producto</ContainedButton>
        </form>
      </Box>
      <Table
        columns={[
          {
            label: '',
            render: p => <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ background: '#f5f5f5', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 18 }}>{p.name?.[0]}</span></Box>,
            width: 48,
          },
          { label: 'Nombre', render: p => p.name },
          { label: 'SKU', render: p => p.sku },
          { label: 'Precio (USD)', render: p => `$${p.price_usd ?? p.price}` },
          { label: 'Stock', render: p => p.stock },
          { label: 'Estado', render: p => p.status === 'active' ? 'Activo' : 'Archivado' },
          { label: 'Destacado', render: p => p.featured ? 'Sí' : 'No' },
          {
            label: 'Acciones',
            render: p => (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Editar">
                  <IconButton color="primary" size="small" sx={{ boxShadow: 'none' }} onClick={() => handleEdit(p)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Archivar">
                  <IconButton color="secondary" size="small" sx={{ boxShadow: 'none' }} onClick={() => handleArchive(p)}>
                    <ArchiveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ),
            align: 'center',
          },
        ]}
        data={[
          {
            id: 1,
            sku: 'SKU001',
            name: 'Producto 1',
            description: 'Desc 1',
            price: 10,
            price_usd: 10,
            stock: 100,
            iva: 21,
            featured: true,
            status: 'active',
            created_at: '2025-10-10',
            updated_at: '2025-10-10',
          },
          {
            id: 2,
            sku: 'SKU002',
            name: 'Producto 2',
            description: 'Desc 2',
            price: 20,
            price_usd: 20,
            stock: 0,
            iva: 21,
            featured: false,
            status: 'archived',
            created_at: '2025-10-09',
            updated_at: '2025-10-09',
          },
        ]}
        getRowKey={p => p.id}
        emptyMessage="No hay productos"
      />
    </Box>
  );
}

export default ProductsTab;
