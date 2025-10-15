import { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, CircularProgress, Alert } from '@mui/material';
import { Table } from '../../../components/common/Table';
import { OutlinedButton } from '../../../components/common/OutlinedButton';
import api from '../../../services/api';
import { getSalesByClientRoute } from '../../../services/sales';
import { translateToSpanish } from '../../../utils/translations';
import type { Client, ClientPurchase } from '../../../../types/client';

interface PurchaseHistoryDialogProps {
  open: boolean;
  clientId?: number | null;
  clientName?: string;
  onClose: () => void;
}

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

export function PurchaseHistoryDialog({ open, clientId, clientName, onClose }: PurchaseHistoryDialogProps) {
  const [history, setHistory] = useState<ClientPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    // Reset state when dialog opens or closes
    if (!open) {
      setHistory([]);
      setError(null);
      return;
    }

    if (clientId) {
      setClient({
        id: clientId,
        name: clientName || 'Cliente',
        email: '',
        type: 'minorista',
        tipo: 'minorista',
        status: 'active'
      });
    } else {
      setClient(null);
    }
  }, [open, clientId, clientName]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!clientId || !open) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(getSalesByClientRoute(clientId));
        const data = Array.isArray(res.data?.data) ? res.data.data : res.data;
        const mapped = Array.isArray(data) ? data.map(normalizePurchase) : [];
        setHistory(mapped);
      } catch (err) {
        setHistory([]);
        setError('No se pudo obtener el historial');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [clientId, open]);

  const emptyMessage = useMemo(() => (loading ? 'Cargando historial…' : 'Sin compras registradas'), [loading]);

  return (
    <Dialog
      open={open && !!client}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: 'none', p: 1.5 } } }}
    >
      <DialogTitle sx={{ fontWeight: 500, color: 'text.primary', pb: 0 }}>
        Historial de compras - {client?.name || clientName || 'Cliente'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
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
            emptyMessage={emptyMessage}
            sx={{ boxShadow: 'none', border: 'none' }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <OutlinedButton onClick={onClose}>Cerrar</OutlinedButton>
      </DialogActions>
    </Dialog>
  );
}
