import { Dialog, DialogTitle, DialogContent, DialogActions, Box, MenuItem } from '@mui/material';
import { Input } from '../../../components/common/Input';
import { ContainedButton } from '../../../components/common/ContainedButton';
import { useForm, Controller, FormProvider } from 'react-hook-form';

interface ManualSaleForm {
  client: string;
  product: string;
  quantity: string;
  price: string;
}

interface ManualSaleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ManualSaleForm) => void;
  clientOptions: { label: string; value: string }[];
  productOptions: { label: string; value: string }[];
}

export function ManualSaleDialog({ open, onClose, onSave, clientOptions, productOptions }: ManualSaleDialogProps) {
  const methods = useForm<ManualSaleForm>({ defaultValues: { client: '', product: '', quantity: '', price: '' } });
  const { handleSubmit, control, reset } = methods;

  const handleFormSubmit = (data: ManualSaleForm) => {
    onSave(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cargar venta offline</DialogTitle>
      <DialogContent>
        <FormProvider {...methods}>
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 1 }}>
            <Controller
              name="client"
              control={control}
              render={({ field }) => (
                <Input label="Cliente" select {...field} sx={{ mb: 2 }} variant="outlined" required>
                  {clientOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Input>
              )}
            />
            <Controller
              name="product"
              control={control}
              render={({ field }) => (
                <Input label="Producto" select {...field} sx={{ mb: 2 }} variant="outlined" required>
                  {productOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Input>
              )}
            />
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <Input label="Cantidad" type="number" {...field} sx={{ mb: 2 }} variant="outlined" required />
              )}
            />
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <Input label="Precio unitario" type="number" {...field} sx={{ mb: 2 }} variant="outlined" required />
              )}
            />
            <DialogActions sx={{ px: 0, pb: 0, pt: 2 }}>
              <ContainedButton type="submit">Cargar venta</ContainedButton>
              <ContainedButton type="button" color="secondary" onClick={onClose}>Cancelar</ContainedButton>
            </DialogActions>
          </Box>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
