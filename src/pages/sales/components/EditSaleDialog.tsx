import { Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import { OutlinedButton } from '../../../components/common/OutlinedButton';
import { ContainedButton } from '../../../components/common/ContainedButton';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { useEffect } from 'react';

interface EditSaleDialogProps {
  open: boolean;
  sale: any;
  onClose: () => void;
  onSave: (data: any) => void;
  clientOptions: { label: string; value: string }[];
  productOptions: { label: string; value: string }[];
}

export function EditSaleDialog({ open, sale, onClose, onSave, clientOptions, productOptions }: EditSaleDialogProps) {
  const methods = useForm({
    defaultValues: sale || { client: '', product: '', quantity: '', price: '', status: '', motivo: '', comentario: '' },
  });
  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    reset(sale || { client: '', product: '', quantity: '', price: '', status: '', motivo: '', comentario: '' });
  }, [sale, reset]);

  const handleFormSubmit = (data: any) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: 'none' } } }}>
      <DialogTitle sx={{ fontWeight: 500, color: 'text.primary', pb: 0 }}>Editar venta</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <FormProvider {...methods}>
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="client"
              control={control}
              render={({ field }) => (
                <Select label="Cliente" options={clientOptions} {...field} sx={{ minWidth: 180 }} />
              )}
            />
            <Controller
              name="product"
              control={control}
              render={({ field }) => (
                <Select label="Producto" options={productOptions} {...field} sx={{ minWidth: 180 }} />
              )}
            />
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <Input label="Cantidad" type="number" variant="outlined" {...field} />
              )}
            />
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <Input label="Precio unitario" type="number" variant="outlined" {...field} />
              )}
            />
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
          </Box>
        </FormProvider>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <ContainedButton onClick={handleSubmit(handleFormSubmit)} type="button">Guardar</ContainedButton>
        <OutlinedButton onClick={onClose}>Cancelar</OutlinedButton>
      </DialogActions>
    </Dialog>
  );
}
