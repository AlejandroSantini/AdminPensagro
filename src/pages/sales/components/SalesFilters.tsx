import { Box, Paper } from '@mui/material';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Controller, useFormContext } from 'react-hook-form';

export interface SalesFiltersProps {
  clientOptions: { label: string; value: string }[];
  visible: boolean;
}

export interface SalesFiltersProps {
  clientOptions: { label: string; value: string }[];
  visible: boolean;
  onFilterChange?: () => void;
}

export function SalesFilters({ clientOptions, visible, onFilterChange }: SalesFiltersProps) {
  const { control } = useFormContext();

  if (!visible) return null;

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
        <Controller
          name="search"
          control={control}
          render={({ field }) => (
            <Input 
              label="Buscar" 
              variant="outlined" 
              placeholder="ID, Comentario..." 
              {...field} 
              sx={{ mt: 0, mb: 0 }}
              onBlur={(e) => {
                field.onBlur();
                onFilterChange?.();
              }}
            />
          )}
        />
        <Controller
          name="client_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Cliente"
              options={[
                { value: '', label: 'Todos' },
                ...clientOptions
              ]}
              {...field}
              sx={{ mt: 0, mb: 0 }}
              onChange={(e) => {
                field.onChange(e);
                onFilterChange?.();
              }}
            />
          )}
        />
        <Controller
          name="discount_payment_method_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Método de Pago"
              options={[
                { value: '', label: 'Todos' },
                { value: '1', label: 'Efectivo' },
                { value: '2', label: 'Tarjeta de crédito' },
                { value: '3', label: 'Transferencia' },
              ]}
              {...field}
              sx={{ mt: 0, mb: 0 }}
              onChange={(e) => {
                field.onChange(e);
                onFilterChange?.();
              }}
            />
          )}
        />
      </Box>
    </Paper>
  );
}
