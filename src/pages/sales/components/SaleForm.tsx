import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, IconButton, CircularProgress, Divider, FormControlLabel, Checkbox, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm, FormProvider } from 'react-hook-form';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
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

interface SaleProduct extends ProductItem {
  quantity: number;
}

interface ShippingData {
  recipient_name: string;
  contact_phone: string;
  street: string;
  street_number: string;
  floor?: string;
  neighborhood?: string;
  city: string;
  province: string;
  postal_code: string;
  references?: string;
  shipping_type: 'home' | 'pickup' | 'branch';
  cost: number;
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
  const [selectedProducts, setSelectedProducts] = useState<SaleProduct[]>([]);
  const [clients, setClients] = useState<{label: string, value: string}[]>([]);
  const [coupons, setCoupons] = useState<{label: string, value: string}[]>([]);
  const [hasShipping, setHasShipping] = useState(false);
  
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
      shippingData: undefined
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
                active: saleData.active !== undefined ? saleData.active : true,
                sales_channel: saleData.sales_channel || 'store',
                shipping_status: saleData.shipping_status || 'pending',
                payment_status: saleData.payment_status || 'pending'
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
                active: saleData.active !== undefined ? saleData.active : true,
                sales_channel: saleData.sales_channel || 'store',
                shipping_status: saleData.shipping_status || 'pending',
                payment_status: saleData.payment_status || 'pending'
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
      
      const apiPayload: any = {
        client_id: parseInt(data.client_id),
        user_id: parseInt(data.user_id),
        total: data.total || calculatedTotal,
        exchange_rate: data.exchange_rate,
        products: selectedProducts.map(p => ({
          product_id: p.id,
          quantity: p.quantity
        })),
        coupon_id: data.coupon_id ? parseInt(data.coupon_id) : null,
        discount_payment_method_id: null,
        comment: data.comment || null,
        sales_channel: data.sales_channel,
        shipping_status: data.shipping_status,
        payment_status: data.payment_status
      };

