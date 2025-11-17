import { useState, useEffect } from 'react';
import { Box, Typography, MenuItem, CircularProgress, Alert, IconButton, Chip, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CustomPaper } from '../../../components/common/CustomPaper';
import { Input } from '../../../components/common/Input';
import { ContainedButton } from '../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../components/common/OutlinedButton';
import api from '../../../services/api';
import { getBlogPostByIdRoute, putBlogPostRoute, postBlogPostRoute } from '../../../services/blog';
import type { BlogPost, BlogPostFormData } from '../../../../types/blog';

export default function BlogForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const isEditMode = !!id;
  const pageTitle = isEditMode ? 'Editar Publicación' : 'Nueva Publicación';
  const buttonText = isEditMode ? 'Guardar Cambios' : 'Publicar';
  
  const { handleSubmit, control, reset, formState: { errors } } = useForm<BlogPostFormData>({
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      featured_image: '',
      status: 'draft',
      category: '',
      tags: [],
    }
  });


  useEffect(() => {
    if (!isEditMode) return;
    
    const fetchBlogPost = async () => {
      setFetchLoading(true);
      setError(null);
      
      try {
        const res = await api.get(getBlogPostByIdRoute(id));
        const postData = res.data.data;
        setBlogPost(postData);
        setContent(postData.content || '');
        setTags(postData.tags || []);
        
        reset({
          id: postData.id,
          title: postData.title,
          content: postData.content || '',
          excerpt: postData.excerpt || '',
          featured_image: postData.featured_image || '',
          status: postData.status || 'draft',
          category: postData.category || '',
          tags: postData.tags || [],
        });
      } catch (e) {
        console.error('Error al cargar publicación:', e);
        setError('No se pudo cargar la publicación');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchBlogPost();
  }, [id, reset, isEditMode]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const onSubmit = async (data: BlogPostFormData) => {
    setLoading(true);
    setError(null);
    
    const payload = {
      title: data.title,
      content: content,
      excerpt: data.excerpt || '',
      featured_image: data.featured_image || '',
      status: data.status,
      category: data.category || '',
      tags: tags,
    };

    console.log('Payload a enviar:', payload);

    try {
      if (isEditMode) {
        await api.put(putBlogPostRoute(id!), payload);
      } else {
        await api.post(postBlogPostRoute(), payload);
      }
      
      setLoading(false);
      navigate('/blog');
    } catch (e: any) {
      setLoading(false);
      setError(e.response?.data?.message || (isEditMode ? 'Error al actualizar la publicación' : 'Error al crear la publicación'));
    }
  };

  const handleCancel = () => {
    navigate('/blog');
  };

  if (isEditMode && fetchLoading) {
    return (
      <Box>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton 
            onClick={handleCancel} 
            sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
            aria-label="volver"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">Cargando publicación...</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  if (error && isEditMode) {
    return (
      <Box>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton 
            onClick={handleCancel} 
            sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
            aria-label="volver"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">{pageTitle}</Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <OutlinedButton onClick={handleCancel}>
            Volver al blog
          </OutlinedButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton 
          onClick={handleCancel} 
          sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
          aria-label="volver"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">
          {isEditMode ? `Editar: ${blogPost?.title}` : 'Nueva Publicación'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <CustomPaper>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          
          <Controller
            name="title"
            control={control}
            rules={{ required: 'El título es obligatorio' }}
            render={({ field }) => (
              <Input 
                label="Título" 
                {...field} 
                sx={{ mb: 3 }} 
                variant="outlined" 
                required 
                error={!!errors.title} 
                helperText={errors.title?.message} 
              />
            )}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Input
                  label="Estado"
                  select
                  {...field}
                  variant="outlined"
                >
                  <MenuItem value="draft">Borrador</MenuItem>
                  <MenuItem value="published">Publicado</MenuItem>
                  <MenuItem value="archived">Archivado</MenuItem>
                </Input>
              )}
            />

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Input 
                  label="Categoría" 
                  {...field} 
                  variant="outlined"
                  placeholder="ej: Noticias, Tutoriales..."
                />
              )}
            />
          </Box>

          <Controller
            name="excerpt"
            control={control}
            render={({ field }) => (
              <Input 
                label="Extracto (resumen breve)" 
                multiline 
                minRows={2} 
                {...field} 
                sx={{ mb: 3 }} 
                variant="outlined"
                helperText="Descripción corta que aparecerá en las vistas previas"
              />
            )}
          />

          <Controller
            name="featured_image"
            control={control}
            render={({ field }) => (
              <Input 
                label="URL Imagen Destacada" 
                {...field} 
                sx={{ mb: 3 }} 
                variant="outlined"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            )}
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Etiquetas</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'start' }}>
              <Box sx={{ flex: 1 }}>
                <Input
                  label="Agregar etiqueta"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  variant="outlined"
                />
              </Box>
              <OutlinedButton 
                onClick={handleAddTag}
              >
                Agregar
              </OutlinedButton>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Contenido <span style={{ color: 'red' }}>*</span>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Puedes usar Markdown para dar formato al texto (ej: **negrita**, *cursiva*, # Título, etc.)
            </Typography>
            <Input
              label=""
              multiline
              minRows={20}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              variant="outlined"
              placeholder="Escribe el contenido de tu publicación aquí...&#10;&#10;Puedes usar Markdown:&#10;# Título principal&#10;## Subtítulo&#10;**texto en negrita**&#10;*texto en cursiva*&#10;[enlace](https://ejemplo.com)&#10;![imagen](url-imagen.jpg)"
              error={!content}
              helperText={!content && "El contenido es obligatorio"}
              sx={{
                '& textarea': {
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: 1.6,
                }
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <OutlinedButton onClick={handleCancel} loading={loading}>
              Cancelar
            </OutlinedButton>
            <ContainedButton type="submit" disabled={!content} loading={loading}>
              {buttonText}
            </ContainedButton>
          </Box>
        </Box>
      </CustomPaper>
    </Box>
  );
}
