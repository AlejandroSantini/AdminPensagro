import { TextField, InputAdornment, IconButton } from '@mui/material';
import type { TextFieldProps } from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface SearchInputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
  onClear?: () => void;
  showClear?: boolean;
}

export function SearchInput({ onClear, showClear, InputProps, ...props }: SearchInputProps) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      size="small"
      {...props}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: showClear && onClear ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  color: 'error.main',
                  bgcolor: 'rgba(211, 47, 47, 0.08)'
                } 
              }}
            >
              <CloseIcon sx={{ fontSize: '1.25rem' }} />
            </IconButton>
          </InputAdornment>
        ) : undefined,
        readOnly: true,
        ...InputProps
      }}
      sx={{
        borderRadius: 2,
        mb: 2,
        mt: 0,
        '& .MuiInputBase-root': {
          borderRadius: 2,
          cursor: 'pointer',
        },
        '& .MuiInputBase-input': {
          cursor: 'pointer',
        },
        ...props.sx,
      }}
    />
  );
}
 