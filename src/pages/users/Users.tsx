import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Alert, Paper, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Table } from "../../components/common/Table";
import api from "../../services/api";
import { getClientsRoute } from "../../services/clients";
import { translateToSpanish } from "../../utils/translations";
import { ClientDetails } from "./components/ClientDetails";
import type { Client } from "../../../types/client";

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

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
  };

  const handleClearSelection = () => {
    setSelectedClient(null);
  };

  const handleSaveClient = () => {
    loadClients();
    setSelectedClient(null);
  };

  const emptyMessage = useMemo(() => (loading ? "Cargando clientes…" : "No hay clientes"), [loading]);

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      {selectedClient ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton 
              onClick={handleClearSelection}
              sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
              aria-label="volver"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" color="text.primary" sx={{ flexGrow: 1 }}>
              Detalles del Cliente: {selectedClient.name}
            </Typography>
          </Box>
          
          <ClientDetails 
            client={selectedClient} 
            onSave={handleSaveClient}
            onCancel={handleClearSelection}
          />
        </>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" color="text.primary" sx={{ flexGrow: 1 }}>
              Clientes
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              overflow: 'hidden'
            }}
          >
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
              ]}
              data={clients}
              getRowKey={(c: Client) => c.id}
              onRowClick={handleSelectClient}
              emptyMessage={emptyMessage}
              sx={{ boxShadow: 'none', border: 'none' }}
            />
          </Paper>
        </>
      )}
    </Box>
  );
}
