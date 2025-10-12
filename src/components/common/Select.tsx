import { FormControl, InputLabel, Select as MuiSelect, MenuItem } from '@mui/material';
import type { SelectProps } from '@mui/material';
import type { ReactNode } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: ReactNode;
}

export interface SelectPropsCustom extends Omit<SelectProps, 'children'> {
  label: string;
  options: SelectOption[];
  value: SelectProps['value'];
  onChange: SelectProps['onChange'];
}

export function Select({ label, options, value, onChange, sx, ...props }: SelectPropsCustom) {
  return (
    <FormControl
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
    >
      <InputLabel>{label}</InputLabel>
      <MuiSelect
        label={label}
        value={value}
        onChange={onChange}
        slotProps={{
          root: {
            sx: {
              borderRadius: 2,
              height: 40,
              minHeight: 40,
              maxHeight: 40,
            },
          },
        }}
        {...props}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.icon && <span style={{ marginRight: 8 }}>{option.icon}</span>}
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}
