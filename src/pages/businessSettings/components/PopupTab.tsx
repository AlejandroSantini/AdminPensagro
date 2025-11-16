import React, { useState, useEffect } from 'react';
import { Box, Typography, MenuItem, CircularProgress, Alert } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Input } from '../../../components/common/Input';
import { ContainedButton } from '../../../components/common/ContainedButton';
import ImageUploader from '../../../components/common/ImageUploader';
import api from '../../../services/api';
import { postPopupRoute, getPopupsRoute } from '../../../services/popups';

interface PopupTabProps {
  control: any;
  watch: any;
  setValue: any;
  getValues: any;
}

export default function PopupTab({ control, watch, setValue, getValues }: PopupTabProps) {
  const [saveLoading, setSaveLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchPopup = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(getPopupsRoute());
        if (response.data && response.data.status === true && response.data.data) {
          const popups = response.data.data;
          if (Array.isArray(popups) && popups.length > 0) {
            const popup = popups[0];
            setValue('popup.content_type', popup.content_type || 'image');
            setValue('popup.link', popup.link || '');
            setValue('popup.link_open_type', popup.open_type || 'same_tab');
            setValue('popup.status', popup.status || 'inactive');
            setValue('popup.image', popup.image_url || popup.image || '');
          }
        }
      } catch (err) {
        console.error('Error loading popup:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopup();
  }, [setValue]);

  const handleSavePopup = async () => {
    setSaveLoading(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      const data = getValues();
      const popupData = { ...data.popup };

      const fd = new FormData();
      fd.append('content_type', popupData.content_type || 'image');
      fd.append('link', popupData.link || '');
      fd.append('open_type', popupData.link_open_type || 'same_tab');
      fd.append('status', popupData.status || 'inactive');

      if (popupData.image && typeof popupData.image === 'string' && popupData.image.startsWith('data:')) {
        const arr = popupData.image.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        
        const extensionMap: Record<string, string> = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/gif': 'gif',
          'image/webp': 'webp',
          'image/svg+xml': 'svg',
        };
        const extension = extensionMap[mime] || 'jpg';
        const fileName = `popup-${Date.now()}.${extension}`;
        
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const file = new File([u8arr], fileName, { type: mime });
        fd.append('image', file);
      } else if (popupData.image) {
        fd.append('image', popupData.image);
      }

      const response = await api.post(postPopupRoute(), fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response?.data?.status === true) {
        setSaveSuccess(true);
      } else {
        setError('No se pudo guardar el pop-up');
      }
    } catch (err) {
      console.error('Error saving popup:', err);
      setError('Error al guardar el pop-up');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography fontWeight={500} mb={1}>Configuración del Pop-up</Typography>

      <Controller
        name="popup.content_type"
        control={control}
        render={({ field }) => (
          <Input select variant="outlined" label="Tipo de contenido" {...field}>
            <MenuItem value="image">Imagen</MenuItem>
            <MenuItem value="link">Link</MenuItem>
          </Input>
        )}
      />

      <Controller
        name="popup.link"
        control={control}
        render={({ field }) => (
          <Input variant="outlined" label="Link" placeholder="https://..." {...field} />
        )}
      />

      <Controller
        name="popup.link_open_type"
        control={control}
        render={({ field }) => (
          <Input select variant="outlined" label="Tipo de apertura de link" {...field}>
            <MenuItem value="same_tab">Abre en la misma página</MenuItem>
            <MenuItem value="new_tab">Abre en una nueva pestaña</MenuItem>
          </Input>
        )}
      />

      <Controller
        name="popup.status"
        control={control}
        render={({ field }) => (
          <Input select variant="outlined" label="Estado" {...field}>
            <MenuItem value="inactive">Inactivo</MenuItem>
            <MenuItem value="active">Activo</MenuItem>
          </Input>
        )}
      />

      <Box>
        <ImageUploader
          value={watch('popup.image') ? [watch('popup.image')] : []}
          multiple={false}
          onChange={(images) => setValue('popup.image', images[0] || '')}
          recommendText="Se recomienda un tamaño de 1000px de ancho x 1000px de alto."
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}

      {saveSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>Pop-up guardado exitosamente</Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <ContainedButton type="button" onClick={handleSavePopup} disabled={saveLoading}>
          {saveLoading ? <CircularProgress size={20} color="inherit" /> : 'Guardar configuración'}
        </ContainedButton>
      </Box>
    </Box>
  );
}
