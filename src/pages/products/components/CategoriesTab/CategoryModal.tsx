import { Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { ContainedButton } from '../../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../../components/common/OutlinedButton';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '../../../../components/common/Input';
import { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { postCategoryRoute, putCategoryRoute, getCategoriesRoute } from '../../../../services/categories';

export interface Category {
  id: number;
  name: string;
  description: string;
  featured: boolean;
  status: 'active' | 'archived';
  parentId?: number | null;
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
  
  const { handleSubmit, control, reset, formState: { errors } } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      featured: false,
      parentId: '',
      status: 'active'
    },
  });

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
    } else {
      reset({
        name: '',
        description: '',
        featured: false,
        parentId: '',
        status: 'active'
      });
    }
  }, [initialData, reset, open]);

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      if (initialData?.id) {
        await api.put(putCategoryRoute(initialData.id), {
          ...data,
          id: initialData.id
        });
      } else {
        await api.post(postCategoryRoute(), data);
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
        <DialogTitle>{initialData ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
        
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
                sx={{ mb: 1, ml: 0 }}
              />
            )}
          />
        </DialogContent>
        
        <DialogActions>
          <OutlinedButton onClick={onClose} disabled={loading}>
            Cancelar
          </OutlinedButton>
          <ContainedButton type="submit" disabled={loading}>
            {initialData ? 'Guardar cambios' : 'Crear categoría'}
          </ContainedButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}