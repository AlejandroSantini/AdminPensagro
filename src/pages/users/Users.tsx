import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Alert } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { ClientsFilters } from './components/ClientsFilters';
import { CustomPaper } from '../../components/common/CustomPaper';
import { Table } from "../../components/common/Table";
import api from "../../services/api";
import { getClientsRoute } from "../../services/clients";
import { translateToSpanish } from "../../utils/translations";
import type { Client } from "../../../types/client";

// Ya no necesitamos esta función, el tipo ya se normaliza en normalizeClient

const normalizeClient = (raw: any): Client => {
  const rawId = raw?.id ?? raw?.client_id ?? raw?.user_id ?? Date.now();
  // Priorizar el campo client_type de la API, que viene en inglés
  const rawType = raw?.client_type ?? raw?.clientType ?? raw?.type ?? raw?.tipo ?? "retailer";
  const statusValue = raw?.status ?? raw?.estado ?? "active";
  const status = typeof statusValue === "boolean" ? (statusValue ? "active" : "inactive") : String(statusValue);
  const name = (raw?.user_name
    || raw?.name
    || raw?.full_name
    || raw?.fullName
    || raw?.user?.name
    || "") as string;
  const lastName = (raw?.lastName || raw?.last_name || "") as string;
  const email = (raw?.user_email || raw?.email || raw?.user?.email || "") as string;
  const safeName = name.trim();
  const safeLastName = lastName.trim();
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
    lastName: safeLastName || undefined,
    fullName: raw?.user_name || raw?.fullName || raw?.full_name || (safeName && safeLastName ? `${safeName} ${safeLastName}` : undefined),
    email: safeEmail,
    type,
    razonSocial: raw?.razonSocial || raw?.razon_social || raw?.companyName || raw?.company_name || raw?.business_name || null,
    condicionIVA: raw?.fiscal_condition || raw?.condicionIVA || raw?.condicion_iva || raw?.fiscalCondition || null,
    dni: raw?.dni || null,
    cuit: raw?.cuit || null,
    domicilio: raw?.domicilio || raw?.address || null,
    phone: raw?.phone || raw?.telefono || raw?.user?.phone || null,
    // Campos legacy para compatibilidad
    fiscalType: raw?.fiscalType || raw?.fiscal_type || raw?.fiscal_tipo || raw?.fiscal_condition || raw?.condicionIVA || raw?.condicion_iva || null,
    fiscalCondition: raw?.fiscal_condition || raw?.fiscalCondition || raw?.condicionIVA || raw?.condicion_iva || null,
    companyName: raw?.companyName || raw?.company_name || raw?.business_name || raw?.razonSocial || raw?.razon_social || null,
    status,
    createdAt: raw?.createdAt || raw?.created_at,
    updatedAt: raw?.updatedAt || raw?.updated_at,
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
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

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

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      if (filterType && c.type !== filterType) return false;
      if (filterStatus && c.status !== filterStatus) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (c.fullName || c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.razonSocial || c.companyName || '').toLowerCase().includes(q);
    });
  }, [clients, query, filterType, filterStatus]);

  const handleSelectClient = (client: Client) => {
    navigate(`/clientes/${client.id}`);
  };

  const handleNewClient = () => {
    navigate('/clientes/nuevo');
  };

  const emptyMessage = useMemo(() => (loading ? "Cargando clientes…" : "No hay clientes"), [loading]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" color="text.primary" sx={{ flexGrow: 1, mb: 2 }}>
        Clientes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <CustomPaper>
        <ClientsFilters
          search={query}
          type={filterType}
          status={filterStatus}
          onChange={(field, value) => {
            if (field === 'search') setQuery(value);
            if (field === 'type') setFilterType(value || null);
            if (field === 'status') setFilterStatus(value || null);
          }}
          onCreate={handleNewClient}
          onApply={() => {
            // Para este listado hacemos filtering en memoria, por lo que no necesitamos recargar del servidor.
            // Si en el futuro preferimos server-side, aquí podríamos llamar a loadClients con params.
          }}
        />

        <Table
          columns={[
            { 
              label: 'Nombre', 
              render: (c: Client) => c.fullName || c.name || '-'
            },
            { 
              label: 'Email', 
              render: (c: Client) => c.email || '-' 
            },
            { 
              label: 'DNI', 
              render: (c: Client) => c.dni || '-' 
            },
            { 
              label: 'Teléfono', 
              render: (c: Client) => c.phone || '-' 
            },
            { 
              label: 'Condición Fiscal', 
              render: (c: Client) => c.fiscalCondition || c.condicionIVA || '-' 
            },
            { 
              label: 'Tipo', 
              render: (c: Client) => translateToSpanish(c.type, 'clientType')
            },
            { 
              label: 'Estado', 
              render: (c: Client) => translateToSpanish(c.status || 'active', 'status')
            },
          ]}
          data={filteredClients}
          getRowKey={(c: Client) => c.id}
          onRowClick={handleSelectClient}
          emptyMessage={emptyMessage}
          sx={{ boxShadow: 'none'}}
        />
      </CustomPaper>
    </Box>
  );
}