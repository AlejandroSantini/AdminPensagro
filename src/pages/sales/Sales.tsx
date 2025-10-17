import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { CustomPaper } from '../../components/common/CustomPaper';
import { Table } from '../../components/common/Table';
import { ContainedButton } from '../../components/common/ContainedButton';
import { OutlinedButton } from '../../components/common/OutlinedButton';
import { useForm, FormProvider } from 'react-hook-form';
import { SalesFilters } from './components/SalesFilters';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getSalesRoute } from '../../services/sales';

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
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const methods = useForm({ 
    defaultValues: { 
      search: '', 
      status: '', 
      motivo: '', 
      client: '' 
    } 
  });
  
  const { handleSubmit, watch } = methods;

  // Define the filter type for better type safety
  interface SalesFilters {
    search: string;
    status: string;
    motivo: string;
    client: string;
  }

  // Load sales with form values as an argument instead of a dependency
  const loadSales = useCallback(async (filterValues: SalesFilters) => {
    setLoading(true);
    try {
      // En una app real se obtendría de la API
      // const res = await api.get(getSalesRoute(), { params: filterValues });
      // setSales(res.data.data || []);
      
      // Filtramos el mock data
      const filteredSales = MOCK_SALES.filter(sale => {
        const matchClient = !filterValues.client || sale.client === MOCK_CLIENTS.find(c => c.value === filterValues.client)?.label;
        const matchStatus = !filterValues.status || sale.status === filterValues.status;
        const matchSearch = !filterValues.search || sale.client.toLowerCase().includes(filterValues.search.toLowerCase()) || sale.product.toLowerCase().includes(filterValues.search.toLowerCase()) || sale.cuit.includes(filterValues.search);
        return matchClient && matchStatus && matchSearch;
      });
      
      setSales(filteredSales);
    } catch (e) {
      console.error('Error al cargar ventas:', e);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Apply filters when user submits the form
  const onSubmit = (data: SalesFilters) => {
    loadSales(data);
  };

  // Initial load of sales
  useEffect(() => {
    loadSales({ search: '', status: '', motivo: '', client: '' });
  }, [loadSales]);

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
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <OutlinedButton 
            icon={<FilterListIcon />} 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </OutlinedButton>
          <Box display="flex" alignItems="center">
            <Tooltip sx={{ mr: 1 }} title="Exportar CSV">
              <IconButton color="primary" onClick={handleExport}>
                <DownloadIcon/>
              </IconButton>
            </Tooltip>
            <ContainedButton startIcon={<AddIcon />} onClick={handleNewSale}>
              Cargar venta
            </ContainedButton>
          </Box>
        </Box>
        
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <SalesFilters clientOptions={MOCK_CLIENTS} visible={showFilters} />
            {showFilters && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <ContainedButton 
                  type="submit" 
                  startIcon={<SearchIcon />}
                >
                  Aplicar filtros
                </ContainedButton>
              </Box>
            )}
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
          data={sales}
          getRowKey={s => s.id}
          onRowClick={handleEditSale}
          emptyMessage={loading ? "Cargando..." : "No hay ventas"}
        />
      </CustomPaper>
    </Box>
  );
}
