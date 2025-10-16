
import { Tabs, Tab, Box } from '@mui/material';
import { useState } from 'react';
import { CustomPaper } from './CustomPaper';

export interface SimpleTab {
  label: string;
  content: React.ReactNode;
}

interface SimpleTabsProps {
  tabs: SimpleTab[];
  defaultTab?: number;
}

export function SimpleTabs({ tabs, defaultTab = 0 }: SimpleTabsProps) {
  const [tab, setTab] = useState(defaultTab);
  return (
    <CustomPaper sx={{ p: 2 }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: '1px solid #e0e0e0',
          minHeight: 32,
          mb: 1,
          '.MuiTab-root': {
            minWidth: 80,
            fontWeight: 500,
            color: 'text.secondary',
            textTransform: 'none',
            fontSize: 15,
            mb: 0,
            pb: 0.5,
            pt: 0.5,
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        {tabs.map((t) => (
          <Tab key={t.label} label={<span style={{ textTransform: 'none', fontSize: 15 }}>{t.label}</span>} />
        ))}
      </Tabs>
      <Box sx={{ mt: 1.2 }}>{tabs[tab].content}</Box>
    </CustomPaper>
  );
}
