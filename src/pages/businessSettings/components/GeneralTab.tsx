import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Input } from '../../../components/common/Input';
import AddIcon from '@mui/icons-material/Add';
import { ContainedButton } from '../../../components/common/ContainedButton';
import DeleteButton from '../../../components/common/DeleteButton';

interface GeneralTabProps {
  control: any;
  errors: any;
  cbusFields: any[];
  appendCbu: (v: any) => void;
  removeCbu: (idx: number) => void;
  emailFields: any[];
  appendEmail: (v: any) => void;
  removeEmail: (idx: number) => void;
  onSaveGeneral: () => void;
  saveLoading: boolean;
}

export default function GeneralTab({ control, errors, cbusFields, appendCbu, removeCbu, emailFields, appendEmail, removeEmail, onSaveGeneral, saveLoading }: GeneralTabProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Box>
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
                error={!!errors?.usd_ars_rate}
                helperText={errors?.usd_ars_rate?.message as any}
              />
            )}
          />
        </Box>

        <Box>
          <Controller
            name="pickup_address"
            control={control}
            render={({ field }) => (
              <Input label="Dirección de retiro del local" variant="outlined" fullWidth {...field} />
            )}
          />
        </Box>

        <Box sx={{ gridColumn: '1 / -1', mb: 2 }}>
          <Typography fontWeight={500} mb={1}>Cuentas bancarias</Typography>
          {cbusFields.map((item, idx) => (
            <Box key={item.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 40px' }, gap: 2, alignItems: 'start'}}>
              <Box>
                <Controller
                  name={`cbus.${idx}.alias` as const}
                  control={control}
                  render={({ field }) => (
                    <Input label="Alias" variant="outlined" fullWidth {...field} />
                  )}
                />
              </Box>
              <Box>
                <Controller
                  name={`cbus.${idx}.cbu` as const}
                  control={control}
                  render={({ field }) => (
                    <Input label="CBU" variant="outlined" fullWidth {...field} />
                  )}
                />
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <DeleteButton onClick={() => removeCbu(idx)} disabled={cbusFields.length === 1} />
              </Box>
            </Box>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1, mt: 1, mb: 2 }}>
            <ContainedButton type="button" icon={<AddIcon />} onClick={() => appendCbu({ alias: '', cbu: '' })}>
              Agregar CBU
            </ContainedButton>
          </Box>
        </Box>
      </Box>

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
        {emailFields.map((item, idx) => (
          <Box key={item.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 40px' }, gap: 2, alignItems: 'center', mb: 2 }}>
            <Controller
              name={`purchase_notify_emails.${idx}.email` as const}
              control={control}
              rules={{ required: 'Email requerido' }}
              render={({ field }) => (
                <Input
                  label={`Email ${idx + 1}`}
                  variant="outlined"
                  {...field}
                  error={!!errors?.purchase_notify_emails?.[idx]?.email}
                  helperText={errors?.purchase_notify_emails?.[idx]?.email?.message as any}
                  sx={{ mb: 0 }}
                />
              )}
            />
            <Box sx={{ textAlign: 'right' }}>
              <DeleteButton onClick={() => removeEmail(idx)} disabled={emailFields.length === 1} />
            </Box>
          </Box>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <ContainedButton type="button" icon={<AddIcon />} onClick={() => appendEmail({ email: '' })}>
            Agregar email
          </ContainedButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <ContainedButton type="button" onClick={onSaveGeneral} loading={saveLoading}>
          Guardar configuración
        </ContainedButton>
      </Box>
    </Box>
  );
}
