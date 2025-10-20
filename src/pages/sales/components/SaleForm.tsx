import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, IconButton, CircularProgress, Divider, FormControlLabel, Checkbox, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm, FormProvider } from 'react-hook-form';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Input } from '../../../components/common/Input';
import { ContainedButton } from '../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../components/common/OutlinedButton';
import { Select } from '../../../components/common/Select';
import { ProductsTable } from '../../../components/common/ProductsTable';
import { AddProductModal } from '../../../components/modals/AddProductModal';
import type { ProductItem } from '../../../components/modals/AddProductModal';
import { CustomPaper } from '../../../components/common/CustomPaper';
import api from '../../../services/api';
import { getSaleByIdRoute, getSaleProductsRoute, postSaleRoute, putSaleRoute } from '../../../services/sales';
import { getClientsRoute } from '../../../services/clients';
import { getCouponsRoute } from '../../../services/coupons';


const PAYMENT_METHODS = [
  { label: 'Efectivo', value: '1' },
  { label: 'Tarjeta de crédito', value: '2' },
  { label: 'Transferencia', value: '3' },
];

interface SaleProduct extends ProductItem {
  quantity: number;
}

interface SaleFormData {
  client_id: string;
  user_id: string;
  products: SaleProduct[];
  total: number;
  exchange_rate: number;
  coupon_id: string;
  discount_payment_method_id: string;
  comment: string;
  active: boolean;
}

