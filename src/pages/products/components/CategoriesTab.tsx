import { Box, Typography, IconButton, Tooltip, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/ArchiveOutlined';
import { Table } from '../../../components/common/Table';
import { Input } from '../../../components/common/Input';
import { ContainedButton } from '../../../components/common/ContainedButton';
import { useForm, Controller } from 'react-hook-form';



interface Category {
  id: number;
  name: string;
  description: string;
  featured: boolean;
  status: 'active' | 'archived';
  parentId?: number | null;
}

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Frutas', description: 'Frutas frescas y de estación', featured: true, status: 'active', parentId: null },
  { id: 2, name: 'Verduras', description: 'Verduras orgánicas', featured: false, status: 'active', parentId: null },
  { id: 3, name: 'Lácteos', description: 'Productos lácteos', featured: false, status: 'archived', parentId: null },
  { id: 4, name: 'Cítricos', description: 'Naranjas, limones, pomelos', featured: false, status: 'active', parentId: 1 },
  { id: 5, name: 'Hojas', description: 'Lechuga, espinaca, rúcula', featured: false, status: 'active', parentId: 2 },
];


interface CategoryFormData {
  name: string;
  description: string;
  featured: boolean;
  parentId: string | number;
}

export default function CategoriesTab() {
  const { handleSubmit, control, reset, formState: { errors }, setError } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      featured: false,
      parentId: '',
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    if (!data.name) {
      setError('name', { message: 'El nombre es obligatorio' });
      return;
    }
    // TODO: enviar datos al backend
    alert('Categoría cargada: ' + JSON.stringify(data, null, 2));
    reset();
  };

  const handleEdit = (cat: Category) => {
    alert('Editar categoría: ' + cat.name);
  };
  const handleArchive = (cat: Category) => {
    alert('Archivar categoría: ' + cat.name);
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography fontWeight={600} mb={2}>Cargar nueva categoría</Typography>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'El nombre es obligatorio' }}
                render={({ field }) => (
                  <Input label="Nombre" {...field} sx={{ mb: 2 }} variant="outlined" required error={!!errors.name} helperText={errors.name?.message} />
                )}
              />
              <Controller
                name="parentId"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Categoría padre"
                    select
                    {...field}
                    value={field.value || ''}
                    sx={{ mb: 2 }}
                    variant="outlined"
                  >
                    <MenuItem value="">Sin categoría padre</MenuItem>
                    {MOCK_CATEGORIES.filter(c => !c.parentId).map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Input>
                )}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input label="Descripción" multiline minRows={2} {...field} sx={{ mb: 2 }} variant="outlined" />
                )}
              />
              <Controller
                name="featured"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox checked={!!field.value} onChange={e => field.onChange(e.target.checked)} name="featured" color="primary" />}
                    label="Destacada"
                    sx={{ mb: 2, ml: 0 }}
                  />
                )}
              />
            </Box>
          </Box>
          <ContainedButton type="submit">Cargar categoría</ContainedButton>
        </form>
      </Box>
      <Table
        columns={[
          { label: 'Nombre', render: c => c.name },
          { label: 'Descripción', render: c => c.description },
          { label: 'Padre', render: c => {
            const parent = MOCK_CATEGORIES.find(cat => cat.id === c.parentId);
            return parent ? parent.name : '-';
          } },
          { label: 'Destacada', render: c => c.featured ? 'Sí' : 'No' },
          { label: 'Estado', render: c => c.status === 'active' ? 'Activa' : 'Archivada' },
          {
            label: 'Acciones',
            render: c => (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Editar">
                  <IconButton color="primary" size="small" sx={{ boxShadow: 'none' }} onClick={() => handleEdit(c)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Archivar">
                  <IconButton color="secondary" size="small" sx={{ boxShadow: 'none' }} onClick={() => handleArchive(c)}>
                    <ArchiveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ),
            align: 'center',
          },
        ]}
        data={MOCK_CATEGORIES}
        getRowKey={c => c.id}
        emptyMessage="No hay categorías"
      />
    </Box>
  );
}
