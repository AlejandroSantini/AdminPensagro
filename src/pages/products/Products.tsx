

import { Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { SimpleTabs } from '../../components/common/SimpleTabs';
import ProductsTab from './components/ProductsTab/ProductsTab';
import CategoriesTab from './components/CategoriesTab/CategoriesTab';
import CombosTab from './components/CombosTab/CombosTab';


export default function Products() {
  const location = useLocation();
  
  const activeTab = location.state?.activeTab || 0;
  
  const tabs = [
    { label: 'Producto', content: <ProductsTab /> },
    { label: 'Categorías y subcategorías', content: <CategoriesTab /> },
    { label: 'Combos de productos', content: <CombosTab /> },
  ];
  
  return (
    <Box>
      <Typography variant="h5" mb={2}>Productos</Typography>
      <SimpleTabs tabs={tabs} defaultTab={activeTab} />
    </Box>
  );
}
