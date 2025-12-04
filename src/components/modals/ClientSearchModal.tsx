import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Paper,
  Typography
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Table } from '../common/Table';
import { Paginator } from '../common/Paginator';
import { OutlinedButton } from '../common/OutlinedButton';
import { ContainedButton } from '../common/ContainedButton';
import api from '../../services/api';
import { getClientsRoute } from '../../services/clients';
import type { Client } from '../../../types/client';

interface ClientSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectClient: (client: Client) => void;
}

const CLIENT_TYPE_LABELS: Record<string, string> = {
  wholesaler: 'Mayorista',
  retailer: 'Minorista'
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  disabled: 'Deshabilitado'
};

export const ClientSearchModal = ({ open, onClose, onSelectClient }: ClientSearchModalProps) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    client_type: '',
    status: 'active',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [newClient, setNewClient] = useState({
    name: '',
    dni: '',
    email: '',
    phone: '',
    client_type: 'retailer',
    condicion_iva: 'Consumidor Final'
  });

  const loadClients = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const res = await api.get(getClientsRoute(), { params: { ...filters, page: pageNum, per_page: 10 } });
      setClients(res.data.data || []);
      
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalItems(res.data.meta.totalItems || 0);
      }
    } catch (e) {
      console.error('Error loading clients:', e);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    loadClients(newPage);
  };

  const handleFilterInputChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleFilterApply = () => {
    setPage(1);
    loadClients(1);
  };

  const handleSelectClient = (client: any) => {
    const clientToAdd: Client = {
      id: client.id,
      name: client.user_name || '',
      email: client.user_email || '',
      phone: client.phone || '',
      type: client.client_type || 'retailer',
      status: client.user_status || client.status || 'active',
      dni: client.dni || null
    };
    
    onSelectClient(clientToAdd);
    onClose();
  };

  const handleCreateClient = async () => {
    if (!newClient.email) {
      alert('El Email es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: newClient.name.trim() || '',
        email: newClient.email.trim(),
        client_type: newClient.client_type,
        fiscal_condition: newClient.condicion_iva === 'Responsable Inscripto' ? 'RI' : 
                         newClient.condicion_iva === 'Monotributo' ? 'Monotributo' :
                         newClient.condicion_iva === 'IVA Excento' ? 'Exento' : 'CF',
        phone: newClient.phone.trim(),
        dni: newClient.dni.trim()
      };

      const res = await api.post(getClientsRoute(), payload);
      const createdClient = res.data.data || res.data;
      
      const clientToAdd: Client = {
        id: createdClient.id,
        name: createdClient.user_name || createdClient.name || '',
        email: createdClient.user_email || createdClient.email || '',
        phone: createdClient.phone || '',
        type: createdClient.client_type || 'retailer',
        status: createdClient.user_status || createdClient.status || 'active',
        dni: createdClient.dni || null
      };

      onSelectClient(clientToAdd);
      onClose();
      setShowCreateForm(false);
      setNewClient({
        name: '',
        dni: '',
        email: '',
        phone: '',
        client_type: 'retailer',
        condicion_iva: 'Consumidor Final'
      });
    } catch (err) {
      console.error('Error creating client:', err);
      alert('Error al crear el cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPage(1);
      loadClients(1);
    }
  }, [open, loadClients]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Seleccionar un cliente</DialogTitle>
      <DialogContent>
        <Box mb={2} mt={1} display="flex" justifyContent="space-between" alignItems="center" gap={2}>
          <OutlinedButton
            icon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            size="small"
          >
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </OutlinedButton>
          <ContainedButton
            onClick={() => setShowCreateForm(!showCreateForm)}
            size="small"
          >
            {showCreateForm ? 'Cancelar' : 'Crear cliente'}
          </ContainedButton>
        </Box>

        {showCreateForm && (
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>Nuevo Cliente</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Input
                label="Nombre"
                variant="outlined"
                value={newClient.name}
                onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                sx={{ mt: 0, mb: 0 }}
              />
              <Input
                label="DNI"
                variant="outlined"
                value={newClient.dni}
                onChange={(e) => setNewClient(prev => ({ ...prev, dni: e.target.value }))}
                sx={{ mt: 0, mb: 0 }}
              />
              <Input
                label="Email"
                variant="outlined"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                required
                sx={{ mt: 0, mb: 0 }}
              />
              <Input
                label="Teléfono"
                variant="outlined"
                value={newClient.phone}
                onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                sx={{ mt: 0, mb: 0 }}
              />
              <Select
                label="Tipo"
                value={newClient.client_type}
                onChange={(e) => setNewClient(prev => ({ ...prev, client_type: e.target.value as string }))}
                options={[
                  { value: 'retailer', label: 'Minorista' },
                  { value: 'wholesaler', label: 'Mayorista' }
                ]}
                sx={{ mt: 0, mb: 0 }}
              />
              <Select
                label="Condición IVA"
                value={newClient.condicion_iva}
                onChange={(e) => setNewClient(prev => ({ ...prev, condicion_iva: e.target.value as string }))}
                options={[
                  { value: 'Consumidor Final', label: 'Consumidor Final' },
                  { value: 'Responsable Inscripto', label: 'Responsable Inscripto' },
                  { value: 'Monotributo', label: 'Monotributo' },
                  { value: 'IVA Excento', label: 'IVA Excento' }
                ]}
                sx={{ mt: 0, mb: 0 }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <ContainedButton onClick={handleCreateClient} loading={loading}>
                Crear y seleccionar
              </ContainedButton>
            </Box>
          </Paper>
        )}

        {showFilters && (
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <Input
                label="Buscar cliente"
                variant="outlined"
                value={filters.search}
                onChange={(e) => handleFilterInputChange('search', e.target.value)}
                onBlur={handleFilterApply}
                placeholder="Nombre, email, teléfono..."
                sx={{ mt: 0, mb: 0 }}
              />
              <Select
                label="Tipo"
                value={filters.client_type}
                onChange={(e) => {
                  handleFilterInputChange('client_type', e.target.value as string);
                  handleFilterApply();
                }}
                options={[
                  { value: '', label: 'Todos' },
                  { value: 'wholesaler', label: 'Mayorista' },
                  { value: 'retailer', label: 'Minorista' }
                ]}
                sx={{ mt: 0, mb: 0 }}
              />
              <Select
                label="Estado"
                value={filters.status}
                onChange={(e) => {
                  handleFilterInputChange('status', e.target.value as string);
                  handleFilterApply();
                }}
                options={[
                  { value: '', label: 'Todos' },
                  { value: 'active', label: 'Activo' },
                  { value: 'inactive', label: 'Inactivo' },
                  { value: 'disabled', label: 'Deshabilitado' }
                ]}
                sx={{ mt: 0, mb: 0 }}
              />
            </Box>
          </Paper>
        )}

        <Box sx={{ mt: 2 }}>
          <Table
            sx={{ boxShadow: 'none' }}
            columns={[
              { label: 'DNI', render: (c: any) => c.dni || '-' },
              { label: 'Nombre', render: (c: any) => c.user_name || '-' },
              { label: 'Email', render: (c: any) => c.user_email || '-' },
              { label: 'Teléfono', render: (c: any) => c.phone || '-' },
              { label: 'Tipo', render: (c: any) => CLIENT_TYPE_LABELS[c.client_type] || c.client_type || '-' },
              { label: 'Estado', render: (c: any) => STATUS_LABELS[c.user_status || c.status] || c.user_status || c.status || '-' }
            ]}
            data={clients}
            getRowKey={(c: any) => c.id}
            emptyMessage={loading ? "Cargando..." : "No hay clientes"}
            onRowClick={handleSelectClient}
          />
          <Paginator
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <OutlinedButton onClick={onClose}>
          Cancelar
        </OutlinedButton>
      </DialogActions>
    </Dialog>
  );
};
