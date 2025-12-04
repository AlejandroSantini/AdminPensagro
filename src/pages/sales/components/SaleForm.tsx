import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, IconButton, CircularProgress, Divider, FormControlLabel, Checkbox, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm, FormProvider } from 'react-hook-form';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Input } from '../../../components/common/Input';
import { SearchInput } from '../../../components/common/SearchInput';
import { ContainedButton } from '../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../components/common/OutlinedButton';
import { Select } from '../../../components/common/Select';
import { ProductsTable } from '../../../components/common/ProductsTable';
import { AddProductModal } from '../../../components/modals/AddProductModal';
import { ClientSearchModal } from '../../../components/modals/ClientSearchModal';
import { ShippingDataForm } from '../../../components/common/ShippingDataForm';
import type { SelectedProductWithVariant } from '../../../components/modals/AddProductModal';
import { CustomPaper } from '../../../components/common/CustomPaper';
import api from '../../../services/api';
import { getSaleByIdRoute, postSaleRoute, putSaleRoute } from '../../../services/sales';
import { getClientByIdRoute } from '../../../services/clients';
import { getCouponsRoute } from '../../../services/coupons';
import type { Client } from '../../../../types/client';


const PAYMENT_METHODS = [
  { label: 'Efectivo', value: '1' },
  { label: 'Tarjeta de crédito', value: '2' },
  { label: 'Transferencia', value: '3' },
];

const SALES_CHANNELS = [
  { label: 'Tienda física', value: 'store' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Marketplace', value: 'marketplace' },
  { label: 'Sitio web', value: 'website' },
  { label: 'Teléfono', value: 'phone' },
  { label: 'Otro', value: 'other' },
];

const SHIPPING_STATUS = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'En preparación', value: 'preparing' },
  { label: 'En tránsito', value: 'in_transit' },
  { label: 'Entregado', value: 'delivered' },
  { label: 'Cancelado', value: 'cancelled' },
];

const PAYMENT_STATUS = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'Pagado', value: 'paid' },
  { label: 'Pago parcial', value: 'partial' },
  { label: 'Reembolsado', value: 'refunded' },
  { label: 'Cancelado', value: 'cancelled' },
];

interface SaleProduct {
  id: number;
  name: string;
  price?: number;
  quantity: number;
  sku?: string;
  stock?: number;
  variantId?: number | string | null;
  variantName?: string;
}

interface ShippingData {
  first_name: string;
  last_name: string;
  address: string;
  apartment: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
}

interface ShippingAddress {
  id: number;
  client_id: number;
  first_name: string;
  last_name: string;
  address: string;
  apartment: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
  comment?: string;
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
  sales_channel: string;
  shipping_status: string;
  payment_status: string;
  shippingData?: ShippingData;
}

