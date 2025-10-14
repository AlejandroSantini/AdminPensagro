import { FormControl, InputLabel, Select as MuiSelect, MenuItem } from '@mui/material';
import type { SelectProps } from '@mui/material';
import { useId } from 'react';
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
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const selectId = `${baseId}-control`;

  return (
    <FormControl
      fullWidth
      size="small"
      variant="outlined"
      sx={{
        borderRadius: 2,
        mb: 2,
        mt: 1,
        '& .MuiInputBase-root': {
          borderRadius: 2,
        },
        ...(sx || {}),
      }}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <MuiSelect
        id={selectId}
        labelId={labelId}
        label={label}
        value={value}
        onChange={onChange}
        size="small"
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