      if (data.shippingData) {
        apiPayload.shippingData = {
          recipient_name: data.shippingData.recipient_name,
          contact_phone: data.shippingData.contact_phone,
          street: data.shippingData.street,
          street_number: data.shippingData.street_number,
          floor: data.shippingData.floor || null,
          neighborhood: data.shippingData.neighborhood || null,
          city: data.shippingData.city,
          province: data.shippingData.province,
          postal_code: data.shippingData.postal_code,
          references: data.shippingData.references || null,
          shipping_type: data.shippingData.shipping_type,
          cost: parseFloat(String(data.shippingData.cost)) || 0
        };
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
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={hasShipping} 
                        onChange={(e) => {
                          setHasShipping(e.target.checked);
                          if (!e.target.checked) {
                            setValue('shippingData', undefined);
                          } else {
                            setValue('shippingData', {
                              recipient_name: '',
                              contact_phone: '',
                              street: '',
                              street_number: '',
                              city: '',
                              province: '',
                              postal_code: '',
                              shipping_type: 'home',
                              cost: 0
                            });
                          }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Agregar datos de envío
                      </Typography>
                    }
                  />

                  {hasShipping && (
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        mt: { xs: 1.5, sm: 2 }, 
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
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5, md: 3 } }}>
                        <Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={500} 
                            display="block" 
                            mb={1.5}
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            Información de Contacto
                          </Typography>
                          <Box sx={{ display: 'grid', gap: 2 }}>
                            <Controller
                              name="shippingData.recipient_name"
                              control={control}
                              rules={hasShipping ? { required: 'El nombre del destinatario es obligatorio' } : undefined}
                              render={({ field }) => (
                                <Input 
                                  label="Nombre del destinatario" 
                                  {...field} 
                                  variant="outlined"
                                  required={hasShipping}
                                />
                              )}
                            />

                            <Controller
                              name="shippingData.contact_phone"
                              control={control}
                              rules={hasShipping ? { required: 'El teléfono es obligatorio' } : undefined}
                              render={({ field }) => (
                                <Input 
                                  label="Teléfono de contacto" 
                                  {...field} 
                                  variant="outlined"
                                  placeholder="+54 9 3442 123456"
                                  required={hasShipping}
                                />
                              )}
                            />
                          </Box>
                        </Box>

                        <Divider sx={{ my: { xs: 0.5, sm: 0 } }} />

                        <Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={500} 
                            display="block" 
                            mb={1.5}
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            Dirección de Entrega
                          </Typography>
                          <Box sx={{ display: 'grid', gap: 2 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
                              <Controller
                                name="shippingData.street"
                                control={control}
                                rules={hasShipping ? { required: 'La calle es obligatoria' } : undefined}
                                render={({ field }) => (
                                  <Input 
                                    label="Calle" 
                                    {...field} 
                                    variant="outlined"
                                    required={hasShipping}
                                  />
                                )}
                              />

                              <Controller
                                name="shippingData.street_number"
                                control={control}
                                rules={hasShipping ? { required: 'El número es obligatorio' } : undefined}
                                render={({ field }) => (
                                  <Input 
                                    label="Número" 
                                    {...field} 
                                    variant="outlined"
                                    required={hasShipping}
                                  />
                                )}
                              />
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                              <Controller
                                name="shippingData.floor"
                                control={control}
                                render={({ field }) => (
                                  <Input 
                                    label="Piso/Dpto" 
                                    {...field} 
                                    variant="outlined"
                                    placeholder="Opcional"
                                  />
                                )}
                              />

                              <Controller
                                name="shippingData.neighborhood"
                                control={control}
                                render={({ field }) => (
                                  <Input 
                                    label="Barrio" 
                                    {...field} 
                                    variant="outlined"
                                    placeholder="Opcional"
                                  />
                                )}
                              />
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                              <Controller
                                name="shippingData.city"
                                control={control}
                                rules={hasShipping ? { required: 'La ciudad es obligatoria' } : undefined}
                                render={({ field }) => (
                                  <Input 
                                    label="Ciudad" 
                                    {...field} 
                                    variant="outlined"
                                    required={hasShipping}
                                  />
                                )}
                              />

                              <Controller
                                name="shippingData.province"
                                control={control}
                                rules={hasShipping ? { required: 'La provincia es obligatoria' } : undefined}
                                render={({ field }) => (
                                  <Input 
                                    label="Provincia" 
                                    {...field} 
                                    variant="outlined"
                                    required={hasShipping}
                                  />
                                )}
                              />

                              <Controller
                                name="shippingData.postal_code"
                                control={control}
                                rules={hasShipping ? { required: 'El código postal es obligatorio' } : undefined}
                                render={({ field }) => (
                                  <Input 
                                    label="Código Postal" 
                                    {...field} 
                                    variant="outlined"
                                    required={hasShipping}
                                  />
                                )}
                              />
                            </Box>

                            <Controller
                              name="shippingData.references"
                              control={control}
                              render={({ field }) => (
                                <Input 
                                  label="Referencias de ubicación" 
                                  {...field} 
                                  multiline
                                  minRows={2}
                                  variant="outlined"
                                  placeholder="Ej: Casa blanca con portón verde, frente a la plaza"
                                />
                              )}
                            />
                          </Box>
                        </Box>

                        <Divider sx={{ my: { xs: 0.5, sm: 0 } }} />

                        <Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={500} 
                            display="block" 
                            mb={1.5}
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            Detalles del Envío
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
                            <Controller
                              name="shippingData.shipping_type"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  label="Tipo de envío"
                                  options={[
                                    { label: 'Envío a domicilio', value: 'home' },
                                    { label: 'Retiro en sucursal', value: 'branch' },
                                    { label: 'Retiro en punto', value: 'pickup' }
                                  ]}
                                  {...field}
                                />
                              )}
                            />

                            <Controller
                              name="shippingData.cost"
                              control={control}
                              rules={hasShipping ? { required: 'El costo de envío es obligatorio' } : undefined}
                              render={({ field }) => (
                                <Input 
                                  label="Costo de envío" 
                                  type="number"
                                  {...field}
                                  value={field.value?.toString() || '0'}
                                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                  variant="outlined"
                                  required={hasShipping}
                                />
                              )}
                            />
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  )}
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
                loading={loading}
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
    </Box>
  );
}