export default function SaleForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SaleProduct[]>([]);
  const [clients, setClients] = useState<{label: string, value: string}[]>([]);
  const [coupons, setCoupons] = useState<{label: string, value: string}[]>([]);
  
  const isEditMode = !!id;
  const pageTitle = isEditMode ? 'Editar Venta' : 'Nueva Venta';
  const buttonText = isEditMode ? 'Guardar Cambios' : 'Cargar Venta';
  
  const getCurrentUserId = (): string => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id.toString();
      }
    } catch (err) {
      console.error('Error getting current user ID:', err);
    }
    return '1'; 
  };

  const methods = useForm<SaleFormData>({
    defaultValues: {
      client_id: '',
      user_id: getCurrentUserId(),
      products: [],
      total: 0,
      exchange_rate: 1,
      coupon_id: '',
      discount_payment_method_id: '',
      comment: '',
      active: true
    }
  });
  
  const { handleSubmit, control, reset, setValue, watch, formState: { errors } } = methods;
  const watchProducts = watch('products');
  
  const calculateTotal = useCallback(() => {
    return selectedProducts.reduce((sum, product) => 
      sum + (product.price || 0) * product.quantity, 0);
  }, [selectedProducts]);

  useEffect(() => {
    if (isEditMode && id) {
      const loadSale = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const response = await api.get(getSaleByIdRoute(id));
          if (response.data && (response.data.ok || response.data.status === "success")) {
            const saleData = response.data.data;
            
            try {
              const productsResponse = await api.get(getSaleProductsRoute(id));
              const productsData = productsResponse.data && productsResponse.data.data ? 
                productsResponse.data.data : [];
              
              const products = productsData.map((p: any) => ({
                id: p.product_id || p.id,
                name: p.name || p.product_name || `Producto #${p.product_id || p.id}`,
                price: parseFloat(p.price || '0'),
                quantity: p.quantity || 1,
                sku: p.sku || ''
              }));
              
              setSelectedProducts(products);
              
              reset({
                client_id: saleData.client_id.toString(),
                user_id: saleData.user_id.toString(),
                products: products,
                total: parseFloat(saleData.total),
                exchange_rate: parseFloat(saleData.exchange_rate),
                coupon_id: saleData.coupon_id ? saleData.coupon_id.toString() : '',
                discount_payment_method_id: saleData.discount_payment_method_id ? saleData.discount_payment_method_id.toString() : '',
                comment: saleData.comment || '',
                active: saleData.active !== undefined ? saleData.active : true
              });
            } catch (productErr) {
              console.error("Error loading sale products:", productErr);
              setSelectedProducts([]);
              
              reset({
                client_id: saleData.client_id.toString(),
                user_id: saleData.user_id.toString(),
                products: [],
                total: parseFloat(saleData.total),
                exchange_rate: parseFloat(saleData.exchange_rate),
                coupon_id: saleData.coupon_id ? saleData.coupon_id.toString() : '',
                discount_payment_method_id: saleData.discount_payment_method_id ? saleData.discount_payment_method_id.toString() : '',
                comment: saleData.comment || '',
                active: saleData.active !== undefined ? saleData.active : true
              });
            }
          } else {
            setError("No se pudo cargar la venta");
          }
        } catch (err) {
          console.error("Error loading sale:", err);
          setError("Error al cargar la venta. Por favor, intente nuevamente.");
        } finally {
          setLoading(false);
        }
      };
      
      loadSale();
    }
  }, [id, reset, isEditMode]);

  useEffect(() => {
    fetchClients();
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const couponsResponse = await api.get(getCouponsRoute());
      if (couponsResponse.data && couponsResponse.data.status === "success") {
        const couponsData = couponsResponse.data.data.map((coupon: any) => ({
          label: coupon.code || `Cupón ID: ${coupon.id}`,
          value: coupon.id.toString()
        }));
        setCoupons(couponsData);
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError("Error al cargar los cupones. Por favor, intente nuevamente.");
    }
  };
  
  const fetchClients = async () => {
    try {
      const clientsResponse = await api.get(getClientsRoute());
      if (clientsResponse.data && clientsResponse.data.status === "success") {
        const clientsData = clientsResponse.data.data.map((client: any) => ({
          label: client.user_name,
          value: client.id.toString()
        }));
        setClients(clientsData);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Error al cargar los clientes. Por favor, intente nuevamente.");
    }
  };


  useEffect(() => {
    setValue('products', selectedProducts);
    setValue('total', calculateTotal());
  }, [selectedProducts, setValue, calculateTotal]);

  const openProductModal = () => {
    setModalOpen(true);
  };

  const closeProductModal = () => {
    setModalOpen(false);
  };

  const handleAddProduct = (product: ProductItem) => {
    const newProduct: SaleProduct = {
      ...product,
      quantity: 1
    };
    
    setSelectedProducts(prev => [...prev, newProduct]);
    closeProductModal();
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) return;
    
    setSelectedProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, quantity } : p)
    );
  };

  const onSubmit = async (data: SaleFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const calculatedTotal = calculateTotal();
      
      const apiPayload = {
        client_id: parseInt(data.client_id),
        user_id: parseInt(data.user_id),
        total: data.total || calculatedTotal,
        exchange_rate: data.exchange_rate,
        products: selectedProducts.map(p => ({
          product_id: p.id,
          quantity: p.quantity
        })),
        coupon_id: data.coupon_id ? parseInt(data.coupon_id) : null,
        discount_payment_method_id: data.discount_payment_method_id ? parseInt(data.discount_payment_method_id) : null,
        comment: data.comment
      };
      
      if (isEditMode && id) {
        await api.put(putSaleRoute(id), apiPayload);
      } else {
        await api.post(postSaleRoute(), apiPayload);
      }
      
      navigate('/ventas');
    } catch (err: any) {
      console.error('Error saving sale:', err);
      setError(err.response?.data?.message || 'Error al guardar la venta. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/ventas');
  };

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
      <CustomPaper>
        {loading && !selectedProducts.length && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        <FormProvider {...methods}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              position: 'relative',
              gap: { xs: 2, md: 4 },
            }}>
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                p: 2 
              }}>
                <Typography variant="subtitle1" fontWeight={500} mb={1}>Datos de la venta</Typography>
                
                <Controller
                  name="client_id"
                  control={control}
                  rules={{ required: 'El cliente es obligatorio' }}
                  render={({ field }) => (
                    <Select 
                      label="Cliente" 
                      options={clients} 
                      {...field} 
                      required
                      error={!!errors.client_id}
                    />
                  )}
                />
                
                <input 
                  type="hidden" 
                  {...control.register('user_id', { required: true })} 
                />

                <Controller
                  name="exchange_rate"
                  control={control}
                  rules={{ required: 'La tasa de cambio es obligatoria' }}
                  render={({ field }) => (
                    <Input 
                      label="Tasa de cambio" 
                      type="number" 
                      {...field} 
                      value={field.value?.toString() || '1'} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || 1)}
                      variant="outlined" 
                      required 
                      error={!!errors.exchange_rate}
                    />
                  )}
                />
                
                <Controller
                  name="coupon_id"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      label="Cupón de descuento" 
                      options={coupons}
                      {...field}
                      error={!!errors.coupon_id}
                    />
                  )}
                />
                
                <Controller
                  name="discount_payment_method_id"
                  control={control}
                  render={({ field }) => (
                    <Select 
                      label="Método de pago" 
                      options={PAYMENT_METHODS}
                      {...field}
                      error={!!errors.discount_payment_method_id}
                    />
                  )}
                />
                
                <Controller
                  name="comment"
                  control={control}
                  render={({ field }) => (
                    <Input 
                      label="Comentario" 
                      multiline 
                      minRows={3} 
                      variant="outlined" 
                      {...field}
                      error={!!errors.comment}
                    />
                  )}
                />
                
                <Controller
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={field.value} 
                          onChange={(e) => field.onChange(e.target.checked)} 
                        />
                      }
                      label="Activo"
                    />
                  )}
                />
                
                <Box sx={{ mt: 'auto' }}>
                  <Typography variant="subtitle1" align="right" fontWeight="bold">
                    Total: ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              
              <Divider orientation="vertical" flexItem 
                sx={{ 
                  display: { xs: 'none', md: 'block' },
                  position: 'absolute',
                  top: 16,
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }} 
              />
              
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                p: 2 
              }}>
                <ProductsTable
                  products={selectedProducts}
                  onAddProduct={openProductModal}
                  onRemoveProduct={handleRemoveProduct}
                  onUpdateQuantity={handleUpdateQuantity}
                  allowQuantityEdit={true}
                  showTotal={true}
                  emptyMessage="Aún no hay productos seleccionados"
                  title="Productos seleccionados"
                  errors={errors.products?.message}
                />
                
                <Controller
                  name="products"
                  control={control}
                  rules={{ 
                    required: 'Selecciona al menos un producto',
                    validate: value => value.length > 0 || 'Selecciona al menos un producto' 
                  }}
                  render={({ field }) => (
                    <input 
                      type="hidden" 
                      name={field.name}
                      ref={field.ref}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      value={field.value ? JSON.stringify(field.value) : '[]'} 
                    />
                  )}
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt: 2, gap: 2, borderTop: '1px solid #e0e0e0' }}>
              <OutlinedButton onClick={handleCancel} disabled={loading}>
                Cancelar
              </OutlinedButton>
              <ContainedButton type="submit" disabled={loading}>
                {loading ? <CircularProgress size={20} color="inherit" /> : buttonText}
              </ContainedButton>
            </Box>
          </Box>
        </FormProvider>
      </CustomPaper>
      
      <AddProductModal
        open={modalOpen}
        onClose={closeProductModal}
        onProductSelect={handleAddProduct}
      />
    </Box>
  );
}