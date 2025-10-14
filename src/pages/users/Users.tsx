import { useState } from "react";
import { Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from "@mui/material";
import { OutlinedButton } from "../../components/common/OutlinedButton";
import { Table } from "../../components/common/Table";
import { EditUserDialog } from "./components/EditUserDialog";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import type { User } from "../../types";

// Mock data for demonstration
type UserType = 'minorista' | 'mayorista';
interface UserWithType extends User {
  userType: UserType;
}
const MOCK_USERS: UserWithType[] = [
  {
    id: 1,
    name: "Juan Perez",
    email: "juan@mail.com",
    tipo: "minorista",
    userType: "minorista",
    fiscalType: "Consumidor Final",
    status: "active",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01"
  },
  {
    id: 2,
    name: "Ana Lopez",
    email: "ana@mail.com",
    tipo: "mayorista",
    userType: "mayorista",
    fiscalType: "Responsable Inscripto",
    status: "active",
    createdAt: "2025-02-01",
    updatedAt: "2025-02-01"
  },
];


export default function Users() {
  const [users] = useState<UserWithType[]>(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState<UserWithType | null>(null);
  const [open, setOpen] = useState(false);
  const [showHistoryUser, setShowHistoryUser] = useState<UserWithType | null>(null);

  const handleEdit = (user: UserWithType) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleSave = () => {
    // TODO: Call PUT /users/:id
    setOpen(false);
    setSelectedUser(null);
  };

  const handleShowHistory = (user: UserWithType) => {
    setShowHistoryUser(user);
  };

  const handleCloseHistory = () => {
    setShowHistoryUser(null);
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" color="text.primary" sx={{ flexGrow: 1 }}>Clientes</Typography>
      </Box>
      <Table
        columns={[
          { label: 'Nombre', render: u => u.name },
          { label: 'Email', render: u => u.email },
          { label: 'Tipo', render: u => u.userType },
          { label: 'Estado', render: u => u.status ? 'Activo' : 'Inactivo' },
          { label: 'Creado', render: u => u.createdAt },
          {
            label: 'Acciones',
            render: u => (
              <>
                {handleEdit && (
                  <Tooltip title="Editar">
                    <IconButton color="primary" size="small" sx={{ boxShadow: 'none' }} onClick={() => handleEdit(u)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {handleShowHistory && (
                  <Tooltip title="Historial de compras">
                    <IconButton color="secondary" size="small" sx={{ boxShadow: 'none' }} onClick={() => handleShowHistory(u)}>
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {/* Otros iconos opcionales aquí */}
              </>
            ),
            align: 'center',
          },
        ]}
        data={users}
        getRowKey={u => u.id}
      />

      <EditUserDialog
        open={open}
        selectedUser={selectedUser}
        onChange={user => setSelectedUser(user)}
        onClose={handleClose}
        onSave={handleSave}
      />

      {/* Purchase History Dialog */}
      <Dialog
        open={!!showHistoryUser}
        onClose={handleCloseHistory}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: 'none' } } }}
      >
        <DialogTitle sx={{ fontWeight: 500, color: 'text.primary', pb: 0 }}>Historial de compras - {showHistoryUser?.name}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {/* TODO: Fetch and display purchase history for user */}
          <Typography variant="body2" color="text.secondary">(Aquí irá la tabla de historial de compras)</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <OutlinedButton onClick={handleCloseHistory}>Cerrar</OutlinedButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
