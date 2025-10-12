
import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import type { ReactNode } from 'react';

interface ContainedButtonProps extends ButtonProps {
  icon?: ReactNode;
  children: ReactNode;
}

export function ContainedButton({ icon, children, ...props }: ContainedButtonProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={icon}
      sx={{
        borderRadius: 2,
        fontWeight: 500,
        textTransform: 'none',
        boxShadow: 'none !important',
        letterSpacing: 0,
        fontSize: '1rem',
        background: '#1976d2',
        '&:hover': {
          background: '#115293',
          boxShadow: 'none !important',
        },
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
