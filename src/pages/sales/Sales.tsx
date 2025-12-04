import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { CustomPaper } from '../../components/common/CustomPaper';
import { Table } from '../../components/common/Table';
import { Paginator } from '../../components/common/Paginator';
import { ContainedButton } from '../../components/common/ContainedButton';
import { OutlinedButton } from '../../components/common/OutlinedButton';
import { useForm, FormProvider } from 'react-hook-form';
import { SalesFilters } from './components/SalesFilters';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getSalesRoute, exportSalesRoute } from '../../services/sales';
import { postManualPaymentRoute } from '../../services/payments';
import { getClientsRoute } from '../../services/clients';

export default function Sales() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientOptions, setClientOptions] = useState<{label: string, value: string}[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const methods = useForm({ 
    defaultValues: { 
      search: '', 
      client_id: '', 
      discount_payment_method_id: '' 
    } 
  });

  const { handleSubmit, watch } = methods;

  interface SalesFiltersType {
    search: string;
    client_id: string;
    discount_payment_method_id: string;
  }

  const loadSales = useCallback(async (filterValues: SalesFiltersType, pageNum: number = 1) => {
    setLoading(true);
    try {
      const res = await api.get(getSalesRoute(), { params: { ...filterValues, page: pageNum, per_page: 10 } });
      // La respuesta puede venir como data.sales o directamente como data (array)
      const salesData = res.data.data?.sales || res.data.data || [];
      setSales(Array.isArray(salesData) ? salesData : []);
      
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalItems(res.data.meta.totalItems || 0);
      }
    } catch (e) {
      console.error('Error al cargar ventas:', e);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onSubmit = (data: SalesFiltersType) => {
    setPage(1);
    loadSales(data, 1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    const currentFilters = methods.getValues();
    loadSales(currentFilters, newPage);
  };

  const loadClients = useCallback(async () => {
    try {
      const res = await api.get(getClientsRoute());
      const clients = res.data.data || [];
      
      const options = clients.map((client: any) => ({
        label: client.user_name || client.user_email || `Cliente ${client.id}`,
        value: client.id.toString()
      }));
      setClientOptions(options);
    } catch (e) {
      console.error('Error al cargar clientes:', e);
      setClientOptions([]);
    }
  }, []);

  useEffect(() => {
    loadSales({ search: '', client_id: '', discount_payment_method_id: '' }, 1);
    loadClients();
  }, [loadSales, loadClients]);

  const handleExport = async () => {
    try {
      const formValues = methods.getValues();
      const response = await api.get(exportSalesRoute(), { 
        params: formValues,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ventas-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error al exportar ventas:', e);
    }
  };

  const handleNewSale = () => {
    navigate('/ventas/nueva');
  };

  const handleEditSale = (sale: any) => {
    navigate(`/ventas/${sale.id}`);
  };

  const handleApprovePayment = async (sale: any) => {
    try {
      // Send manual payment approval to backend
      await api.post(postManualPaymentRoute(), { sale_id: sale.id });
      // reload list preserving filters
      const currentFilters = methods.getValues();
      loadSales(currentFilters);
    } catch (e) {
      console.error('Error aprobando pago:', e);
    }
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
            <SalesFilters 
              clientOptions={clientOptions} 
              visible={showFilters} 
              onFilterChange={handleSubmit(onSubmit)} 
            />
          </form>
        </FormProvider>
        
        <Table
          columns={[
            { 
              label: 'ID', 
              render: s => s.id || '-'
            },
            { 
              label: 'Fecha', 
              render: s => {
                const date = s.created_at;
                if (!date) return '-';
                return new Date(date).toLocaleDateString();
              }
            },
            { 
              label: 'Cliente', 
              render: s => {
                // Encontrar el cliente correspondiente por ID
                const client = clientOptions.find(c => c.value === s.client_id?.toString());
                return client ? client.label : `Cliente #${s.client_id}`;
              }
            },
            {
              label: 'Total', 
              render: s => {
                const total = parseFloat(s.total_ars || '0');
                return `$${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
              }
            },
            { 
              label: 'Tasa de Cambio', 
              render: s => {
                const rate = parseFloat(s.exchange_rate || '1');
                return rate.toLocaleString('es-AR', { minimumFractionDigits: 2 });
              }
            },
            { 
              label: 'Método de Pago', 
              render: s => {
                const method = s.payment_method;
                if (!method) return '-';
                
                const paymentMethods: Record<string, string> = {
                  'cash': 'Efectivo',
                  'credit_card': 'Tarjeta de Crédito',
                  'transfer': 'Transferencia',
                  'debit_card': 'Tarjeta de Débito',
                };
                
                return paymentMethods[method] || method;
              }
            },
            { 
              label: 'Comentario', 
              render: s => s.comment || '-'
            },
            {
              label: 'Pago',
              render: s => {
                const status = s.payment_status;
                const statusLabels: Record<string, string> = {
                  'approved': 'Aprobado',
                  'pending': 'Pendiente',
                  'rejected': 'Rechazado',
                };
                return statusLabels[status] || status || 'Pendiente';
              }
            },
            { 
              label: 'Estado', 
              render: s => s.status === 'active' ? 'Activo' : 'Inactivo'
            },
            {
              label: 'Acciones',
              render: s => (
                <Box display="flex" gap={1} justifyContent="center">
                  <Tooltip title="Aprobar pago">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleApprovePayment(s); }}
                      disabled={s.payment_status === 'approved'}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ),
              align: 'center'
            },
          ]}
          data={sales}
          getRowKey={s => s.id || `sale-${s.created_at}`}
          onRowClick={handleEditSale}
          emptyMessage={loading ? "Cargando..." : "No hay ventas"}
        />
        <Paginator
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
        />
      </CustomPaper>
    </Box>
  );
}
