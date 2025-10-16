import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/ArchiveOutlined';
import AddIcon from '@mui/icons-material/Add';
import { Table } from '../../../../components/common/Table';
import { ContainedButton } from '../../../../components/common/ContainedButton';
import { ConfirmDialog } from '../../../../components/common/ConfirmDialog';
import api from '../../../../services/api';
import { getCategoriesRoute, putCategoryRoute } from '../../../../services/categories';
import { CategoryModal, type Category } from './CategoryModal';

export default function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [categoryToArchive, setCategoryToArchive] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get(getCategoriesRoute());
      setCategories(res.data.data || []);
    } catch (e) {
      console.error('Error loading categories:', e);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNewCategory = () => {
    setSelectedCategory(null);
    setOpenModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCategory(null);
  };

  const handleCategorySaved = () => {
    setOpenModal(false);
    setSelectedCategory(null);
    loadCategories();
  };

  const handleArchive = (category: Category) => {
    setCategoryToArchive(category);
    setArchiveDialogOpen(true);
  };

  const closeArchiveDialog = () => {
    setArchiveDialogOpen(false);
    setCategoryToArchive(null);
  };

  const confirmArchive = async () => {
    if (!categoryToArchive) return;
    
    try {
      await api.put(putCategoryRoute(categoryToArchive.id), {
        ...categoryToArchive,
        status: 'archived'
      });
      closeArchiveDialog();
      loadCategories();
    } catch (e) {
      console.error('Error archiving category:', e);
    }
  };

  return (
    <Box>
      <Box mb={2} display="flex" justifyContent="right" alignItems="center">
        <ContainedButton startIcon={<AddIcon />} onClick={handleNewCategory}>
          Nueva categoría
        </ContainedButton>
      </Box>
      
      <Table
        columns={[
          { label: 'Nombre', render: (c: Category) => c.name },
          { label: 'Descripción', render: (c: Category) => c.description },
          { label: 'Padre', render: (c: Category) => {
            const parent = categories.find(cat => cat.id === c.parentId);
            return parent ? parent.name : '-';
          } },
          { label: 'Destacada', render: (c: Category) => c.featured ? 'Sí' : 'No' },
          { label: 'Estado', render: (c: Category) => c.status === 'active' ? 'Activa' : 'Archivada' },
          {
            label: 'Acciones',
            render: (c: Category) => (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {c.status === 'active' && (
                  <Tooltip title="Archivar">
                    <IconButton 
                      color="secondary" 
                      size="small" 
                      onClick={(e) => {
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
        data={categories}
        getRowKey={(c: Category) => c.id}
        onRowClick={handleEditCategory}
        emptyMessage={loading ? "Cargando categorías..." : "No hay categorías"}
      />
      
      <CategoryModal
        open={openModal}
        initialData={selectedCategory}
        onClose={handleCloseModal}
        onSuccess={handleCategorySaved}
      />
      
      <ConfirmDialog
        open={archiveDialogOpen}
        title="¿Archivar categoría?"
        description={`¿Estás seguro que deseas archivar la categoría "${categoryToArchive?.name}"?`}
        confirmText="Archivar"
        cancelText="Cancelar"
        onConfirm={confirmArchive}
        onCancel={closeArchiveDialog}
      />
    </Box>
  );
}
