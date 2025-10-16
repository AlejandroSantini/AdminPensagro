import { Paper } from '@mui/material';
import type { PaperProps } from '@mui/material';
import React from 'react';

export interface CustomPaperProps extends PaperProps {
  children: React.ReactNode;
}

export function CustomPaper({ children, sx, ...props }: CustomPaperProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        background: '#fff',
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}