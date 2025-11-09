import React from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import DeleteButton from './DeleteButton';
import { OutlinedButton } from './OutlinedButton';

interface ImageUploaderProps {
  value?: string[]; // array of dataURLs or existing URLs
  onChange?: (images: string[]) => void;
  multiple?: boolean;
  accept?: string;
  placeholder?: string;
  recommendText?: string;
}

export default function ImageUploader({ value = [], onChange, multiple = true, accept = 'image/*', placeholder = 'SUBIR IMAGEN', recommendText }: ImageUploaderProps) {
  const fileInputId = React.useMemo(() => `image-uploader-input-${Math.random().toString(36).slice(2,9)}`, []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const readers = arr.map((file) => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    }));

    Promise.all(readers).then((dataUrls) => {
      const next = multiple ? [...value, ...dataUrls] : [...dataUrls.slice(0,1)];
      onChange?.(next);
    });
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.currentTarget.value = '';
  };

  const removeAt = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange?.(next);
  };

  return (
    <Box>
      {recommendText && (
        <Typography variant="body2" color="text.secondary" mb={1}>{recommendText}</Typography>
      )}
      <Box sx={{ border: '1px dashed #ddd', borderRadius: 1, minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', p: 1 }}>

        <input id={fileInputId} type="file" accept={accept} multiple={multiple} style={{ display: 'none' }} onChange={onInputChange} />

        {value.length === 0 ? (
          <Button variant="contained" onClick={() => document.getElementById(fileInputId)?.click()} sx={{ bgcolor: '#e0e0e0', color: '#666' }}>{placeholder}</Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', p: 1, justifyContent: 'center', width: '100%' }}>
            {value.map((src, idx) => (
              <Box key={idx} sx={{ position: 'relative', border: '1px solid #e0e0e0', borderRadius: 2, p: 1 }}>
                <Box sx={{ width: 120, height: 120, overflow: 'hidden', borderRadius: 1 }}>
                  <img src={src} alt={`img-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Box sx={{ position: 'absolute', top: 6, right: 6 }}>
                  <DeleteButton onClick={() => removeAt(idx)} />
                </Box>
              </Box>
            ))}

            {multiple && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <OutlinedButton onClick={() => document.getElementById(fileInputId)?.click()}>
                  Agregar
                </OutlinedButton>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
