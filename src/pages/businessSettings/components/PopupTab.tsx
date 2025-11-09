import React from 'react';
import { Box, Typography, MenuItem } from '@mui/material';
import { Controller } from 'react-hook-form';
import { Input } from '../../../components/common/Input';
import { ContainedButton } from '../../../components/common/ContainedButton';
import ImageUploader from '../../../components/common/ImageUploader';

interface PopupTabProps {
  control: any;
  watch: any;
  setValue: any;
}

export default function PopupTab({ control, watch, setValue }: PopupTabProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography fontWeight={500} mb={1}>Configuración del Pop-up</Typography>

      <Controller
        name="popup.content_type"
        control={control}
        render={({ field }) => (
          <Input select variant="outlined" label="Tipo de contenido" {...field}>
            <MenuItem value="Imagen">Imagen</MenuItem>
            <MenuItem value="Link">Link</MenuItem>
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
            <MenuItem value="same">Abre en la misma página</MenuItem>
            <MenuItem value="new">Abre en una nueva pestaña</MenuItem>
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
    </Box>
  );
}
