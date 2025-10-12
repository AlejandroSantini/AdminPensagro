import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  icon: ReactNode;
  onClick: () => void;
}

export function DashboardCard({ title, icon, onClick }: DashboardCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        background: '#fff',
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
        minWidth: 180,
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: '0 4px 16px 0 rgba(0,0,0,0.08)',
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 140, justifyContent: 'center' }}>
        <Box sx={{ mb: 1, fontSize: 40, color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </Box>
        <CardContent sx={{ p: 0 }}>
          <Typography variant="subtitle1" color="text.primary" align="center" fontWeight={500}>
            {title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
