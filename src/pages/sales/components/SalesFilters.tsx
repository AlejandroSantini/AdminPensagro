import { Box } from '@mui/material';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Controller, useFormContext } from 'react-hook-form';

export interface SalesFiltersProps {
  clientOptions: { label: string; value: string }[];
}

export function SalesFilters({ clientOptions }: SalesFiltersProps) {
  const { control } = useFormContext();

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: 2,
        mb: 2,
        overflowX: 'auto',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Controller
        name="search"
        control={control}
        render={({ field }) => (
          <Input label="Buscar por cliente, producto, CUIT..." {...field} sx={{ minWidth: 220 }} variant="outlined" />
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
            value={field.value}
            onChange={field.onChange}
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
              { value: '', label: 'Todos' },
              { value: 'cambio', label: 'Cambio' },
              { value: 'falla', label: 'Falla' },
              { value: 'otro', label: 'Otro' },
            ]}
            value={field.value}
            onChange={field.onChange}
            sx={{ minWidth: 180 }}
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
            value={field.value}
            onChange={field.onChange}
            sx={{ minWidth: 180 }}
          />
        )}
      />
    </Box>
  );
}
