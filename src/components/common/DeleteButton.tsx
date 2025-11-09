import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface DeleteButtonProps {
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  title?: string;
}

export default function DeleteButton({ onClick, disabled, title = 'Eliminar' }: DeleteButtonProps) {
  const theme = useTheme();
  const size = '40px';

  return (
    <Tooltip title={title}>
      <IconButton
        onClick={onClick}
        disabled={disabled}
        sx={{
          width: size,
          height: size,
          minWidth: size,
          maxHeight: size,
          borderRadius: 2,
          border: '1px solid',
          borderColor: disabled ? theme.palette.grey[300] : theme.palette.error.main,
          color: disabled ? theme.palette.grey[500] : theme.palette.error.main,
          bgcolor: 'white',
          transition: 'background-color 150ms, color 150ms, border-color 150ms',
          '&:hover': {
            bgcolor: disabled ? 'transparent' : theme.palette.error.main,
            color: disabled ? theme.palette.grey[500] : theme.palette.common.white,
            borderColor: disabled ? theme.palette.grey[300] : theme.palette.error.main,
            '& .MuiSvgIcon-root': {
              color: disabled ? theme.palette.grey[500] : theme.palette.common.white,
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
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  );
}
