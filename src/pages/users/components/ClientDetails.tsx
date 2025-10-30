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
  lastName: '',
  fullName: '',
  email: '',
  type: 'retailer',
  clientType: 'retailer',
  razonSocial: '',
  condicionIVA: 'Consumidor Final',
  dni: '',
  cuit: '',
  domicilio: '',
  phone: '',
  // Campos legacy
  fiscalType: '',
  fiscalCondition: '',
  companyName: '',
  status: 'active',
  createdAt: '',
  updatedAt: '',
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
    
    // Si es consumidor final y no tiene razón social, usar Nombre + Apellido
    let razonSocial = data.razonSocial;
    if (!razonSocial && data.condicionIVA === 'Consumidor Final') {
      razonSocial = `${data.name} ${data.lastName || ''}`.trim();
    }

    const payload = {
      name: data.name,
      last_name: data.lastName ?? '',
      lastName: data.lastName ?? '',
      razon_social: razonSocial ?? '',
      razonSocial: razonSocial ?? '',
      condicion_iva: data.condicionIVA ?? 'Consumidor Final',
      condicionIVA: data.condicionIVA ?? 'Consumidor Final',
      dni: data.dni ?? '',
      cuit: data.cuit ?? '',
      domicilio: data.domicilio ?? '',
      email: data.email,
      phone: data.phone ?? '',
      type: clientType === 'retailer' ? 'minorista' : 'mayorista',
      tipo: clientType === 'retailer' ? 'minorista' : 'mayorista',
      client_type: clientType,
      status: data.status,
      user_id: data.userId,
      // Campos legacy para compatibilidad
      fiscalType: data.condicionIVA ?? '',
      fiscal_type: data.condicionIVA ?? '',
      fiscal_condition: data.condicionIVA ?? '',
      companyName: razonSocial ?? '',
      company_name: razonSocial ?? '',
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
                <Input 
                  label="Nombre" 
                  {...field} 
                  variant="outlined" 
                  error={!!errors.name} 
                  helperText={errors.name?.message} 
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <Input
                  label="Apellido"
                  {...field}
                  value={field.value ?? ''}
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="razonSocial"
              control={control}
              render={({ field }) => (
                <Input
                  label="Razón Social"
                  {...field}
                  value={field.value ?? ''}
                  variant="outlined"
                  helperText="En caso de consumidor final, se usa Nombre + Apellido"
                />
              )}
            />
            <Controller
              name="condicionIVA"
              control={control}
              render={({ field }) => (
                <Select
                  label="Condición IVA"
                  value={field.value || 'Consumidor Final'}
                  onChange={e => field.onChange(e.target.value)}
                  options={[
                    { value: 'Responsable Inscripto', label: 'Responsable Inscripto' },
                    { value: 'Monotributo', label: 'Monotributo' },
                    { value: 'IVA Excento', label: 'IVA Excento' },
                    { value: 'Consumidor Final', label: 'Consumidor Final' },
                  ]}
                />
              )}
            />
            <Controller
              name="dni"
              control={control}
              render={({ field }) => (
                <Input
                  label="DNI"
                  {...field}
                  value={field.value ?? ''}
                  variant="outlined"
                  helperText="Para consumidor final"
                />
              )}
            />
            <Controller
              name="cuit"
              control={control}
              render={({ field }) => (
                <Input
                  label="CUIT"
                  {...field}
                  value={field.value ?? ''}
                  variant="outlined"
                  helperText="Para otros casos"
                />
              )}
            />
            <Controller
              name="domicilio"
              control={control}
              render={({ field }) => (
                <Input
                  label="Domicilio"
                  {...field}
                  value={field.value ?? ''}
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="email"
              control={control}
              rules={{ required: 'El email es obligatorio' }}
              render={({ field }) => (
                <Input 
                  label="Email" 
                  {...field} 
                  variant="outlined" 
                  error={!!errors.email} 
                  helperText={errors.email?.message || "Email de contacto para factura"} 
                />
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  label="Teléfono de contacto"
                  {...field}
                  value={field.value ?? ''}
                  variant="outlined"
                />
              )}
            />
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  label="Tipo de Cliente"
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