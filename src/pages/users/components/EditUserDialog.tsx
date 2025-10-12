import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box } from "@mui/material";
import { Input } from "../../../components/common/Input";
import { Select } from "../../../components/common/Select";
import { ContainedButton } from "../../../components/common/ContainedButton";
import { OutlinedButton } from "../../../components/common/OutlinedButton";
import type { User } from "../../../types";
import { useForm, Controller } from 'react-hook-form';

type UserType = 'minorista' | 'mayorista';
interface UserWithType extends User {
  userType: UserType;
}
interface EditUserDialogProps {
  open: boolean;
  selectedUser: UserWithType | null;
  onChange: (user: UserWithType) => void;
  onClose: () => void;
  onSave: () => void;
}

export function EditUserDialog({ open, selectedUser, onChange, onClose, onSave }: EditUserDialogProps) {
  const { handleSubmit, control, reset, formState: { errors } } = useForm<UserWithType>({
    defaultValues: selectedUser || {
      id: 0,
      name: '',
      email: '',
      tipo: 'minorista',
      userType: 'minorista',
      fiscalType: '',
      status: 'active',
      createdAt: '',
      updatedAt: '',
    },
  });

  // Reset form when selectedUser changes
  React.useEffect(() => {
    if (selectedUser) {
      reset(selectedUser);
    }
  }, [selectedUser, reset]);

  const onSubmit = (data: UserWithType) => {
    onChange(data);
    onSave();
  };

  return (
    <Dialog
      open={open && !!selectedUser}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: 'none', p: 1 } } }}
    >
      <DialogTitle sx={{ fontWeight: 500, color: 'text.primary', pb: 1 }}>Editar usuario/cliente</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'El nombre es obligatorio' }}
              render={({ field }) => (
                <Input label="Nombre" {...field} sx={{ borderRadius: 2, mb: 2, mt: 2, height: 48 }} variant="outlined" error={!!errors.name} helperText={errors.name?.message} />
              )}
            />
            <Controller
              name="email"
              control={control}
              rules={{ required: 'El email es obligatorio' }}
              render={({ field }) => (
                <Input label="Email" {...field} sx={{ borderRadius: 2, mb: 2, height: 48 }} variant="outlined" error={!!errors.email} helperText={errors.email?.message} />
              )}
            />
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <Select
                  label="Tipo"
                  value={field.value || 'minorista'}
                  onChange={e => field.onChange(e.target.value)}
                  options={[
                    { value: "minorista", label: "Minorista" },
                    { value: "mayorista", label: "Mayorista" },
                  ]}
                  sx={{ borderRadius: 2, mb: 2, height: 48 }}
                />
              )}
            />
            <Controller
              name="fiscalType"
              control={control}
              render={({ field }) => (
                <Input label="Tipo fiscal" {...field} variant="outlined" />
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
                    { value: "active", label: "Activo" },
                    { value: "inactive", label: "Inactivo" },
                  ]}
                />
              )}
            />
          </Box>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <OutlinedButton onClick={onClose}>Cancelar</OutlinedButton>
            <ContainedButton type="submit">Guardar</ContainedButton>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
// ...existing code...
}
