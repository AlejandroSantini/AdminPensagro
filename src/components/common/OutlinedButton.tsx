import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import type { ReactNode } from 'react';

export interface OutlinedButtonProps extends ButtonProps {
  icon?: ReactNode;
  children: ReactNode;
}

export function OutlinedButton({ icon, children, ...props }: OutlinedButtonProps) {
  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={icon}
      sx={{
        borderRadius: 2,
        fontWeight: 500,
        textTransform: 'none',
        boxShadow: 'none',
        letterSpacing: 0,
        fontSize: '1rem',
        borderWidth: 1,
        '&:hover': {
          background: '#f5f5f5',
          borderWidth: 1,
          boxShadow: 'none',
        },
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
