import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Chip,
  Paper,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import { Table } from '../../components/common/Table';
import { Paginator } from '../../components/common/Paginator';
import type { BlogPost } from '../../../types/blog';
import api from '../../services/api';
import { deleteBlogPostRoute, getBlogPostsRoute } from '../../services/blog';
import { ContainedButton } from '../../components/common/ContainedButton';
import { OutlinedButton } from '../../components/common/OutlinedButton';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUrlGeneratorModal } from './components/ImageUrlGeneratorModal';

export default function Blog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadPosts = useCallback(async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const res = await api.get(getBlogPostsRoute(), { params: { page: pageNum, per_page: 10 } });
      setPosts(res.data.data || []);
      
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalItems(res.data.meta.totalItems || 0);
      }
    } catch (e) {
      console.error('Error al cargar publicaciones:', e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    loadPosts(newPage);
  };

  const handleDelete = (post: BlogPost) => {
    setDeletingPost(post);
    setOpenDelete(true);
  };

  const closeDelete = () => {
    setOpenDelete(false);
    setDeletingPost(null);
  };

  const confirmDelete = async () => {
    if (!deletingPost) return;
    
    try {
      await api.delete(deleteBlogPostRoute(deletingPost.id));
      loadPosts(page);
      closeDelete();
    } catch (e) {
      console.error('Error al eliminar publicación:', e);
      alert('No se pudo eliminar la publicación');
    }
  };

  const goToEdit = (postId: number) => {
    navigate(`/blog/${postId}`);
  };

  const goToNew = () => {
    navigate('/blog/nuevo');
  };

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'published':
        return <Chip label="Publicado" color="success" size="small" />;
      case 'draft':
        return <Chip label="Borrador" color="default" size="small" />;
      case 'archived':
        return <Chip label="Archivado" color="warning" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Blog</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <OutlinedButton startIcon={<ImageIcon />} onClick={() => setOpenImageModal(true)}>
            Crear url de imagen
          </OutlinedButton>
          <ContainedButton startIcon={<AddIcon />} onClick={goToNew}>
            Nueva Publicación
          </ContainedButton>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 2 }}>
        <Table
          columns={[
            { 
              label: 'Título', 
              render: (post: BlogPost) => (
                <Box>
                  <Typography variant="body2" fontWeight={500}>{post.title}</Typography>
                  {post.excerpt && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {post.excerpt.substring(0, 100)}...
                    </Typography>
                  )}
                </Box>
              )
            },
            { 
              label: 'Categoría', 
              render: (post: BlogPost) => post.category || '-'
            },
            { 
              label: 'Estado', 
              render: (post: BlogPost) => getStatusChip(post.status)
            },
            { 
              label: 'Fecha', 
              render: (post: BlogPost) => new Date(post.created_at).toLocaleDateString('es-AR')
            },
            {
              label: 'Acciones',
              render: (post: BlogPost) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={(e: any) => { e.stopPropagation(); handleDelete(post); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ),
            },
          ]}
          data={posts}
          getRowKey={(post: BlogPost) => post.id}
          emptyMessage={loading ? "Cargando publicaciones..." : "No hay publicaciones"}
          onRowClick={(post: BlogPost) => goToEdit(post.id)}
        />
        <Paginator
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
        />
      </Paper>

      <ConfirmDialog
        open={openDelete}
        title="Eliminar publicación"
        description={`¿Estás seguro de que deseas eliminar "${deletingPost?.title}"?`}
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />

      <ImageUrlGeneratorModal
        open={openImageModal}
        onClose={() => setOpenImageModal(false)}
      />
    </Box>
  );
}
