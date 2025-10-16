import { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { ContainedButton } from '../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../components/common/OutlinedButton';
import { Table } from '../../../components/common/Table';
import api from '../../../services/api';
import { putClientRoute } from '../../../services/clients';
import { getSalesByClientRoute } from '../../../services/sales';
import { translateToSpanish } from '../../../utils/translations';
import type { Client, ClientFormValues, ClientPurchase } from '../../../../types/client';

interface ClientDetailsProps {
  client: Client | null;
  onSave: () => void;
  onCancel: () => void;
}

const defaultValues: ClientFormValues = {
  id: 0,
  userId: undefined,
  name: '',
  email: '',
  type: 'retailer',
  clientType: 'retailer',
  fiscalType: '',
  fiscalCondition: '',
  status: 'active',
  createdAt: '',
  updatedAt: '',
  phone: '',
  companyName: '',
};

const normalizePurchase = (raw: any): ClientPurchase => {
  return {
    id: Number(raw.id || Date.now()),
    saleId: Number(raw.id || Date.now()),
    date: raw.date || '',
    product: raw.product_name || '-',
    quantity: Number(raw.quantity) || 0,
    total: Number(raw.total) || 0,
    status: raw.status || '-',
  };
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export function ClientDetails({ client, onSave, onCancel }: ClientDetailsProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ClientPurchase[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
  const { handleSubmit, control, reset, formState: { errors } } = useForm<ClientFormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (client) {
      const clientType = client.clientType || 
        (client.type === 'mayorista' || client.tipo === 'mayorista' ? 'wholesaler' : 'retailer');

      reset({
        ...defaultValues,
        ...client,
        type: clientType,
        tipo: clientType === 'wholesaler' ? 'mayorista' : 'minorista',
        clientType: clientType,
      });
    } else {
      reset(defaultValues);
    }
  }, [client, reset]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!client?.id) return;
      
      setHistoryLoading(true);
      setHistoryError(null);
      
      try {
        const res = await api.get(getSalesByClientRoute(client.id));
        const data = Array.isArray(res.data?.data) ? res.data.data : res.data;
        const mapped = Array.isArray(data) ? data.map(normalizePurchase) : [];
        setHistory(mapped);
      } catch (err) {
        setHistory([]);
        setHistoryError('No se pudo obtener el historial de compras');
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [client]);

  const onSubmit = async (data: ClientFormValues) => {
    if (!client) return;
    
    const clientType = data.type || data.clientType || 'retailer';

    const payload = {
      name: data.name,
      email: data.email,
      type: clientType === 'retailer' ? 'minorista' : 'mayorista',
      tipo: clientType === 'retailer' ? 'minorista' : 'mayorista',
      client_type: clientType,
      fiscalType: data.fiscalType ?? '',
      fiscal_type: data.fiscalType ?? '',
      fiscal_condition: data.fiscalCondition ?? data.fiscalType ?? '',
      status: data.status,
      phone: data.phone ?? '',
      companyName: data.companyName ?? '',
      company_name: data.companyName ?? '',
      user_id: data.userId,
    };
    
    setError(null);
    setSaving(true);
    
    try {
      await api.put(putClientRoute(client.id), payload);
      onSave();
    } catch (err) {
      console.error('Error updating client:', err);
      setError('No se pudo guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  if (!client) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Selecciona un cliente para ver sus detalles
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          border: '1px solid #e0e0e0',
          mb: 3
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Detalles del cliente
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'El nombre es obligatorio' }}
              render={({ field }) => (
                <Input label="Nombre" {...field} variant="outlined" error={!!errors.name} helperText={errors.name?.message} />
              )}
            />
            <Controller
              name="email"
              control={control}
              rules={{ required: 'El email es obligatorio' }}
              render={({ field }) => (
                <Input label="Email" {...field} variant="outlined" error={!!errors.email} helperText={errors.email?.message} />
              )}
            />
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  label="Tipo"
                  value={field.value || 'retailer'}
                  onChange={e => field.onChange(e.target.value)}
                  options={[
                    { value: 'retailer', label: 'Minorista' },
                    { value: 'wholesaler', label: 'Mayorista' },
                  ]}
                />
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  label="Teléfono"
                  {...field}
                  value={field.value ?? ''}
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="companyName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Nombre de la empresa"
                  {...field}
                  value={field.value ?? ''}
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="fiscalType"
              control={control}
              render={({ field }) => (
                <Input
                  label="Tipo fiscal"
                  {...field}
                  value={field.value ?? ''}
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Estado"
                  value={field.value || 'active'}
                  onChange={e => field.onChange(e.target.value)}
                  options={[
                    { value: 'active', label: 'Activo' },
                    { value: 'inactive', label: 'Inactivo' },
                  ]}
                />
              )}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <OutlinedButton onClick={onCancel} disabled={saving}>
              Cancelar
            </OutlinedButton>
            <ContainedButton type="submit" disabled={saving}>
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Guardar cambios'}
            </ContainedButton>
          </Box>
        </form>
      </Paper>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          border: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Historial de compras
        </Typography>
        
        {historyError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {historyError}
          </Alert>
        )}
        
        {historyLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Table
            columns={[
              { label: 'Fecha', render: (row: ClientPurchase) => formatDate(row.date) },
              { label: 'Producto(s)', render: (row: ClientPurchase) => row.product },
              { label: 'Cantidad', render: (row: ClientPurchase) => row.quantity },
              { label: 'Total', render: (row: ClientPurchase) => `$${row.total.toFixed(2)}` },
              { label: 'Estado', render: (row: ClientPurchase) => translateToSpanish(row.status, 'status') },
            ]}
            data={history}
            getRowKey={(row: ClientPurchase) => row.saleId}
            emptyMessage={historyLoading ? "Cargando historial…" : "Sin compras registradas"}
          />
        )}
      </Paper>
    </Box>
  );
}