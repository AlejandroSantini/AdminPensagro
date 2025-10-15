import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Alert, CircularProgress } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { Input } from "../../../components/common/Input";
import { Select } from "../../../components/common/Select";
import { ContainedButton } from "../../../components/common/ContainedButton";
import { OutlinedButton } from "../../../components/common/OutlinedButton";
import api from "../../../services/api";
import { putClientRoute } from "../../../services/clients";
import type { ClientFormValues, ClientType } from "../../../../types/client";

interface EditUserDialogProps {
  open: boolean;
  selectedUser: ClientFormValues | null;
  onClose: () => void;
  onSuccess?: () => void;
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

export function EditUserDialog({ open, selectedUser, onClose, onSuccess }: EditUserDialogProps) {
  const { handleSubmit, control, reset, formState: { errors } } = useForm<ClientFormValues>({
    defaultValues,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedUser) {
      const clientType = selectedUser.clientType || 
        (selectedUser.type === 'mayorista' || selectedUser.tipo === 'mayorista' ? 'wholesaler' : 'retailer');

      reset({
        ...defaultValues,
        ...selectedUser,
        type: clientType,
        tipo: clientType === 'wholesaler' ? 'mayorista' : 'minorista',
        clientType: clientType,
      });
    } else {
      reset(defaultValues);
    }
  }, [selectedUser, reset]);

  const onSubmit = async (data: ClientFormValues) => {
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
      await api.put(putClientRoute(data.id), payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error updating client:', err);
      setError('No se pudo guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open && !!selectedUser}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: 'none', p: 1 } } }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ fontWeight: 500, color: 'text.primary', pb: 1 }}>Editar cliente</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                  value={field.value || 'minorista'}
                  onChange={e => field.onChange(e.target.value as ClientType)}
                  options={[
                    { value: 'retailer', label: 'Minorista' },
                    { value: 'wholesaler', label: 'Mayorista' },
                  ]}
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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <OutlinedButton onClick={onClose} disabled={saving}>Cancelar</OutlinedButton>
          <ContainedButton type="submit" disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Guardar'}
          </ContainedButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
