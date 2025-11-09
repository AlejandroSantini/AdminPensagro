import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
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
import { getSalesRoute, exportSalesRoute } from '../../services/sales';
import { postManualPaymentRoute } from '../../services/payments';
import { getClientsRoute } from '../../services/clients';

export default function Sales() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientOptions, setClientOptions] = useState<{label: string, value: string}[]>([]);
  
  const methods = useForm({ 
    defaultValues: { 
      search: '', 
      client_id: '', 
      discount_payment_method_id: '' 
    } 
  });

  const { handleSubmit, watch } = methods;

  interface SalesFilters {
    search: string;
    client_id: string;
    discount_payment_method_id: string;
  }

  const loadSales = useCallback(async (filterValues: SalesFilters) => {
    setLoading(true);
    try {
      const res = await api.get(getSalesRoute(), { params: filterValues });
      // Maneja el nuevo formato de respuesta: { ok: true, data: [...] }
      if (res.data && res.data.ok && Array.isArray(res.data.data)) {
        setSales(res.data.data);
      } else if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
        // Formato anterior por compatibilidad
        setSales(res.data.data);
      } else {
        setSales([]);
      }
    } catch (e) {
      console.error('Error al cargar ventas:', e);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onSubmit = (data: SalesFilters) => {
    loadSales(data);
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
    loadSales({ search: '', client_id: '', discount_payment_method_id: '' });
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
                const total = parseFloat(s.total || '0');
                return `$${total.toFixed(2)}`;
              }
            },
            { 
              label: 'Tasa de Cambio', 
              render: s => {
                const rate = parseFloat(s.exchange_rate || '1');
                return rate.toFixed(2);
              }
            },
            { 
              label: 'Método de Pago', 
              render: s => {
                const methodId = s.discount_payment_method_id;
                if (!methodId) return '-';
                
                // Map payment method IDs to names
                const paymentMethods: Record<string, string> = {
                  '1': 'Efectivo',
                  '2': 'Tarjeta de Crédito',
                  '3': 'Transferencia',
                };
                
                return paymentMethods[methodId] || `Método #${methodId}`;
              }
            },
            { 
              label: 'Comentario', 
              render: s => s.comment || '-'
            },
            {
              label: 'Pago',
              render: s => {
                if (s.payment_approved || s.payment_status === 'approved') return 'Aprobado';
                if (Array.isArray(s.payments) && s.payments.some((p: any) => p.status === 'approved' || p.approved)) return 'Aprobado';
                return 'A confirmar';
              }
            },
            { 
              label: 'Estado', 
              render: s => s.active ? 'Activo' : 'Inactivo'
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
                      disabled={!!(s.payment_approved || s.payment_status === 'approved' || (Array.isArray(s.payments) && s.payments.some((p: any) => p.status === 'approved' || p.approved)))}
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
      </CustomPaper>
    </Box>
  );
}
