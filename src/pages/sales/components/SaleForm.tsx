import { useState, useEffect } from 'react';
import { Box, Typography, Paper, MenuItem, IconButton } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm, FormProvider } from 'react-hook-form';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Input } from '../../../components/common/Input';
import { ContainedButton } from '../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../components/common/OutlinedButton';
import { Select } from '../../../components/common/Select';

// Mock data (in a real app, this would come from an API)
const MOCK_CLIENTS = [
  { label: 'Juan Perez', value: '1' },
  { label: 'Ana Lopez', value: '2' },
];

const MOCK_PRODUCTS = [
  { label: 'Producto 1', value: 'SKU001' },
  { label: 'Producto 2', value: 'SKU002' },
];

const MOCK_SALES = [
  {
    id: '1',
    date: '2025-10-10',
    client: '1',
    clientName: 'Juan Perez',
    cuit: '20-12345678-9',
    product: 'SKU001',
    productName: 'Producto 1',
    quantity: '2',
    price: '10',
    status: 'pendiente',
    motivo: '',
    comentario: ''
  },
  {
    id: '2',
    date: '2025-10-11',
    client: '2',
    clientName: 'Ana Lopez',
    cuit: '27-87654321-0',
    product: 'SKU002',
    productName: 'Producto 2',
    quantity: '1',
    price: '20',
    status: 'confirmado',
    motivo: '',
    comentario: ''
  },
];

interface SaleFormData {
  client: string;
  product: string;
  quantity: string;
  price: string;
  status?: string;
  motivo?: string;
  comentario?: string;
}

export default function SaleForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  
  const isEditMode = !!id;
  const pageTitle = isEditMode ? 'Editar Venta' : 'Nueva Venta';
  const buttonText = isEditMode ? 'Guardar Cambios' : 'Cargar Venta';
  
  const methods = useForm<SaleFormData>({
    defaultValues: {
      client: '',
      product: '',
      quantity: '',
      price: '',
      status: 'pendiente',
      motivo: '',
      comentario: ''
    }
  });
  
  const { handleSubmit, control, reset, formState: { errors } } = methods;

  // Load sale data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      // In a real app, you would fetch the sale data from an API
      const sale = MOCK_SALES.find(s => s.id === id);
      if (sale) {
        reset({
          client: sale.client,
          product: sale.product,
          quantity: sale.quantity,
          price: sale.price,
          status: sale.status,
          motivo: sale.motivo,
          comentario: sale.comentario
        });
      }
    }
  }, [id, reset, isEditMode]);

  const onSubmit = async (data: SaleFormData) => {
    setLoading(true);
    try {
      // In a real app, you would post/put to an API
      console.log('Submitting sale data:', data);
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoading(false);
      navigate('/ventas');
    } catch (e) {
      setLoading(false);
      console.error('Error saving sale:', e);
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
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', background: '#fff', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}>
        <FormProvider {...methods}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="client"
              control={control}
              rules={{ required: 'El cliente es obligatorio' }}
              render={({ field }) => (
                <Select 
                  label="Cliente" 
                  options={MOCK_CLIENTS} 
                  {...field} 
                  sx={{ minWidth: 180 }}
                  required
                  error={!!errors.client}
                />
              )}
            />
            
            <Controller
              name="product"
              control={control}
              rules={{ required: 'El producto es obligatorio' }}
              render={({ field }) => (
                <Select 
                  label="Producto" 
                  options={MOCK_PRODUCTS} 
                  {...field} 
                  sx={{ minWidth: 180 }}
                  required
                  error={!!errors.product}
                />
              )}
            />
            
            <Controller
              name="quantity"
              control={control}
              rules={{ 
                required: 'La cantidad es obligatoria',
                min: { value: 1, message: 'La cantidad debe ser mayor que 0' }
              }}
              render={({ field }) => (
                <Input 
                  label="Cantidad" 
                  type="number" 
                  variant="outlined" 
                  {...field} 
                  required
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message}
                />
              )}
            />
            
            <Controller
              name="price"
              control={control}
              rules={{ 
                required: 'El precio es obligatorio',
                min: { value: 0, message: 'El precio no puede ser negativo' }
              }}
              render={({ field }) => (
                <Input 
                  label="Precio unitario" 
                  type="number" 
                  variant="outlined" 
                  {...field} 
                  required
                  error={!!errors.price}
                  helperText={errors.price?.message}
                />
              )}
            />
            
            {isEditMode && (
              <>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Estado"
                      options={[
                        { value: 'pendiente', label: 'Pendiente de pago' },
                        { value: 'confirmado', label: 'Pago confirmado' },
                        { value: 'devolucion', label: 'Devolución parcial' },
                      ]}
                      {...field}
                      sx={{ minWidth: 180 }}
                    />
                  )}
                />
                
                <Controller
                  name="motivo"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Motivo"
                      options={[
                        { value: '', label: 'Sin motivo' },
                        { value: 'cambio', label: 'Cambio' },
                        { value: 'falla', label: 'Falla' },
                        { value: 'otro', label: 'Otro' },
                      ]}
                      {...field}
                      sx={{ minWidth: 180 }}
                    />
                  )}
                />
                
                <Controller
                  name="comentario"
                  control={control}
                  render={({ field }) => (
                    <Input label="Comentario" multiline minRows={2} variant="outlined" {...field} />
                  )}
                />
              </>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
              <OutlinedButton onClick={handleCancel} disabled={loading}>
                Cancelar
              </OutlinedButton>
              <ContainedButton type="submit" disabled={loading}>
                {buttonText}
              </ContainedButton>
            </Box>
          </Box>
        </FormProvider>
      </Paper>
    </Box>
  );
}