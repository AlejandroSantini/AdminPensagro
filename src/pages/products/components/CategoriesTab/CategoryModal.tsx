import { Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControlLabel, Checkbox, Box, Typography } from '@mui/material';
import { ContainedButton } from '../../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../../components/common/OutlinedButton';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '../../../../components/common/Input';
import ImageUploader from '../../../../components/common/ImageUploader';
import { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { postCategoryWithImageRoute, putCategoryWithImageRoute, getCategoriesRoute } from '../../../../services/categories';

export interface Category {
  id: number;
  name: string;
  description: string;
  featured: boolean;
  status: 'active' | 'archived';
  parentId?: number | null;
  image?: string | null;
}

export interface CategoryFormData {
  id?: number;
  name: string;
  description: string;
  featured: boolean;
  parentId: string | number;
  status?: string;
}

export interface CategoryModalProps {
  open: boolean;
  initialData?: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryModal({ open, initialData, onClose, onSuccess }: CategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [removeImage, setRemoveImage] = useState(false);
  
  const { handleSubmit, control, watch, reset, formState: { errors } } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      featured: false,
      parentId: '',
      status: 'active'
    },
  });

  const parentIdValue = watch('parentId');

  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        try {
          const res = await api.get(getCategoriesRoute());
          setCategories(res.data.data || []);
        } catch (e) {
          setCategories([]);
        }
      };
      fetchCategories();
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      reset({
        id: initialData.id,
        name: initialData.name,
        description: initialData.description,
        featured: initialData.featured,
        parentId: initialData.parentId || '',
        status: initialData.status
      });

      if (initialData.image) {
        setImages([initialData.image]);
      } else {
        setImages([]);
      }
      setRemoveImage(false);
    } else {
      reset({
        name: '',
        description: '',
        featured: false,
        parentId: '',
        status: 'active'
      });
      setImages([]);
      setRemoveImage(false);
    }
  }, [initialData, reset, open]);

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
    setRemoveImage(newImages.length === 0 && !!initialData?.image);
  };

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      formData.append('featured', data.featured ? '1' : '0');
      if (data.parentId) formData.append('parentId', String(data.parentId));
      formData.append('status', data.status || 'active');
      
      if (images.length > 0) {
        // Convert dataURL to File
        const dataUrl = images[0];
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const fileName = `category-image-${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`;
        const file = new File([blob], fileName, { type: blob.type });
        formData.append('image', file);
      }
      if (removeImage) {
        formData.append('remove_image', '1');
      }

      if (initialData?.id) {
        await api.post(putCategoryWithImageRoute(initialData.id), formData);
      } else {
        await api.post(postCategoryWithImageRoute(), formData);
      }
      
      setLoading(false);
      onSuccess();
    } catch (e) {
      setLoading(false);
      console.error('Error saving category:', e);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <DialogTitle>
          {(parentIdValue || initialData?.parentId)
            ? (initialData ? 'Editar subcategoría' : 'Nueva subcategoría')
            : (initialData ? 'Editar categoría' : 'Nueva categoría')
          }
        </DialogTitle>
        
        <DialogContent>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'El nombre es obligatorio' }}
            render={({ field }) => (
              <Input label="Nombre" {...field} sx={{ mb: 2, mt: 1 }} variant="outlined" required error={!!errors.name} helperText={errors.name?.message} />
            )}
          />
          
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input label="Descripción" multiline minRows={2} {...field} sx={{ mb: 2 }} variant="outlined" />
            )}
          />
          
          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <Input
                label="Categoría padre"
                select
                {...field}
                value={field.value || ''}
                sx={{ mb: 2 }}
                variant="outlined"
              >
                <MenuItem value="">Sin categoría padre</MenuItem>
                {categories
                  .filter(c => !c.parentId && (!initialData || c.id !== initialData.id))
                  .map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))
                }
              </Input>
            )}
          />
          
          <Controller
            name="featured"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={!!field.value} 
                    onChange={e => field.onChange(e.target.checked)} 
                    name="featured" 
                    color="primary" 
                  />
                }
                label="Destacada"
                sx={{ mb: 2, ml: 0 }}
              />
            )}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Imagen de categoría
            </Typography>
            <ImageUploader
              value={images}
              onChange={handleImagesChange}
              multiple={false}
              emptyText="Haz clic aquí o arrastra una imagen"
              supportText="Soporta: JPG, PNG, WebP"
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <OutlinedButton onClick={onClose} disabled={loading}>
            Cancelar
          </OutlinedButton>
          <ContainedButton type="submit" loading={loading}>
            {initialData ? 'Guardar cambios' : 'Crear categoría'}
          </ContainedButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}