
import { Button, CircularProgress, Box } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import type { ReactNode } from 'react';

interface ContainedButtonProps extends ButtonProps {
  icon?: ReactNode;
  children: ReactNode;
  loading?: boolean;
}

export function ContainedButton({ icon, children, loading, disabled, ...props }: ContainedButtonProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={!loading ? icon : undefined}
      disabled={disabled || loading}
      sx={{
        borderRadius: 2,
        fontWeight: 500,
        textTransform: 'none',
        boxShadow: 'none !important',
        letterSpacing: 0,
        fontSize: '1rem',
        background: '#1976d2',
        minWidth: loading ? 140 : undefined,
        '&:hover': {
          background: '#115293',
          boxShadow: 'none !important',
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
