import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArchiveIcon from '@mui/icons-material/ArchiveOutlined';
import AddIcon from '@mui/icons-material/Add';
import { Table } from '../../../../components/common/Table';
import { ContainedButton } from '../../../../components/common/ContainedButton';
import { ConfirmDialog } from '../../../../components/common/ConfirmDialog';
import api from '../../../../services/api';
import { getCombosRoute, putComboRoute } from '../../../../services/combos';
import type { Combo, ApiCombo, ProductRef } from '../../../../../types/combo';


export default function CombosTab() {
  const navigate = useNavigate();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [comboToArchive, setComboToArchive] = useState<Combo | null>(null);

  const loadCombos = async () => {
    try {
      const res = await api.get(getCombosRoute());
      
      const transformedCombos: Combo[] = res.data.data.map((apiCombo: ApiCombo) => ({
        id: parseInt(apiCombo.id),
        name: apiCombo.name,
        description: apiCombo.description || '',
        products: apiCombo.products || [],
        price: parseFloat(apiCombo.total_price),
        featured: apiCombo.featured,
        status: apiCombo.active ? 'active' : 'archived'
      }));
      
      setCombos(transformedCombos);
    } catch (error) {
      console.error('Error al cargar los combos:', error);
    }
  };

  useEffect(() => {
    loadCombos();
  }, []);

  const goToNewCombo = () => {
    navigate('/productos/combo/nuevo');
  };

  const goToEditCombo = (combo: Combo) => {
    navigate(`/productos/combo/${combo.id}`);
  };

  const handleArchive = (combo: Combo) => {
    setComboToArchive(combo);
    setArchiveDialogOpen(true);
  };

  const closeArchiveDialog = () => {
    setArchiveDialogOpen(false);
    setComboToArchive(null);
  };

  const confirmArchive = async () => {
    if (!comboToArchive) return;
    
    try {
      await api.put(putComboRoute(comboToArchive.id), {
        ...comboToArchive,
        total_price: comboToArchive.price.toString(),
        active: false
      });
      
      setCombos(combos.map(c => 
        c.id === comboToArchive.id ? { ...c, status: 'archived' } : c
      ));
    } catch (error) {
      console.error('Error al archivar el combo:', error);
    } finally {
      closeArchiveDialog();
    }
  };

  return (
    <Box>
      <Box mb={2} display="flex" justifyContent="right" alignItems="center">
        <ContainedButton startIcon={<AddIcon />} onClick={goToNewCombo}>Nuevo combo</ContainedButton>
      </Box>
      
      <Table
        columns={[
          { label: 'Nombre', render: (c: Combo) => c.name },
          { label: 'Productos', render: (c: Combo) => c.products.map(p => p.name).join(', ') },
          { label: 'Precio', render: (c: Combo) => `$${c.price}` },
          { label: 'Destacado', render: (c: Combo) => c.featured ? 'Sí' : 'No' },
          { label: 'Estado', render: (c: Combo) => c.status === 'active' ? 'Activo' : 'Archivado' },
          {
            label: 'Acciones',
            render: (c: Combo) => (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {c.status === 'active' && (
                  <Tooltip title="Archivar">
                    <IconButton 
                      color="secondary" 
                      size="small" 
                      sx={{ boxShadow: 'none' }} 
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleArchive(c);
                      }}
                    >
                      <ArchiveIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ),
            align: 'center',
          },
        ]}
        data={combos}
        getRowKey={(c: Combo) => c.id}
        onRowClick={goToEditCombo}
        emptyMessage="No hay combos"
      />
      
      <ConfirmDialog
        open={archiveDialogOpen}
        title="¿Archivar combo?"
        description={comboToArchive ? `¿Estás seguro que deseas archivar el combo "${comboToArchive.name}"?` : ''}
        confirmText="Archivar"
        cancelText="Cancelar"
        onConfirm={confirmArchive}
        onCancel={closeArchiveDialog}
      />
    </Box>
  );
}