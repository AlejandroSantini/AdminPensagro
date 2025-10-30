import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Chip,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Table } from '../../components/common/Table';
import type { BlogPost } from '../../../types/blog';
import api from '../../services/api';
import { deleteBlogPostRoute, getBlogPostsRoute } from '../../services/blog';
import { ContainedButton } from '../../components/common/ContainedButton';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export default function Blog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(getBlogPostsRoute());
      setPosts(res.data.data || []);
    } catch (e) {
      console.error('Error al cargar publicaciones:', e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
      loadPosts();
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
    loadPosts();
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
        <ContainedButton startIcon={<AddIcon />} onClick={goToNew}>
          Nueva Publicación
        </ContainedButton>
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
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ),
            },
          ]}
          data={posts}
          getRowKey={(post: BlogPost) => post.id}
          emptyMessage={loading ? "Cargando publicaciones..." : "No hay publicaciones"}
          onRowClick={(post: BlogPost) => goToEdit(post.id)}
        />
      </Paper>

      <ConfirmDialog
        open={openDelete}
        title="Eliminar publicación"
        description={`¿Estás seguro de que deseas eliminar "${deletingPost?.title}"?`}
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </Box>
  );
}
