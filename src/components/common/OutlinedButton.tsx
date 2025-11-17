import { Button, CircularProgress, Box } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import type { ReactNode } from 'react';

export interface OutlinedButtonProps extends ButtonProps {
  icon?: ReactNode;
  children: ReactNode;
  loading?: boolean;
}

export function OutlinedButton({ icon, children, loading, disabled, ...props }: OutlinedButtonProps) {
  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={!loading ? icon : undefined}
      disabled={disabled || loading}
      sx={{
        borderRadius: 2,
        fontWeight: 500,
        textTransform: 'none',
        boxShadow: 'none',
        letterSpacing: 0,
        fontSize: '1rem',
        borderWidth: 1,
        minWidth: loading ? 140 : undefined,
        '&:hover': {
          background: '#f5f5f5',
          borderWidth: 1,
          boxShadow: 'none',
        },
        ...props.sx,
      }}
      {...props}
    >
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} color="inherit" />
          <span>Cargando...</span>
        </Box>
      ) : (
        children
      )}
    </Button>
  );
}
