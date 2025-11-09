import { Table as MuiTable, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import type { ReactNode } from 'react';
import { CustomPaper } from './CustomPaper';

export interface TableColumn<T> {
  label: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  sx?: object;
  getRowSx?: (row: T) => object;
}

export function Table<T>({ columns, data, getRowKey, onRowClick, emptyMessage = 'Sin datos', sx, getRowSx }: TableProps<T>) {
  return (
    <TableContainer
      component={CustomPaper}
      sx={{
        p: 0,
        ...sx,
      }}
    >
      <MuiTable size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f7f7f7' }}>
            {columns.map((col, idx) => (
              <TableCell
                key={col.label + idx}
                align={col.align || 'left'}
                sx={{ fontWeight: 500, color: 'text.secondary', borderBottom: '1px solid #e0e0e0', width: col.width }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map(row => (
              <TableRow
                key={getRowKey(row)}
                hover
                sx={{
                  transition: 'background 0.2s',
                  ...(getRowSx ? getRowSx(row) : {}),
                  '&:hover': { backgroundColor: '#f0f0f0', cursor: onRowClick ? 'pointer' : 'default' }
                }}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col, idx) => (
                  <TableCell key={col.label + idx} align={col.align || 'left'} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
}
