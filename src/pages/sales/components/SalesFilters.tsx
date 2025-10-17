import { Box, Paper } from '@mui/material';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Controller, useFormContext } from 'react-hook-form';

export interface SalesFiltersProps {
  clientOptions: { label: string; value: string }[];
  visible: boolean;
}

export function SalesFilters({ clientOptions, visible }: SalesFiltersProps) {
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
              label="Buscar por cliente, producto, CUIT..." 
              variant="outlined" 
              placeholder="Nombre, CUIT, producto..." 
              {...field} 
              sx={{ mt: 0, mb: 0 }} 
            />
          )}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Estado"
              options={[
                { value: '', label: 'Todos' },
                { value: 'pendiente', label: 'Pendiente de pago' },
                { value: 'confirmado', label: 'Pago confirmado' },
                { value: 'devolucion', label: 'Devolución parcial' },
              ]}
              {...field}
              sx={{ mt: 0, mb: 0 }}
            />
          )}
        />
        <Controller
          name="client"
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
                { value: '', label: 'Todos' },
                { value: 'cambio', label: 'Cambio' },
                { value: 'falla', label: 'Falla' },
                { value: 'otro', label: 'Otro' },
              ]}
              {...field}
              sx={{ mt: 0, mb: 0 }}
            />
          )}
        />
      </Box>
    </Paper>
  );
}
