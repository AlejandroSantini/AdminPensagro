import { useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import { CustomPaper } from '../../components/common/CustomPaper';
import { Table } from '../../components/common/Table';
import { ContainedButton } from '../../components/common/ContainedButton';
import { useForm, FormProvider } from 'react-hook-form';
import { SalesFilters } from './components/SalesFilters';
import { useNavigate } from 'react-router-dom';

// Mock data
const MOCK_CLIENTS = [
  { label: 'Juan Perez', value: '1' },
  { label: 'Ana Lopez', value: '2' },
];
const MOCK_PRODUCTS = [
  { label: 'Producto 1', value: 'SKU001' },
  { label: 'Producto 2', value: 'SKU002' },
];
const MOCK_SALES = [
  {
    id: 1,
    date: '2025-10-10',
    client: 'Juan Perez',
    cuit: '20-12345678-9',
    product: 'Producto 1',
    quantity: 2,
    price: 10,
    status: 'pendiente',
    motivo: '',
  },
  {
    id: 2,
    date: '2025-10-11',
    client: 'Ana Lopez',
    cuit: '27-87654321-0',
    product: 'Producto 2',
    quantity: 1,
    price: 20,
    status: 'confirmado',
    motivo: '',
  },
];

export default function Sales() {
  const navigate = useNavigate();
  const [sales, setSales] = useState(MOCK_SALES);
  const methods = useForm({ defaultValues: { search: '', status: '', motivo: '', client: '' } });
  const { handleSubmit, watch } = methods;

  // Filtros (mock, solo filtra por cliente y estado)
  const filters = watch();
  const filteredSales = sales.filter(sale => {
    const matchClient = !filters.client || sale.client === MOCK_CLIENTS.find(c => c.value === filters.client)?.label;
    const matchStatus = !filters.status || sale.status === filters.status;
    const matchSearch = !filters.search || sale.client.toLowerCase().includes(filters.search.toLowerCase()) || sale.product.toLowerCase().includes(filters.search.toLowerCase()) || sale.cuit.includes(filters.search);
    return matchClient && matchStatus && matchSearch;
  });

  const handleExport = () => {
    // Implementar la lógica de exportación aquí
  };

  const handleNewSale = () => {
    navigate('/ventas/nueva');
  };

  const handleEditSale = (sale: any) => {
    navigate(`/ventas/${sale.id}`);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" color="text.primary" sx={{ flexGrow: 1, mb: 2 }}>
        Ventas
      </Typography>
      <CustomPaper>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Tooltip title="Exportar CSV">
            <IconButton color="primary" onClick={handleExport} sx={{ mr: 2 }}>
              <DownloadIcon/>
            </IconButton>
          </Tooltip>
          <ContainedButton startIcon={<AddIcon />} onClick={handleNewSale}>
            Cargar venta offline
          </ContainedButton>
        </Box>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(() => {})}>
            <SalesFilters clientOptions={MOCK_CLIENTS} />
          </form>
        </FormProvider>
        <Table
          columns={[
            { label: 'Fecha', render: s => s.date },
            { label: 'Cliente', render: s => s.client },
            { label: 'CUIT', render: s => s.cuit },
            { label: 'Producto', render: s => s.product },
            { label: 'Cantidad', render: s => s.quantity },
            { label: 'Precio', render: s => `$${s.price}` },
            { label: 'Estado', render: s => {
              if (s.status === 'pendiente') return 'Pendiente de pago';
              if (s.status === 'confirmado') return 'Pago confirmado';
              if (s.status === 'devolucion') return 'Devolución parcial';
              return s.status;
            } },
            { label: 'Motivo', render: s => s.motivo || '-' },
          ]}
          data={filteredSales}
          getRowKey={s => s.id}
          onRowClick={handleEditSale}
          emptyMessage="No hay ventas"
        />

      </CustomPaper>
    </Box>
  );
}
