import React from 'react';
import { IconButton, Tooltip, useTheme, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface DeleteButtonProps {
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
}

export default function DeleteButton({ onClick, disabled, loading, title = 'Eliminar' }: DeleteButtonProps) {
  const theme = useTheme();
  const size = '40px';
  const isDisabled = disabled || loading;

  return (
    <Tooltip title={loading ? 'Eliminando...' : title}>
      <IconButton
        onClick={onClick}
        disabled={isDisabled}
        sx={{
          width: size,
          height: size,
          minWidth: size,
          maxHeight: size,
          borderRadius: 2,
          border: '1px solid',
          borderColor: isDisabled ? theme.palette.grey[300] : theme.palette.error.main,
          color: isDisabled ? theme.palette.grey[500] : theme.palette.error.main,
          bgcolor: 'white',
          transition: 'background-color 150ms, color 150ms, border-color 150ms',
          '&:hover': {
            bgcolor: isDisabled ? 'transparent' : theme.palette.error.main,
            color: isDisabled ? theme.palette.grey[500] : theme.palette.common.white,
            borderColor: isDisabled ? theme.palette.grey[300] : theme.palette.error.main,
            '& .MuiSvgIcon-root': {
              color: isDisabled ? theme.palette.grey[500] : theme.palette.common.white,
            },
          },
          '&.Mui-disabled': {
            pointerEvents: 'none',
            borderColor: theme.palette.grey[300],
            color: theme.palette.grey[500],
            bgcolor: 'transparent',
          },
        }}
      >
        {loading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          <DeleteIcon />
        )}
      </IconButton>
    </Tooltip>
  );
}
