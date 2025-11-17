import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { ContainedButton } from './ContainedButton';
import { OutlinedButton } from './OutlinedButton';
import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = '¿Estás seguro?',
  description,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
}) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontWeight: 500 }}>{title}</DialogTitle>
    {description && (
      <DialogContent>
        <Typography>{description}</Typography>
      </DialogContent>
    )}
    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
      <OutlinedButton onClick={onCancel} loading={loading}>{cancelText}</OutlinedButton>
      <ContainedButton onClick={onConfirm} color="error" loading={loading}>{confirmText}</ContainedButton>
    </DialogActions>
  </Dialog>
);
