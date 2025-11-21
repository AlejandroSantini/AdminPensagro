import { useState, useEffect } from 'react';
import { Box, Typography, Alert, CircularProgress, IconButton, Paper, Divider } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { ContainedButton } from '../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../components/common/OutlinedButton';
import { CustomPaper } from '../../../components/common/CustomPaper';
import { Table } from '../../../components/common/Table';
import api from '../../../services/api';
import { postClientRoute, putClientRoute, getClientByIdRoute } from '../../../services/clients';
import { getSalesByClientRoute } from '../../../services/sales';
import { translateToSpanish } from '../../../utils/translations';
import type { Client, ClientFormValues, ClientPurchase } from '../../../../types/client';

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
  fiscalType: '',
  fiscalCondition: '',
  companyName: '',
  status: 'active',
  createdAt: '',
  updatedAt: '',
};

const normalizePurchase = (raw: any): ClientPurchase => {
  const products = raw.products || [];
  const productNames = products.map((item: any) => {
    const productName = item.product?.name || 'Producto';
    const variantName = item.variant?.name;
    const quantity = item.quantity || 1;
    return variantName ? `${productName} (${variantName}) x${quantity}` : `${productName} x${quantity}`;
  }).join(', ');
  
  const totalQuantity = products.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  
  return {
    id: Number(raw.id || Date.now()),
    saleId: Number(raw.id || Date.now()),
    date: raw.created_at || raw.date || '',
    product: productNames || '-',
    quantity: totalQuantity,
    total: Number(raw.total) || 0,
    status: raw.payment_status || raw.status || 'pending',
  };
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [history, setHistory] = useState<ClientPurchase[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const isEditMode = !!id;
  const pageTitle = isEditMode ? 'Editar Cliente' : 'Nuevo Cliente';
  const buttonText = isEditMode ? 'Guardar Cambios' : 'Crear Cliente';

  const { handleSubmit, control, reset, formState: { errors } } = useForm<ClientFormValues>({ defaultValues });

  useEffect(() => {
    if (!isEditMode) return;

    const fetchClient = async () => {
      setFetchLoading(true);
      setError(null);

      try {
        const res = await api.get(getClientByIdRoute(id!));
        const clientData = res.data.data || res.data;
        setClient(clientData);

        reset({
          id: clientData.id || 0,
          userId: clientData.userId || clientData.user_id,
          name: clientData.name || clientData.full_name || '',
          lastName: clientData.lastName || clientData.last_name || '',
          fullName: clientData.fullName || clientData.full_name || '',
          email: clientData.email || '',
          type: clientData.type || clientData.client_type || 'retailer',
          clientType: clientData.clientType || clientData.client_type || 'retailer',
          razonSocial: clientData.razonSocial || clientData.razon_social || '',
          condicionIVA: clientData.condicionIVA || clientData.condicion_iva || 'Consumidor Final',
          dni: clientData.dni || '',
          cuit: clientData.cuit || '',
          domicilio: clientData.domicilio || clientData.address || '',
          phone: clientData.phone || '',
          fiscalType: clientData.fiscalType || clientData.fiscal_type || '',
          fiscalCondition: clientData.fiscalCondition || clientData.fiscal_condition || '',
          companyName: clientData.companyName || clientData.company_name || '',
          status: clientData.status || 'active',
        });
      } catch (e) {
        console.error('Error al cargar cliente:', e);
        setError('No se pudo cargar el cliente');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchClient();
  }, [id, reset, isEditMode]);

  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const res = await api.get(getSalesByClientRoute(Number(id)));
        const salesData = res.data?.data?.sales || res.data?.data || [];
        const mapped = Array.isArray(salesData) ? salesData.map(normalizePurchase) : [];
        setHistory(mapped);
      } catch (err) {
        setHistory([]);
        setHistoryError('No se pudo obtener el historial de compras');
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [id, isEditMode]);

  const onSubmit = async (data: ClientFormValues) => {
    setError(null);
    setLoading(true);

    const clientType = data.type || data.clientType || 'retailer';

    const payload = {
      name: data.name,
      last_name: data.lastName,
      email: data.email,
      type: clientType === 'retailer' ? 'minorista' : 'mayorista',
      tipo: clientType === 'retailer' ? 'minorista' : 'mayorista',
      client_type: clientType,
      razon_social: data.razonSocial || '',
      razonSocial: data.razonSocial || '',
      condicion_iva: data.condicionIVA || '',
      condicionIVA: data.condicionIVA || '',
      dni: data.dni || '',
      cuit: data.cuit || '',
      domicilio: data.domicilio || '',
      address: data.domicilio || '',
      phone: data.phone || '',
      fiscalType: data.fiscalType || '',
      fiscal_type: data.fiscalType || '',
      fiscalCondition: data.fiscalCondition || data.fiscalType || '',
      fiscal_condition: data.fiscalCondition || data.fiscalType || '',
      status: data.status,
      companyName: data.companyName || '',
      company_name: data.companyName || '',
      user_id: data.userId,
    };

    try {
      if (isEditMode) {
        await api.put(putClientRoute(id!), payload);
      } else {
        await api.post(postClientRoute(), payload);
      }
      navigate('/clientes');
    } catch (err) {
      console.error('Error saving client:', err);
      setError(isEditMode ? 'No se pudo actualizar el cliente' : 'No se pudo crear el cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/clientes');
  };

  if (isEditMode && fetchLoading) {
    return (
      <Box>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton 
            onClick={handleCancel} 
            sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
            aria-label="volver"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Cargando cliente...</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton 
          onClick={handleCancel} 
          sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
          aria-label="volver"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">
          {isEditMode && client ? `Editar Cliente: ${client.name}` : pageTitle}
        </Typography>
      </Box>

      {isEditMode && client && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">ID</Typography>
              <Typography variant="body2" fontWeight={500}>#{client.id}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Estado</Typography>
              <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                {client.status === 'active' ? '✅ Activo' : '⚠️ ' + client.status}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Tipo</Typography>
              <Typography variant="body2" fontWeight={500}>
                {translateToSpanish(client.type || 'retailer', 'clientType')}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      <CustomPaper>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Controller name="name" control={control} rules={{ required: 'El nombre es obligatorio' }} render={({ field }) => (
              <Input label="Nombre" {...field} variant="outlined" error={!!errors.name} helperText={errors.name?.message} />
            )} />

            <Controller name="lastName" control={control} render={({ field }) => (
              <Input label="Apellido" {...field} variant="outlined" />
            )} />

            <Controller name="razonSocial" control={control} render={({ field }) => (
              <Input label="Razón Social" {...field} value={field.value ?? ''} variant="outlined" helperText="En caso de consumidor final, se usa Nombre + Apellido" />
            )} />

            <Controller name="condicionIVA" control={control} render={({ field }) => (
              <Select label="Condición IVA" value={field.value || 'Consumidor Final'} onChange={e => field.onChange(e.target.value)} options={[
                { value: 'Responsable Inscripto', label: 'Responsable Inscripto' },
                { value: 'Monotributo', label: 'Monotributo' },
                { value: 'IVA Excento', label: 'IVA Excento' },
                { value: 'Consumidor Final', label: 'Consumidor Final' },
              ]} />
            )} />

            <Controller name="dni" control={control} render={({ field }) => (
              <Input label="DNI" {...field} value={field.value ?? ''} variant="outlined" helperText="Para consumidor final" />
            )} />

            <Controller name="cuit" control={control} render={({ field }) => (
              <Input label="CUIT" {...field} value={field.value ?? ''} variant="outlined" helperText="Para otros casos" />
            )} />

            <Controller name="domicilio" control={control} render={({ field }) => (
              <Input label="Domicilio" {...field} value={field.value ?? ''} variant="outlined" />
            )} />

            <Controller name="email" control={control} rules={{ required: 'El email es obligatorio' }} render={({ field }) => (
              <Input label="Email" {...field} value={field.value ?? ''} variant="outlined" error={!!errors.email} helperText={errors.email?.message || 'Email de contacto para factura'} />
            )} />

            <Controller name="phone" control={control} render={({ field }) => (
              <Input label="Teléfono de contacto" {...field} value={field.value ?? ''} variant="outlined" />
            )} />

            <Controller name="type" control={control} render={({ field }) => (
              <Select label="Tipo de Cliente" value={field.value || 'retailer'} onChange={e => field.onChange(e.target.value)} options={[
                { value: 'retailer', label: 'Minorista' },
                { value: 'wholesaler', label: 'Mayorista' },
              ]} />
            )} />

            <Controller name="status" control={control} render={({ field }) => (
              <Select label="Estado" value={field.value || 'active'} onChange={e => field.onChange(e.target.value)} options={[
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' },
              ]} />
            )} />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <OutlinedButton onClick={handleCancel} loading={loading}>Cancelar</OutlinedButton>
            <ContainedButton type="submit" loading={loading}>
              {buttonText}
            </ContainedButton>
          </Box>
        </form>
      </CustomPaper>

      {isEditMode && (
        <>
          <Divider sx={{ my: 3 }} />
          <CustomPaper>
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
          </CustomPaper>
        </>
      )}
    </Box>
  );
}
