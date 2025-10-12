import { Box, Typography, IconButton, Tooltip, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/ArchiveOutlined';
import { Table } from '../../../components/common/Table';
import { Input } from '../../../components/common/Input';
import { ContainedButton } from '../../../components/common/ContainedButton';
import { useForm, Controller } from 'react-hook-form';


// Mock products for combo selection
const MOCK_PRODUCTS = [
  { id: 1, name: 'Manzana', price: 2 },
  { id: 2, name: 'Lechuga', price: 1 },
  { id: 3, name: 'Queso', price: 5 },
  { id: 4, name: 'Naranja', price: 2 },
];

interface Combo {
  id: number;
  name: string;
  description: string;
  products: { id: number; name: string; price: number }[];
  price: number;
  featured: boolean;
  status: 'active' | 'archived';
}

interface ComboFormData {
  name: string;
  description: string;
  products: number[];
  price: string;
  featured: boolean;
}

const MOCK_COMBOS: Combo[] = [
  {
    id: 1,
    name: 'Combo Saludable',
    description: 'Manzana + Lechuga + Queso',
    products: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1], MOCK_PRODUCTS[2]],
    price: 7,
    featured: true,
    status: 'active',
  },
  {
    id: 2,
    name: 'Combo Citrico',
    description: 'Naranja + Manzana',
    products: [MOCK_PRODUCTS[3], MOCK_PRODUCTS[0]],
    price: 4,
    featured: false,
    status: 'archived',
  },
];

export default function CombosTab() {
  const { handleSubmit, control, reset, formState: { errors }, setError } = useForm<ComboFormData>({
    defaultValues: {
      name: '',
      description: '',
      products: [],
      price: '',
      featured: false,
    },
  });

  const onSubmit = (data: ComboFormData) => {
    if (!data.name || !data.products.length || !data.price) {
      setError('name', { message: 'Completa los campos obligatorios' });
      return;
    }
    // TODO: enviar datos al backend
    alert('Combo cargado: ' + JSON.stringify(data, null, 2));
    reset();
  };

  const handleEdit = (combo: Combo) => {
    alert('Editar combo: ' + combo.name);
  };
  const handleArchive = (combo: Combo) => {
    alert('Archivar combo: ' + combo.name);
  };

  return (
    <Box>
      <Box mb={4}>
        <Typography fontWeight={600} mb={2}>Cargar nuevo combo</Typography>
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
                name="price"
                control={control}
                rules={{ required: 'El precio es obligatorio' }}
                render={({ field }) => (
                  <Input label="Precio total (USD)" type="number" {...field} sx={{ mb: 2 }} variant="outlined" required error={!!errors.price} helperText={errors.price?.message} />
                )}
              />
              <Controller
                name="products"
                control={control}
                rules={{ required: 'Selecciona al menos un producto' }}
                render={({ field }) => (
                  <Input
                    label="Productos"
                    select
                    SelectProps={{ multiple: true }}
                    {...field}
                    value={field.value as (string | number)[] || []}
                    sx={{ mb: 2 }}
                    variant="outlined"
                    required
                    error={!!errors.products}
                    helperText={errors.products?.message}
                  >
                    {MOCK_PRODUCTS.map(p => (
                      <MenuItem key={p.id} value={p.id}>{p.name} (${p.price})</MenuItem>
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
                    label="Destacado"
                    sx={{ mb: 2, ml: 0 }}
                  />
                )}
              />
            </Box>
          </Box>
          <ContainedButton type="submit">Cargar combo</ContainedButton>
        </form>
      </Box>
      <Table
        columns={[
          { label: 'Nombre', render: c => c.name },
          { label: 'Productos', render: c => c.products.map((p: any) => p.name).join(', ') },
          { label: 'Precio', render: c => `$${c.price}` },
          { label: 'Destacado', render: c => c.featured ? 'Sí' : 'No' },
          { label: 'Estado', render: c => c.status === 'active' ? 'Activo' : 'Archivado' },
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
        data={MOCK_COMBOS}
        getRowKey={c => c.id}
        emptyMessage="No hay combos"
      />
    </Box>
  );
}
