
import { Box, Typography, Paper, Divider, IconButton, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Input } from '../../components/common/Input';
import { ContainedButton } from '../../components/common/ContainedButton';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface BusinessSettingsForm {
  usdToArs: string;
  alias: string;
  cbu: string;
  pickupAddress: string;
  freeShippingMinorista: string;
  freeShippingMayorista: string;
  notificationEmails: { email: string }[];
}

const DEFAULT_VALUES: BusinessSettingsForm = {
  usdToArs: '',
  alias: '',
  cbu: '',
  pickupAddress: '',
  freeShippingMinorista: '',
  freeShippingMayorista: '',
  notificationEmails: [{ email: '' }],
};
export default function BusinessSettings() {
  const { handleSubmit, control, formState: { errors } } = useForm<BusinessSettingsForm>({
    defaultValues: DEFAULT_VALUES,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'notificationEmails',
  });

  const onSubmit = (data: BusinessSettingsForm) => {
    alert('Configuración guardada: ' + JSON.stringify(data, null, 2));
  };

  return (
    <Box maxWidth={800} mx="auto" mt={2}>
      <Typography variant="h5" fontWeight={600} mb={2}>Configuración del Negocio</Typography>
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, border: '1px solid #e0e0e0', background: '#fff', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <Grid container spacing={2}>
            <Grid>
              <Controller
                name="usdToArs"
                control={control}
                rules={{ required: 'Obligatorio' }}
                render={({ field }) => (
                  <Input label="Tipo de cambio USD → ARS" type="number" variant="outlined" {...field} error={!!errors.usdToArs} helperText={errors.usdToArs?.message} />
                )}
              />
              <Controller
                name="alias"
                control={control}
                render={({ field }) => (
                  <Input label="Alias (CBU)" variant="outlined" {...field} />
                )}
              />
              <Controller
                name="cbu"
                control={control}
                render={({ field }) => (
                  <Input label="CBU" variant="outlined" {...field} />
                )}
              />
              <Controller
                name="pickupAddress"
                control={control}
                render={({ field }) => (
                  <Input label="Dirección de retiro del local" variant="outlined" {...field} />
                )}
              />
            </Grid>
            <Grid>
              <Typography fontWeight={500} mb={1}>Lógica de envío gratis</Typography>
              <Controller
                name="freeShippingMinorista"
                control={control}
                render={({ field }) => (
                  <Input label="Envío gratis minorista (compra mínima $)" type="number" variant="outlined" {...field} />
                )}
              />
              <Controller
                name="freeShippingMayorista"
                control={control}
                render={({ field }) => (
                  <Input label="Envío gratis mayorista (compra mínima $)" type="number" variant="outlined" {...field} />
                )}
              />
              <Divider sx={{ my: 2 }} />
              <Typography fontWeight={500} mb={1}>Emails de notificación de compra</Typography>
              {fields.map((item, idx) => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Controller
                    name={`notificationEmails.${idx}.email` as const}
                    control={control}
                    rules={{ required: 'Email requerido' }}
                    render={({ field }) => (
                      <Input label={`Email ${idx + 1}`} variant="outlined" {...field} error={!!errors.notificationEmails?.[idx]?.email} helperText={errors.notificationEmails?.[idx]?.email?.message} sx={{ flex: 1, mb: 0 }} />
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
              <ContainedButton type="submit">Guardar configuración</ContainedButton>
              </Box>
            </Grid>
          </Grid>
          
        </form>
      </Paper>
    </Box>
  );
}
