import { Box, Pagination, Typography } from '@mui/material';

export interface PaginatorProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  sx?: any;
}

export function Paginator({ page, totalPages, totalItems, onPageChange, sx }: PaginatorProps) {
  if (totalPages <= 1) return null;
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      mt: 3,
      gap: 1,
      ...sx
    }}>
      <Pagination 
        count={totalPages} 
        page={page} 
        onChange={onPageChange}
        color="primary"
        size="medium"
        showFirstButton
        showLastButton
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Página {page} de {totalPages}
          {totalItems !== undefined && ` • ${totalItems} resultado${totalItems !== 1 ? 's' : ''}`}
        </Typography>
      </Box>
    </Box>
  );
}