export default function SaleForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SaleProduct[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [coupons, setCoupons] = useState<{label: string, value: string}[]>([]);
  const [clientLoaded, setClientLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentShippingId, setCurrentShippingId] = useState<number | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  
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
      active: true,
      sales_channel: 'store',
      shipping_status: 'pending',
      payment_status: 'pending',
      shippingData: {
        first_name: '',
        last_name: '',
        address: '',
        apartment: '',
        city: '',
        province: '',
        postal_code: '',
        phone: ''
      }
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
          if (response.data && (response.data.ok || response.data.status === "success" || response.data.status === true)) {
            const saleData = response.data.data;
            
            const productsData = saleData.products || [];

            const products = productsData.map((item: any) => {
              const product = item.product || {};
              const variant = item.variant || {};
              
              return {
                id: product.id || item.product_id,
                name: product.name || `Producto #${product.id}`,
                price: item.unit_price_usd || parseFloat(variant.price_retail_usd || '0'),
                quantity: item.quantity || 1,
                sku: product.sku || '',
                variantId: item.variant_id || null,
                variantName: variant.name || undefined
              };
            });
            
            setSelectedProducts(products);
            
            setCurrentShippingId(saleData.shipping_id || null);
            
            reset({
              client_id: saleData.client_id.toString(),
              user_id: saleData.user_id ? saleData.user_id.toString() : getCurrentUserId(),
              products: products,
              total: parseFloat(saleData.total_usd || saleData.total || '0'),
              exchange_rate: parseFloat(saleData.exchange_rate || '1'),
              coupon_id: saleData.coupon_id ? saleData.coupon_id.toString() : '',
              discount_payment_method_id: saleData.discount_payment_method_id ? saleData.discount_payment_method_id.toString() : '',
              comment: saleData.comment || '',
              active: saleData.status === 'active',
              sales_channel: saleData.channel || 'store',
              shipping_status: 'pending',
              payment_status: saleData.payment_status || 'pending'
            });
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
    fetchCoupons();
  }, []);

  const clientId = watch('client_id');
  
  useEffect(() => {
    if (isEditMode && clientId && !clientLoaded) {
      setClientLoaded(true);
      loadClientDataForEdit(clientId);
    }
  }, [clientId, isEditMode, clientLoaded]);

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
  
  const loadClientDataForEdit = async (clientId: string) => {
    try {
      const response = await api.get(getClientByIdRoute(clientId));
      if (response.data && response.data.status === "success") {
        const clientData = response.data.data;
        setSelectedClient({
          id: clientData.id,
          name: clientData.user_name || clientData.name || '',
          email: clientData.user_email || clientData.email || '',
          phone: clientData.phone || '',
          dni: clientData.dni || '',
          type: clientData.client_type || clientData.type || 'retailer',
          status: clientData.user_status || clientData.status || 'active'
        });
      }
    } catch (err) {
      console.error("Error loading client:", err);
    }
  };

  const handleSelectClient = async (client: Client) => {
    setSelectedClient(client);
    setValue('client_id', client.id.toString());
  };

  const handleClearClient = () => {
    setSelectedClient(null);
    setValue('client_id', '');
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

  const handleAddProduct = (selection: SelectedProductWithVariant) => {
    const { product, variant } = selection;
    
    let price = 0;
    if (variant) {
      price = typeof variant.price_retail_usd === 'string' 
        ? parseFloat(variant.price_retail_usd) 
        : variant.price_retail_usd;
    } else if (product.price_usd) {
      price = typeof product.price_usd === 'string'
        ? parseFloat(product.price_usd)
        : product.price_usd;
    }
    
    const newProduct: SaleProduct = {
      id: product.id,
      name: product.name,
      price: price,
      sku: product.sku,
      stock: product.stock,
      quantity: 1,
      variantId: variant ? variant.id : null,
      variantName: variant ? variant.name : undefined
    };
    
    setSelectedProducts(prev => {
      const newState = [...prev, newProduct];
      return newState;
    });
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
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoading(true);
    setError(null);
    
    try {
      const paymentMethodMap: Record<string, string> = {
        '1': 'cash',
        '2': 'credit_card', 
        '3': 'transfer',
        '4': 'mercadopago'
      };

      const apiPayload: any = {
        payment_method: paymentMethodMap[data.discount_payment_method_id] || 'cash',
        payment_status: data.payment_status || 'pending',
        products: selectedProducts.map(p => ({
          product_id: p.id,
          variant_id: p.variantId ? parseInt(String(p.variantId)) : null,
          quantity: p.quantity
        })),
        coupon_id: data.coupon_id ? parseInt(data.coupon_id) : null,
        discount_payment_method_id: data.discount_payment_method_id ? parseInt(data.discount_payment_method_id) : null,
        payment_method_discount_percent: 0,
        coupon_discount_percent: null,
        channel: data.sales_channel || 'local',
        comment: data.comment || '',
        invoice_number: null
      };

      if (selectedClient && selectedAddressId) {
        apiPayload.shipping_id = parseInt(selectedAddressId);
      } else {
        apiPayload.shipping_id = null;
        apiPayload.first_name = data.shippingData?.first_name || '';
        apiPayload.last_name = data.shippingData?.last_name || '';
        apiPayload.address = data.shippingData?.address || '';
        apiPayload.apartment = data.shippingData?.apartment || '';
        apiPayload.city = data.shippingData?.city || '';
        apiPayload.province = data.shippingData?.province || '';
        apiPayload.postal_code = data.shippingData?.postal_code || '';
        apiPayload.phone = data.shippingData?.phone || '';
      }

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
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/ventas');
  };

  return (
    <Box sx={{ pb: { xs: 2, sm: 0 } }}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton 
          onClick={handleCancel} 
          sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
          aria-label="volver"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          {pageTitle}
        </Typography>
      </Box>
      <CustomPaper sx={{ p: { xs: 1, sm: 2, md: 3 }, overflow: 'hidden' }}>
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
              flexDirection: { xs: 'column', xl: 'row' },
              position: 'relative',
              gap: { xs: 0, xl: 4 },
            }}>
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: { xs: 1.5, sm: 2 },
                p: { xs: 0.5, sm: 1, md: 2 },
                minWidth: 0,
                width: '100%'
              }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={500} 
                  mb={{ xs: 0, sm: 1 }}
                  sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                >
                  Datos de la venta
                </Typography>
                
                <Box>
                  <SearchInput
                    label="Cliente *"
                    value={selectedClient ? 
                      (selectedClient.dni ? `${selectedClient.dni} - ${selectedClient.name}` : selectedClient.name || selectedClient.email) 
                      : ''}
                    onClick={isEditMode ? undefined : () => setClientModalOpen(true)}
                    placeholder="Buscar cliente"
                    error={!!errors.client_id}
                    showClear={!isEditMode && !!selectedClient}
                    onClear={handleClearClient}
                    disabled={isEditMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: errors.client_id ? 'error.main' : 'primary.main',
                        },
                        '& fieldset': {
                          borderColor: errors.client_id ? 'error.main' : undefined,
                        }
                      }
                    }}
                  />
                  <Controller
                    name="client_id"
                    control={control}
                    rules={{ required: 'El cliente es obligatorio' }}
                    render={({ field }) => (
                      <input type="hidden" {...field} />
                    )}
                  />
                  {errors.client_id && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {errors.client_id.message}
                    </Typography>
                  )}
                </Box>
                
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
                  name="sales_channel"
                  control={control}
                  rules={{ required: 'El canal de venta es obligatorio' }}
                  render={({ field }) => (
                    <Select 
                      label="Canal de la venta" 
                      options={SALES_CHANNELS}
                      {...field}
                      required
                      error={!!errors.sales_channel}
                    />
                  )}
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Controller
                    name="shipping_status"
                    control={control}
                    rules={{ required: 'El estado de envío es obligatorio' }}
                    render={({ field }) => (
                      <Select 
                        label="Estado de envío" 
                        options={SHIPPING_STATUS}
                        {...field}
                        required
                        error={!!errors.shipping_status}
                      />
                    )}
                  />

                  <Controller
                    name="payment_status"
                    control={control}
                    rules={{ required: 'El estado de pago es obligatorio' }}
                    render={({ field }) => (
                      <Select 
                        label="Estado de pago" 
                        options={PAYMENT_STATUS}
                        {...field}
                        required
                        error={!!errors.payment_status}
                      />
                    )}
                  />
                </Box>
                
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

                <Box sx={{ mt: { xs: 1, sm: 2 } }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: { xs: 1.5, sm: 2, md: 3 }, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 2,
                      bgcolor: '#fafafa'
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600} 
                      mb={{ xs: 1.5, sm: 2 }} 
                      color="primary"
                      sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                    >
                      Datos de Envío
                    </Typography>
                    
                    <ShippingDataForm 
                      clientId={selectedClient?.id}
                      initialAddressId={currentShippingId}
                      onAddressChange={setSelectedAddressId}
                      onError={setError}
                    />
                  </Paper>
                </Box>
                
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
                
                <Box sx={{ mt: { xs: 1, sm: 'auto' } }}>
                  <Typography 
                    variant="subtitle1" 
                    align="right" 
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
                  >
                    Total: ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              
              <Divider 
                orientation="vertical" 
                flexItem 
                sx={{ 
                  display: { xs: 'none', xl: 'block' },
                  position: 'absolute',
                  top: 16,
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }} 
              />
              
              <Divider 
                sx={{ 
                  display: { xs: 'block', xl: 'none' },
                  my: { xs: 2, sm: 3 }
                }} 
              />
              
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                p: { xs: 0.5, sm: 1, md: 2 },
                minWidth: 0,
                width: '100%'
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
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'flex-end', 
              mt: { xs: 2, sm: 3 }, 
              pt: { xs: 1.5, sm: 2 }, 
              gap: { xs: 1.5, sm: 2 }, 
              borderTop: '1px solid #e0e0e0' 
            }}>
              <OutlinedButton 
                onClick={handleCancel} 
                disabled={loading}
              >
                Cancelar
              </OutlinedButton>
              <ContainedButton 
                type="submit" 
                loading={loading}
              >
                {buttonText}
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

      <ClientSearchModal
        open={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onSelectClient={handleSelectClient}
      />
    </Box>
  );
}