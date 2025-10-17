
import { useState, useEffect } from 'react';
import { Box, Typography, Divider, IconButton, Tooltip, CircularProgress, Alert, Grid } from '@mui/material';
import { Input } from '../../components/common/Input';
import { CustomPaper } from '../../components/common/CustomPaper';
import { ContainedButton } from '../../components/common/ContainedButton';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';
import { getConfigRoute, putConfigRoute } from '../../services/config';

interface BusinessSettingsForm {
  usd_ars_rate: string;
  alias: string;
  cbu: string;
  pickup_address: string;
  free_shipping_threshold_retailer: string;
  free_shipping_threshold_wholesaler: string;
  purchase_notify_emails: { email: string }[];
}

const DEFAULT_VALUES: BusinessSettingsForm = {
  usd_ars_rate: '',
  alias: '',
  cbu: '',
  pickup_address: '',
  free_shipping_threshold_retailer: '',
  free_shipping_threshold_wholesaler: '',
  purchase_notify_emails: [{ email: '' }],
};
export default function BusinessSettings() {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const { handleSubmit, control, reset, formState: { errors } } = useForm<BusinessSettingsForm>({
    defaultValues: DEFAULT_VALUES,
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'purchase_notify_emails',
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(getConfigRoute());
      if (response.data && response.data.status === true) {
        const config = response.data.data;
        
        const emailsArray = Array.isArray(config.purchase_notify_emails) 
          ? config.purchase_notify_emails.map((email: string) => ({ email }))
          : [{ email: '' }];
          
        reset({
          usd_ars_rate: config.usd_ars_rate || '',
          alias: config.alias || '',
          cbu: config.cbu || '',
          pickup_address: config.pickup_address || '',
          free_shipping_threshold_retailer: config.free_shipping_threshold_retailer || '',
          free_shipping_threshold_wholesaler: config.free_shipping_threshold_wholesaler || '',
          purchase_notify_emails: emailsArray,
        });
      } else {
        setError('No se pudo cargar la configuración');
      }
    } catch (err) {
      console.error('Error loading config:', err);
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BusinessSettingsForm) => {
    setSaveLoading(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      const payload = {
        usd_ars_rate: data.usd_ars_rate,
        alias: data.alias,
        cbu: data.cbu,
        pickup_address: data.pickup_address,
        free_shipping_threshold_retailer: data.free_shipping_threshold_retailer,
        free_shipping_threshold_wholesaler: data.free_shipping_threshold_wholesaler,
        purchase_notify_emails: data.purchase_notify_emails.map(item => item.email),
      };
      
      const response = await api.put(putConfigRoute(), payload);
      if (response.data && response.data.status === true) {
        setSaveSuccess(true);
      } else {
        setError('No se pudo guardar la configuración');
      }
    } catch (err) {
      console.error('Error saving config:', err);
      setError('Error al guardar la configuración');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Box maxWidth={800} mx="auto" mt={2}>
      <Typography variant="h5" fontWeight={600} mb={2}>Configuración del Negocio</Typography>
      <CustomPaper>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>Configuración guardada exitosamente</Alert>
        )}
        
        {!loading && (
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Primera sección - Datos básicos - 2 columnas */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Controller
                    name="usd_ars_rate"
                    control={control}
                    rules={{ required: 'Obligatorio' }}
                    render={({ field }) => (
                      <Input 
                        label="Tipo de cambio USD → ARS" 
                        type="number" 
                        variant="outlined" 
                        {...field} 
                        error={!!errors.usd_ars_rate} 
                        helperText={errors.usd_ars_rate?.message} 
                      />
                    )}
                  />
                  <Controller
                    name="alias"
                    control={control}
                    render={({ field }) => (
                      <Input label="Alias (CBU)" variant="outlined" {...field} />
                    )}
                  />
                </Box>
                
                <Box sx={{ flex: '1 1 300px' }}>
                  <Controller
                    name="cbu"
                    control={control}
                    render={({ field }) => (
                      <Input label="CBU" variant="outlined" {...field} />
                    )}
                  />
                  <Controller
                    name="pickup_address"
                    control={control}
                    render={({ field }) => (
                      <Input label="Dirección de retiro del local" variant="outlined" {...field} />
                    )}
                  />
                </Box>
              </Box>
              
              {/* Segunda sección - Lógica de envío - ancho completo */}
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography fontWeight={500} mb={2}>Lógica de envío gratis</Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Controller
                      name="free_shipping_threshold_retailer"
                      control={control}
                      render={({ field }) => (
                        <Input label="Envío gratis minorista (compra mínima $)" type="number" variant="outlined" fullWidth {...field} />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Controller
                      name="free_shipping_threshold_wholesaler"
                      control={control}
                      render={({ field }) => (
                        <Input label="Envío gratis mayorista (compra mínima $)" type="number" variant="outlined" fullWidth {...field} />
                      )}
                    />
                  </Box>
                </Box>
              </Box>
              
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography fontWeight={500} mb={2}>Emails de notificación de compra</Typography>
                {fields.map((item, idx) => (
                  <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Controller
                      name={`purchase_notify_emails.${idx}.email` as const}
                      control={control}
                      rules={{ required: 'Email requerido' }}
                      render={({ field }) => (
                        <Input 
                          label={`Email ${idx + 1}`} 
                          variant="outlined" 
                          {...field} 
                          error={!!errors.purchase_notify_emails?.[idx]?.email} 
                          helperText={errors.purchase_notify_emails?.[idx]?.email?.message} 
                          sx={{ flex: 1, mb: 0 }} 
                        />
                      )}
                    />
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => remove(idx)} disabled={fields.length === 1} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <ContainedButton type="button" icon={<AddIcon />} onClick={() => append({ email: '' })}>
                  Agregar email
                </ContainedButton>
                <ContainedButton type="submit" disabled={saveLoading}>
                  {saveLoading ? <CircularProgress size={20} color="inherit" /> : 'Guardar configuración'}
                </ContainedButton>
                </Box>
              </Box>
            </Box>
          </form>
        )}
      </CustomPaper>
    </Box>
  );
}
