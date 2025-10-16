import { useState, useEffect } from 'react';
import { Box, Typography, MenuItem, FormControlLabel, Checkbox, CircularProgress, Alert, IconButton } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CustomPaper } from '../../../../components/common/CustomPaper';
import { Input } from '../../../../components/common/Input';
import { ContainedButton } from '../../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../../components/common/OutlinedButton';
import api from '../../../../services/api';
import { getProductByIdRoute, putProductRoute, postProductRoute } from '../../../../services/products';
import { getCategoriesRoute, getSubcategoriesRoute } from '../../../../services/categories';
import type { Product, ProductFormData } from '../../../../../types/product';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<{ id: number; name: string }[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<{ id: number; name: string }[]>([]);
  
  const isEditMode = !!id;
  const pageTitle = isEditMode ? 'Editar Producto' : 'Nuevo Producto';
  const buttonText = isEditMode ? 'Guardar Cambios' : 'Crear Producto';
  
  const { handleSubmit, control, reset, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      price_usd: 0,
      stock: 0,
      iva: 0,
      featured: false,
      categoryId: 0,
      subcategoryId: 0,
    }
  });

  useEffect(() => {
    if (!isEditMode) return;
    
    const fetchProduct = async () => {
      setFetchLoading(true);
      setError(null);
      
      try {
        const res = await api.get(getProductByIdRoute(id));
        const productData = res.data.data;
        setProduct(productData);
        
        reset({
          id: productData.id,
          sku: productData.sku,
          name: productData.name,
          description: productData.description,
          price_usd: Number(productData.price_usd),
          stock: Number(productData.stock),
          iva: Number(productData.iva),
          featured: productData.featured,
          categoryId: productData.categories[0]?.id || 0,
          subcategoryId: productData.subcategories[0]?.id || 0,
        });
      } catch (e) {
        setError('No se pudo cargar el producto');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProduct();
  }, [id, reset, isEditMode]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(getCategoriesRoute());
        setCategoryOptions(res.data.data || []);
      } catch (e) {
        setCategoryOptions([]);
      }
    };

    const fetchSubcategories = async () => {
      try {
        const res = await api.get(getSubcategoriesRoute());
        setSubcategoryOptions(res.data.data || []);
      } catch (e) {
        setSubcategoryOptions([]);
      }
    };

    fetchCategories();
    fetchSubcategories();
  }, []);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    const payload = {
      ...data,
      price_usd: parseFloat(String(data.price_usd)) || 0,
      stock: parseInt(String(data.stock)) || 0,
      iva: parseInt(String(data.iva)) || 0,
      categoryId: parseInt(String(data.categoryId)) || 0,
      subcategoryId: parseInt(String(data.subcategoryId)) || 0,
    };

    try {
      if (isEditMode) {
        await api.put(putProductRoute(id!), { ...payload, id: Number(id) });
      } else {
        await api.post(postProductRoute(), payload);
      }
      
      setLoading(false);
      navigate('/productos');
    } catch (e) {
      setLoading(false);
      setError(isEditMode ? 'Error al actualizar el producto' : 'Error al crear el producto');
    }
  };

  const handleCancel = () => {
    navigate('/productos');
  };

  if (isEditMode && fetchLoading) {
    return (
      <Box>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton 
            onClick={handleCancel} 
            sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
            aria-label="volver"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">Cargando producto...</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton 
            onClick={handleCancel} 
            sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
            aria-label="volver"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">{pageTitle}</Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <OutlinedButton onClick={handleCancel}>
            Volver a productos
          </OutlinedButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton 
          onClick={handleCancel} 
          sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
          aria-label="volver"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">
          {isEditMode ? `Editar Producto: ${product?.name}` : 'Nuevo Producto'}
        </Typography>
      </Box>
      <CustomPaper>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <Controller
            name="sku"
            control={control}
            rules={{ required: 'El SKU es obligatorio' }}
            render={({ field }) => (
              <Input label="SKU" {...field} sx={{ mb: 3 }} variant="outlined" required error={!!errors.sku} helperText={errors.sku?.message} />
            )}
          />
          <Controller
            name="name"
            control={control}
            rules={{ required: 'El nombre es obligatorio' }}
            render={({ field }) => (
              <Input label="Nombre" {...field} sx={{ mb: 3 }} variant="outlined" required error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input label="Descripción" multiline minRows={3} {...field} sx={{ mb: 3 }} variant="outlined" />
            )}
          />
          <Controller
            name="price_usd"
            control={control}
            rules={{ required: 'El precio es obligatorio', min: { value: 0, message: 'Debe ser mayor o igual a 0' } }}
            render={({ field }) => (
              <Input label="Precio USD" type="number" {...field} sx={{ mb: 3 }} variant="outlined" required error={!!errors.price_usd} helperText={errors.price_usd?.message} />
            )}
          />
          <Controller
            name="stock"
            control={control}
            rules={{ required: 'El stock es obligatorio', min: { value: 0, message: 'Debe ser mayor o igual a 0' } }}
            render={({ field }) => (
              <Input label="Stock" type="number" {...field} sx={{ mb: 3 }} variant="outlined" required error={!!errors.stock} helperText={errors.stock?.message} />
            )}
          />
          <Controller
            name="iva"
            control={control}
            rules={{ required: 'El IVA es obligatorio', min: { value: 0, message: 'Debe ser mayor o igual a 0' } }}
            render={({ field }) => (
              <Input label="IVA" type="number" {...field} sx={{ mb: 3 }} variant="outlined" required error={!!errors.iva} helperText={errors.iva?.message} />
            )}
          />
          <Controller
            name="featured"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={!!field.value} onChange={e => field.onChange(e.target.checked)} name="featured" color="primary" />}
                label="Destacado"
                sx={{ mb: 3, ml: 0 }}
              />
            )}
          />
          <Controller
            name="categoryId"
            control={control}
            rules={{ required: 'La categoría es obligatoria' }}
            render={({ field }) => (
              <Input
                label="Categoría"
                select
                {...field}
                value={field.value || ''}
                sx={{ mb: 3 }}
                variant="outlined"
                required
                error={!!errors.categoryId}
                helperText={errors.categoryId?.message}
              >
                <MenuItem value="">Seleccionar categoría</MenuItem>
                {categoryOptions.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Input>
            )}
          />
          <Controller
            name="subcategoryId"
            control={control}
            render={({ field }) => (
              <Input
                label="Subcategoría"
                select
                {...field}
                value={field.value || ''}
                sx={{ mb: 3 }}
                variant="outlined"
              >
                <MenuItem value="">Seleccionar subcategoría</MenuItem>
                {subcategoryOptions.map(sc => (
                  <MenuItem key={sc.id} value={sc.id}>{sc.name}</MenuItem>
                ))}
              </Input>
            )}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
            <OutlinedButton onClick={handleCancel} disabled={loading}>
              Cancelar
            </OutlinedButton>
            <ContainedButton type="submit" disabled={loading}>
              {buttonText}
            </ContainedButton>
          </Box>
        </Box>
      </CustomPaper>
    </Box>
  );
}