import { useState } from 'react';
import { Box, Paper } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { OutlinedButton } from '../../../components/common/OutlinedButton';
import { ContainedButton } from '../../../components/common/ContainedButton';

export interface ClientsFiltersProps {
  search: string;
  type: string | null;
  status: string | null;
  onChange: (field: 'search' | 'type' | 'status', value: string) => void;
  onCreate: () => void;
  onApply?: () => void; 
}

export function ClientsFilters({ search, type, status, onChange, onCreate, onApply }: ClientsFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleInputChange = (field: 'search' | 'type' | 'status', value: string) => {
    onChange(field, value);
  };

  return (
    <>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <OutlinedButton
          icon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </OutlinedButton>
        <ContainedButton onClick={onCreate}>Nuevo cliente</ContainedButton>
      </Box>

      {showFilters && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            <Input
              label="Buscar cliente"
              variant="outlined"
              value={search}
              onChange={(e) => handleInputChange('search', e.target.value)}
              onBlur={() => onApply && onApply()}
              placeholder="Nombre, email, razón social"
              sx={{ mt: 0, mb: 0 }}
            />

            <Select
              label="Tipo"
              value={type ?? ''}
              onChange={(e) => {
                handleInputChange('type', e.target.value as string);
                if (onApply) onApply();
              }}
              options={[
                { value: '', label: 'Todos' },
                { value: 'retailer', label: 'Minorista' },
                { value: 'wholesaler', label: 'Mayorista' },
              ]}
              sx={{ mt: 0, mb: 0 }}
            />

            <Select
              label="Estado"
              value={status ?? ''}
              onChange={(e) => {
                handleInputChange('status', e.target.value as string);
                if (onApply) onApply();
              }}
              options={[
                { value: '', label: 'Todos' },
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' },
              ]}
              sx={{ mt: 0, mb: 0 }}
            />
          </Box>
        </Paper>
      )}
    </>
  );
}
