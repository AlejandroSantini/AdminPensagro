

import { Box, Typography } from '@mui/material';
import { SimpleTabs } from '../../components/common/SimpleTabs';
import ProductsTab from './components/ProductsTab/ProductsTab';
import CategoriesTab from './components/CategoriesTab';
import RelatedTab from './components/RelatedTab';
import FeaturedTab from './components/FeaturedTab';
import CombosTab from './components/CombosTab';


export default function Products() {
  const tabs = [
    { label: 'Producto', content: <ProductsTab /> },
    { label: 'Categorías y subcategorías', content: <CategoriesTab /> },
    { label: 'Productos relacionados', content: <RelatedTab /> },
    { label: 'Productos destacados', content: <FeaturedTab /> },
    { label: 'Combos de productos', content: <CombosTab /> },
  ];
  return (
    <Box>
      <Typography variant="h5" mb={2}>Productos</Typography>
      <SimpleTabs tabs={tabs} />
    </Box>
  );
}
