import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  FormControlLabel, 
  Checkbox, 
  CircularProgress, 
  Alert, 
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteButton from '../../../../components/common/DeleteButton';
import AddIcon from '@mui/icons-material/Add';
import { CustomPaper } from '../../../../components/common/CustomPaper';
import { Input } from '../../../../components/common/Input';
import { ContainedButton } from '../../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../../components/common/OutlinedButton';
import { ProductsTable } from '../../../../components/common/ProductsTable';
import { AddProductModal, type ProductItem } from '../../../../components/modals/AddProductModal';
import api from '../../../../services/api';
import { getComboByIdRoute, postComboRoute, putComboRoute } from '../../../../services/combos';
import type { Combo, ComboFormData, ProductRef } from '../../../../../types/combo';

export default function ComboForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [combo, setCombo] = useState<Combo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductRef[]>([]);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ComboFormData>({
    defaultValues: {
      name: '',
      description: '',
      products: [],
      price: '',
      featured: false,
    },
  });
  
  const selectedProductIds = watch('products') || [];
  const price = watch('price');

  useEffect(() => {
    const total = selectedProducts.reduce((sum, product) => {
      const quantity = product.quantity || 1;
      return sum + ((product.price || 0) * quantity);
    }, 0);
    
    setCalculatedPrice(total);
    
    if (!price) {
      setValue('price', total.toFixed(2));
    }
  }, [selectedProducts, setValue, price]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  const handleProductSelect = (product: ProductItem) => {
    // Convert ProductItem to ProductRef
    const productToAdd: ProductRef = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price?.toString() || '0')
    };
    
    const newSelectedIds = [...selectedProductIds, productToAdd.id];
    setValue('products', newSelectedIds);
    setSelectedProducts(prev => [...prev, productToAdd]);
    setModalOpen(false);
  };
  
  const handleRemoveProduct = (productId: number) => {
    const newSelectedIds = selectedProductIds.filter(id => id !== productId);
    setValue('products', newSelectedIds);
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };
  
  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) return;
    
    setSelectedProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, quantity } : p)
    );
  };

  useEffect(() => {
    if (isEditMode && id) {
      const loadCombo = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const res = await api.get(getComboByIdRoute(Number(id)));
          
          const apiCombo = res.data.data;
          
          const localCombo: Combo = {
            id: parseInt(apiCombo.id),
            name: apiCombo.name,
            description: apiCombo.description || '',
            products: apiCombo.products || [],
            price: parseFloat(apiCombo.total_price),
            featured: apiCombo.featured,
            status: apiCombo.active ? 'active' : 'archived'
          };
          
          setCombo(localCombo);
          setSelectedProducts(localCombo.products || []);
          
          reset({
            id: localCombo.id,
            name: localCombo.name,
            description: localCombo.description || '',
            products: localCombo.products.map(p => p.id),
            price: localCombo.price.toString(),
            featured: localCombo.featured,
          });
        } catch (e) {
          console.error('Error loading combo:', e);
          setError('No se pudo cargar el combo');
        } finally {
          setLoading(false);
        }
      };
      
      loadCombo();
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data: ComboFormData) => {
    setLoading(true);
    setError(null);
    
    if (selectedProducts.length === 0) {
      setError('Selecciona al menos un producto');
      setLoading(false);
      return;
    }
    
    try {
      const apiPayload = {
        name: data.name,
        description: data.description || '',
        products: selectedProducts.map(product => ({
          id: product.id,
          quantity: product.quantity || 1
        })),
        total_price: data.price,
        featured: data.featured,
        active: true
      };
      
      if (isEditMode) {
        await api.put(putComboRoute(Number(id)), apiPayload);
      } else {
        await api.post(postComboRoute(), apiPayload);
      }
      
      navigate('/productos', { state: { activeTab: 2 } });
    } catch (e) {
      console.error('Error saving combo:', e);
      setError('No se pudo guardar el combo');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/productos', { state: { activeTab: 2 } });
  };

  const pageTitle = isEditMode 
    ? `Editar Combo: ${combo?.name || ''}` 
    : 'Nuevo Combo';

  if (loading && !combo && isEditMode) {
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
          <Typography variant="h5">Cargando combo...</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  if (error && isEditMode) {
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
          {pageTitle}
        </Typography>
      </Box>
      
      <CustomPaper>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            position: 'relative'
          }}>
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '1px',
                bgcolor: 'divider',
                transform: 'translateX(-50%)',
                zIndex: 1
              }} 
            />
            
            <Box sx={{ flex: 1 }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'El nombre es obligatorio' }}
                render={({ field }) => (
                  <Input 
                    label="Nombre" 
                    {...field} 
                    sx={{ mb: 2 }} 
                    variant="outlined" 
                    required 
                    error={!!errors.name} 
                    helperText={errors.name?.message} 
                  />
                )}
              />
              
              <Box sx={{ mb: 2 }}>
                <Controller
                  name="price"
                  control={control}
                  rules={{ required: 'El precio es obligatorio' }}
                  render={({ field }) => (
                    <Input 
                      label="Precio total (USD)" 
                      type="number" 
                      {...field} 
                      sx={{ mb: 0 }} 
                      variant="outlined" 
                      required 
                      error={!!errors.price} 
                      helperText={errors.price?.message} 
                    />
                  )}
                />
                {parseFloat(price || '0') !== calculatedPrice && calculatedPrice > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Precio personalizado - Costo de productos: ${calculatedPrice.toFixed(2)}
                  </Typography>
                )}
              </Box>
              
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input 
                    label="Descripción" 
                    multiline 
                    minRows={3} 
                    {...field} 
                    sx={{ mb: 2 }} 
                    variant="outlined" 
                  />
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
            
            <Box sx={{ flex: 1 }}>
              <ProductsTable
                products={selectedProducts}
                onAddProduct={handleOpenModal}
                onRemoveProduct={handleRemoveProduct}
                onUpdateQuantity={handleUpdateQuantity}
                allowQuantityEdit={true} 
                showTotal={true}
                emptyMessage="No hay productos seleccionados"
                title="Productos seleccionados"
                errors={errors.products?.message}
              />
              
              <Controller
                name="products"
                control={control}
                rules={{ required: 'Selecciona al menos un producto' }}
                render={({ field }) => (
                  <input 
                    type="hidden" 
                    name={field.name}
                    ref={field.ref}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={field.disabled}
                    value={field.value ? JSON.stringify(field.value) : '[]'} 
                  />
                )}
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <OutlinedButton onClick={handleCancel} loading={loading}>
              Cancelar
            </OutlinedButton>
            <ContainedButton type="submit" loading={loading}>
              {isEditMode ? 'Guardar cambios' : 'Crear combo'}
            </ContainedButton>
          </Box>
        </Box>
      </CustomPaper>
      
      {/* Product Selection Modal */}
      <AddProductModal
        open={modalOpen}
        onClose={handleCloseModal}
        onProductSelect={handleProductSelect}
      />
    </Box>
  );
}