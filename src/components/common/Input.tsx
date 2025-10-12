import { TextField } from '@mui/material';
import type { OutlinedTextFieldProps } from '@mui/material';
import type { ChangeEvent, ReactNode } from 'react';

export interface InputProps extends Omit<OutlinedTextFieldProps, 'value'> {
  label: string;
  icon?: ReactNode;
  type?: string;
  error?: boolean;
  helperText?: ReactNode;
  value?: string | number | (string | number)[];
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  endAdornment?: ReactNode;
}

export function Input({ label, icon, type, sx, variant = 'outlined', endAdornment, ...props }: InputProps) {
  return (
    <TextField
      label={label}
      type={type}
      fullWidth
      sx={{
        borderRadius: 2,
        mb: 2,
        mt: 1,
        height: 40,
        minHeight: 40,
        maxHeight: 40,
        '& .MuiInputBase-root': {
          borderRadius: 2,
          height: 40,
          minHeight: 40,
          maxHeight: 40,
        },
        ...(sx || {}),
      }}
      variant={variant}
      slotProps={{
        input: {
          startAdornment: icon,
          endAdornment: endAdornment,
        },
      }}
      {...props}
    />
  );
}
