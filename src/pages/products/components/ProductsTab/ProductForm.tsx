import { useState, useEffect } from 'react';
import { Box, Typography, MenuItem, FormControlLabel, Checkbox, CircularProgress, Alert, IconButton, Paper, Divider } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteButton from '../../../../components/common/DeleteButton';
import ImageUploader from '../../../../components/common/ImageUploader';
import { CustomPaper } from '../../../../components/common/CustomPaper';
import { Input } from '../../../../components/common/Input';
import { ContainedButton } from '../../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../../components/common/OutlinedButton';
import { ProductsTable } from '../../../../components/common/ProductsTable';
import { AddProductModal, type ProductItem } from '../../../../components/modals/AddProductModal';
import api from '../../../../services/api';
import { getProductByIdRoute, putProductRoute, postProductRoute } from '../../../../services/products';
import { getCategoriesRoute, getSubcategoriesRoute } from '../../../../services/categories';
import type { Product, ProductFormData, ProductVariant } from '../../../../../types/product';
import type { ProductRef } from '../../../../../types/combo';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<{ id: number; name: string }[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<{ id: number; name: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRelatedProducts, setSelectedRelatedProducts] = useState<ProductRef[]>([]);
  const [selectedImagesData, setSelectedImagesData] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); // Estado para las imágenes existentes
  
  const isEditMode = !!id;
  const pageTitle = isEditMode ? 'Editar Producto' : 'Nuevo Producto';
  const buttonText = isEditMode ? 'Guardar Cambios' : 'Crear Producto';
  
  const { handleSubmit, control, reset, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      stock: 0,
      iva: 0,
      featured: false,
      categoryId: 0,
      subcategoryId: 0,
      variants: [],
      relatedProducts: [],
    }
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleProductSelect = (product: ProductItem) => {
    // Verificar que no sea el mismo producto
    if (isEditMode && product.id === Number(id)) {
      alert('No puedes agregar el mismo producto como relacionado');
      return;
    }
    
    // Verificar que no esté ya agregado
    if (selectedRelatedProducts.some(p => p.id === product.id)) {
      alert('Este producto ya está en la lista de relacionados');
      return;
    }
    
    // Convertir ProductItem a ProductRef
    const productToAdd: ProductRef = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price?.toString() || '0')
    };
    
    setSelectedRelatedProducts(prev => [...prev, productToAdd]);
    setModalOpen(false);
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedRelatedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setSelectedImagesData(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedImagesData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!isEditMode) return;
    
    const fetchProduct = async () => {
      setFetchLoading(true);
      setError(null);
      
      try {
        const res = await api.get(getProductByIdRoute(id));
        const productData = res.data.data;
        setProduct(productData);

        // Mapear las imágenes existentes
        setExistingImages(productData.image_urls || []);

        // Mapear las variantes del API al formato del formulario
        const mappedVariants = (productData.variants || []).map((v: any) => ({
          id: v.id,
          name: v.name,
          quantity: Number(v.quantity),
          price_wholesale_usd: Number(v.price_wholesale_usd),
          price_retail_usd: Number(v.price_retail_usd),
          peso_kg: v.peso_kg ? Number(v.peso_kg) : undefined,
          volumen: v.volumen ? Number(v.volumen) : undefined,
        }));

        // Mapear los productos relacionados (viene como related_products del API)
        const relatedProductIds = (productData.related_products || []).map((p: any) => p.id);
        
        // Mapear los productos relacionados para el estado local usando ProductRef
        const relatedProductsRefs: ProductRef[] = (productData.related_products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: 0,
        }));
        setSelectedRelatedProducts(relatedProductsRefs);
        
        reset({
          id: productData.id,
          sku: productData.sku,
          name: productData.name,
          description: productData.description || '',
          stock: Number(productData.stock),
          iva: Number(productData.iva),
          featured: productData.featured === true || productData.featured === 'true',
          categoryId: productData.categories[0]?.id || 0,
          subcategoryId: productData.subcategories[0]?.id || 0,
          variants: mappedVariants,
          relatedProducts: relatedProductIds,
        });
      } catch (e) {
        console.error('Error al cargar producto:', e);
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
    setError(null);

    const formData = new FormData();
    formData.append('sku', data.sku);
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('stock', data.stock.toString());
    formData.append('iva', data.iva.toString());
    formData.append('featured', data.featured.toString());
    formData.append('categoryId', data.categoryId.toString());
    formData.append('subcategoryId', data.subcategoryId.toString());

    selectedRelatedProducts.forEach((product, index) => {
      formData.append(`relatedProducts[${index}]`, product.id.toString());
    });

    data.variants.forEach((variant, index) => {
      formData.append(`variants[${index}][name]`, variant.name);
      formData.append(`variants[${index}][quantity]`, variant.quantity.toString());
      formData.append(`variants[${index}][price_wholesale_usd]`, variant.price_wholesale_usd.toString());
      formData.append(`variants[${index}][price_retail_usd]`, variant.price_retail_usd.toString());
      if (variant.peso_kg) formData.append(`variants[${index}][peso_kg]`, variant.peso_kg.toString());
      if (variant.volumen) formData.append(`variants[${index}][volumen]`, variant.volumen.toString());
    });

    existingImages.forEach((url) => {
      formData.append('images', url);
    });

    // append existing image URLs
    selectedImagesData.forEach((dataUrl) => {
      formData.append('images', dataUrl);
    });

    try {
      if (isEditMode) {
        await api.put(putProductRoute(id!), formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post(postProductRoute(), formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setLoading(false);
      navigate('/productos');
    } catch (e: any) {
      setLoading(false);
      setError(e.response?.data?.message || (isEditMode ? 'Error al actualizar el producto' : 'Error al crear el producto'));
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

      {isEditMode && product && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">ID</Typography>
              <Typography variant="body2" fontWeight={500}>#{product.id}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Estado</Typography>
              <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                {product.status === 'active' ? '✅ Activo' : '⚠️ ' + product.status}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Creado</Typography>
              <Typography variant="body2" fontWeight={500}>
                {new Date(product.created_at).toLocaleDateString('es-AR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Última modificación</Typography>
              <Typography variant="body2" fontWeight={500}>
                {new Date(product.updated_at).toLocaleDateString('es-AR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

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
            name="stock"
            control={control}
            rules={{ required: 'El stock total es obligatorio', min: { value: 0, message: 'Debe ser mayor o igual a 0' } }}
            render={({ field }) => (
              <Input label="Stock Total" type="number" {...field} sx={{ mb: 3 }} variant="outlined" required error={!!errors.stock} helperText={errors.stock?.message} />
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
                helperText={
                  isEditMode && product?.categories[0] 
                    ? `Categoría actual: ${product.categories[0].name}` 
                    : errors.categoryId?.message
                }
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
                helperText={
                  isEditMode && product?.subcategories[0] 
                    ? `Subcategoría actual: ${product.subcategories[0].name}` 
                    : undefined
                }
              >
                <MenuItem value="">Seleccionar subcategoría</MenuItem>
                {subcategoryOptions.map(sc => (
                  <MenuItem key={sc.id} value={sc.id}>{sc.name}</MenuItem>
                ))}
              </Input>
            )}
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Variantes del Producto
          </Typography>
          
          {variantFields.map((variant, index) => {
            const variantData = variantFields[index] as any;
            return (
            <Paper key={variant.id} elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={500}>
                    Variante {index + 1}
                    {variantData.id && (
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (ID: {variantData.id})
                      </Typography>
                    )}
                  </Typography>
                </Box>
                <DeleteButton onClick={() => removeVariant(index)} />
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Controller
                  name={`variants.${index}.name`}
                  control={control}
                  rules={{ required: 'El nombre de la variante es obligatorio' }}
                  render={({ field }) => (
                    <Input 
                      label="Nombre de Variante" 
                      {...field} 
                      variant="outlined" 
                      required
                      error={!!errors.variants?.[index]?.name}
                      helperText={errors.variants?.[index]?.name?.message}
                    />
                  )}
                />
                <Controller
                  name={`variants.${index}.quantity`}
                  control={control}
                  rules={{ required: 'La cantidad es obligatoria', min: { value: 0, message: 'Debe ser mayor o igual a 0' } }}
                  render={({ field }) => (
                    <Input 
                      label="Cantidad" 
                      type="number" 
                      {...field} 
                      variant="outlined" 
                      required
                      error={!!errors.variants?.[index]?.quantity}
                      helperText={errors.variants?.[index]?.quantity?.message}
                    />
                  )}
                />
                <Controller
                  name={`variants.${index}.price_wholesale_usd`}
                  control={control}
                  rules={{ required: 'El precio mayorista es obligatorio', min: { value: 0, message: 'Debe ser mayor o igual a 0' } }}
                  render={({ field }) => (
                    <Input 
                      label="Precio Mayorista USD" 
                      type="number" 
                      {...field} 
                      variant="outlined" 
                      required
                      error={!!errors.variants?.[index]?.price_wholesale_usd}
                      helperText={errors.variants?.[index]?.price_wholesale_usd?.message}
                    />
                  )}
                />
                <Controller
                  name={`variants.${index}.price_retail_usd`}
                  control={control}
                  rules={{ required: 'El precio minorista es obligatorio', min: { value: 0, message: 'Debe ser mayor o igual a 0' } }}
                  render={({ field }) => (
                    <Input 
                      label="Precio Minorista USD" 
                      type="number" 
                      {...field} 
                      variant="outlined" 
                      required
                      error={!!errors.variants?.[index]?.price_retail_usd}
                      helperText={errors.variants?.[index]?.price_retail_usd?.message}
                    />
                  )}
                />
                <Controller
                  name={`variants.${index}.peso_kg`}
                  control={control}
                  render={({ field }) => (
                    <Input 
                      label="Peso (kg)" 
                      type="number" 
                      {...field} 
                      variant="outlined"
                      helperText="Opcional, para calcular envío"
                    />
                  )}
                />
                <Controller
                  name={`variants.${index}.volumen`}
                  control={control}
                  render={({ field }) => (
                    <Input 
                      label="Volumen" 
                      type="number" 
                      {...field} 
                      variant="outlined"
                      helperText="Opcional, para calcular envío"
                    />
                  )}
                />
              </Box>
            </Paper>
            );
          })}

          <Box sx={{ mb: 3 }}>
            <OutlinedButton
              startIcon={<AddIcon />}
              onClick={() => appendVariant({ 
                name: '', 
                quantity: 0, 
                price_wholesale_usd: 0, 
                price_retail_usd: 0,
                peso_kg: undefined,
                volumen: undefined,
              })}
            >
              Agregar Variante
            </OutlinedButton>
          </Box>

          <Divider sx={{ my: 3 }} />
          
          <ProductsTable
            products={selectedRelatedProducts}
            onAddProduct={handleOpenModal}
            onRemoveProduct={handleRemoveProduct}
            allowQuantityEdit={false}
            showTotal={false}
            emptyMessage="No hay productos relacionados"
            title="Productos Relacionados"
          />
          
          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Cargar Imágenes
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Cargar Imágenes</Typography>
            <ImageUploader
              value={[...existingImages, ...selectedImagesData]}
              multiple
              onChange={(images) => {
                const urls = images.filter(i => !i.startsWith('data:'));
                const data = images.filter(i => i.startsWith('data:'));
                setExistingImages(urls);
                setSelectedImagesData(data);
              }}
              recommendText="Se recomienda subir imágenes cuadradas para mejor visualización"
            />
          </Box>

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

      <AddProductModal
        open={modalOpen}
        onClose={handleCloseModal}
        onProductSelect={handleProductSelect}
      />
    </Box>
  );
}