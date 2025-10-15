import { useEffect, useMemo, useState } from "react";
import { Box, Typography, IconButton, Tooltip, Alert } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import { Table } from "../../components/common/Table";
import { EditUserDialog } from "./components/EditUserDialog";
import { PurchaseHistoryDialog } from "./components/PurchaseHistoryDialog";
import api from "../../services/api";
import { getClientsRoute, putClientRoute } from "../../services/clients";
import { translateToSpanish } from "../../utils/translations";
import type { Client, ClientFormValues } from "../../../types/client";

// Ya no necesitamos esta función, el tipo ya se normaliza en normalizeClient

const normalizeClient = (raw: any): Client => {
  const rawId = raw?.id ?? raw?.client_id ?? raw?.user_id ?? Date.now();
  // Priorizar el campo client_type de la API, que viene en inglés
  const rawType = raw?.client_type ?? raw?.clientType ?? raw?.type ?? raw?.tipo ?? "retailer";
  const statusValue = raw?.status ?? raw?.estado ?? "active";
  const status = typeof statusValue === "boolean" ? (statusValue ? "active" : "inactive") : String(statusValue);
  const name = (raw?.name
    || raw?.full_name
    || raw?.fullName
    || raw?.user?.name
    || "") as string;
  const email = (raw?.email || raw?.user?.email || "") as string;
  const safeName = name.trim();
  const safeEmail = email || "";
  const numericId = Number(rawId);
  const id = Number.isNaN(numericId) ? Number(Date.now()) : numericId;

  // Aseguramos que el tipo esté en formato de API (inglés)
  let type = typeof rawType === "string" ? rawType.toLowerCase() : "retailer";
  // Normalizar tipos en español a inglés
  if (type === "minorista") type = "retailer";
  if (type === "mayorista") type = "wholesaler";

  const client: Client = {
    id,
    userId: raw?.user_id ?? raw?.userId ?? undefined,
    name: safeName || safeEmail || "-",
    email: safeEmail,
    type,
    fiscalType: raw?.fiscalType || raw?.fiscal_type || raw?.fiscal_tipo || raw?.fiscal_condition || null,
    status,
    createdAt: raw?.createdAt || raw?.created_at,
    updatedAt: raw?.updatedAt || raw?.updated_at,
    phone: raw?.phone || raw?.telefono || raw?.user?.phone || null,
    companyName: raw?.companyName || raw?.company_name || raw?.business_name || null,
  };

  return client;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

export default function Users() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(getClientsRoute());
      const payload = res.data;
      const rawList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.clients)
            ? payload.clients
            : [];
      const mapped = Array.isArray(rawList) ? rawList.map(normalizeClient) : [];
      setClients(mapped);
    } catch (err) {
      setClients([]);
      setError("No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedClient(null);
  };

  const handleSuccess = () => {
    loadClients();
  };

  const handleShowHistory = (client: Client) => {
    setHistoryClient(client);
  };

  const handleCloseHistory = () => {
    setHistoryClient(null);
  };

  const emptyMessage = useMemo(() => (loading ? "Cargando clientes…" : "No hay clientes"), [loading]);

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" color="text.primary" sx={{ flexGrow: 1 }}>Clientes</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Table
        columns={[
          { label: 'Nombre', render: (c: Client) => c.name || '-' },
          { label: 'Email', render: (c: Client) => c.email || '-' },
          { 
            label: 'Tipo', 
            render: (c: Client) => translateToSpanish(c.type, 'clientType')
          },
          { 
            label: 'Estado', 
            render: (c: Client) => translateToSpanish(c.status, 'status')
          },
          { label: 'Creado', render: (c: Client) => formatDate(c.createdAt) },
          {
            label: 'Acciones',
            render: (c: Client) => (
              <>
                <Tooltip title="Editar">
                  <IconButton color="primary" size="small" sx={{ boxShadow: 'none' }} onClick={() => handleEdit(c)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Historial de compras">
                  <IconButton color="secondary" size="small" sx={{ boxShadow: 'none' }} onClick={() => handleShowHistory(c)}>
                    <HistoryIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ),
            align: 'center',
          },
        ]}
        data={clients}
        getRowKey={(c: Client) => c.id}
        emptyMessage={emptyMessage}
      />

      <EditUserDialog
        open={open}
        selectedUser={selectedClient}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />

      <PurchaseHistoryDialog
        open={!!historyClient}
        clientId={historyClient?.id}
        clientName={historyClient?.name}
        onClose={handleCloseHistory}
      />
    </Box>
  );
}
