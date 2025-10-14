import { Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { ContainedButton } from '../../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../../components/common/OutlinedButton';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '../../../../components/common/Input';
import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { postProductRoute, putProductRoute } from '../../../../services/products';
import { getCategoriesRoute, getSubcategoriesRoute } from '../../../../services/categories';


export interface ProductFormData {
  id?: number;
  sku: string;
  name: string;
  description: string;
  price_usd: number;
  stock: number;
  iva: number;
  featured: boolean;
  categoryId: number;
  subcategoryId: number;
}

export interface ProductModalProps {
  open: boolean;
  initialData?: Partial<ProductFormData>;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductModal({ open, initialData, onClose, onSuccess }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<{ id: number; name: string }[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<{ id: number; name: string }[]>([]);
  const { handleSubmit, control, reset, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: initialData || {
      sku: '',
      name: '',
      description: '',
      price_usd: 0,
      stock: 0,
      iva: 0,
      featured: false,
      categoryId: 0,
      subcategoryId: 0,
    },
  });

  useEffect(() => {
    reset(initialData || {
      sku: '',
      name: '',
      description: '',
      price_usd: 0,
      stock: 0,
      iva: 0,
      featured: false,
      categoryId: 0,
      subcategoryId: 0,
    });
  }, [open, initialData, reset]);

  const fetchCategories = async () => {
    try {
      const res = await api.get(getCategoriesRoute());
      setCategoryOptions(res.data.data || []);
    } catch (e) {
      setCategoryOptions([]);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await api.get(getSubcategoriesRoute());
      setSubcategoryOptions(res.data.data || []);
    } catch (e) {
      setSubcategoryOptions([]);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchSubcategories();
    }
  }, [open]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    const payload = {
      ...data,
      price_usd: parseFloat(String(data.price_usd)) || 0,
      stock: parseInt(String(data.stock)) || 0,
      iva: parseInt(String(data.iva)) || 0,
      categoryId: parseInt(String(data.categoryId)) || 0,
      subcategoryId: parseInt(String(data.subcategoryId)) || 0,
    };

    try {
      if (!initialData) {
        await api.post(postProductRoute(), payload);
      } else {
        const id = data.id || (initialData as any).id;
        await api.put(putProductRoute(id), { ...payload, id });
      }

      setLoading(false);
      onClose();
      onSuccess();
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <DialogTitle>{initialData ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        <DialogContent>
          <Controller
            name="sku"
            control={control}
            rules={{ required: 'El SKU es obligatorio' }}
            render={({ field }) => (
              <Input label="SKU" {...field} sx={{ mb: 2 }} variant="outlined" required error={!!errors.sku} helperText={errors.sku?.message} />
            )}
          />
          <Controller
            name="name"
            control={control}
            rules={{ required: 'El nombre es obligatorio' }}
            render={({ field }) => (
              <Input label="Nombre" {...field} sx={{ mb: 2 }} variant="outlined" required error={!!errors.name} helperText={errors.name?.message} />
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
            name="price_usd"
            control={control}
            rules={{ required: 'El precio es obligatorio', min: { value: 0, message: 'Debe ser mayor o igual a 0' } }}
            render={({ field }) => (
              <Input label="Precio USD" type="number" {...field} sx={{ mb: 2 }} variant="outlined" required error={!!errors.price_usd} helperText={errors.price_usd?.message} />
            )}
          />
          <Controller
            name="stock"
            control={control}
            rules={{ required: 'El stock es obligatorio', min: { value: 0, message: 'Debe ser mayor o igual a 0' } }}
            render={({ field }) => (
              <Input label="Stock" type="number" {...field} sx={{ mb: 2 }} variant="outlined" required error={!!errors.stock} helperText={errors.stock?.message} />
            )}
          />
          <Controller
            name="iva"
            control={control}
            rules={{ required: 'El IVA es obligatorio', min: { value: 0, message: 'Debe ser mayor o igual a 0' } }}
            render={({ field }) => (
              <Input label="IVA" type="number" {...field} sx={{ mb: 2 }} variant="outlined" required error={!!errors.iva} helperText={errors.iva?.message} />
            )}
          />
          <Controller
            name="featured"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={!!field.value} onChange={e => field.onChange(e.target.checked)} name="featured" color="primary" />}
                label="Destacado"
                sx={{ mb: 2, ml: 0 }}
              />
            )}
          />
          <Controller
            name="categoryId"
            control={control}
            rules={{ required: 'La categoría es obligatoria' }}
            render={({ field }) => (
              <Input
                label="Categoría"
                select
                {...field}
                value={field.value || ''}
                sx={{ mb: 2 }}
                variant="outlined"
                required
                error={!!errors.categoryId}
                helperText={errors.categoryId?.message}
              >
                <MenuItem value="">Seleccionar categoría</MenuItem>
                {categoryOptions.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Input>
            )}
          />
          <Controller
            name="subcategoryId"
            control={control}
            render={({ field }) => (
              <Input
                label="Subcategoría"
                select
                {...field}
                value={field.value || ''}
                sx={{ mb: 2 }}
                variant="outlined"
              >
                <MenuItem value="">Seleccionar subcategoría</MenuItem>
                {subcategoryOptions.map(sc => (
                  <MenuItem key={sc.id} value={sc.id}>{sc.name}</MenuItem>
                ))}
              </Input>
            )}
          />
        </DialogContent>
        <DialogActions>
          <OutlinedButton onClick={onClose} disabled={loading}>
            Cancelar
          </OutlinedButton>
          <ContainedButton type="submit" disabled={loading}>
            {initialData ? 'Guardar cambios' : 'Crear producto'}
          </ContainedButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
