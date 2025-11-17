import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

interface ImageUploaderProps {
  value?: string[]; // array of dataURLs or existing URLs
  onChange?: (images: string[]) => void;
  multiple?: boolean;
  accept?: string;
  placeholder?: string;
  recommendText?: string;
  emptyText?: string;
  supportText?: string;
}

export default function ImageUploader({ 
  value = [], 
  onChange, 
  multiple = true, 
  accept = 'image/*', 
  placeholder = 'Subir Imagen', 
  recommendText,
  emptyText = 'Haz clic aquí o arrastra imágenes para subirlas',
  supportText = 'Soporta: JPG, PNG, GIF, WebP'
}: ImageUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
    if (e.currentTarget) {
      e.currentTarget.value = '';
    }
  };

  const removeAt = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    onChange?.(next);
  };

  return (
    <Box>
      {recommendText && (
        <Typography variant="body2" color="text.secondary" mb={1}>
          {recommendText}
        </Typography>
      )}
      
      <input 
        ref={fileInputRef}
        type="file" 
        accept={accept} 
        multiple={multiple} 
        style={{ display: 'none' }} 
        onChange={onInputChange} 
      />

      <Box
        sx={{
          border: '2px dashed #ddd',
          borderRadius: 2,
          minHeight: 200,
          p: 2,
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        {value.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 180,
            }}
          >
            <AddPhotoAlternateIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {emptyText}
            </Typography>
            {supportText && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                {supportText}
              </Typography>
            )}
          </Box>
        ) : (
          <Box>
            {multiple && (
              <Typography variant="subtitle2" mb={2} sx={{ pointerEvents: 'none' }}>
                {value.length} imagen(es) seleccionada(s)
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {value.map((src, idx) => (
                <Box
                  key={idx}
                  sx={{
                    position: 'relative',
                    width: 120,
                    height: 120,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'white',
                  }}
                >
                  <img
                    src={src}
                    alt={`img-${idx}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 1)',
                      },
                      color: 'error.main',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAt(idx);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}

              {multiple && (
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    border: '2px dashed #bbb',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <AddPhotoAlternateIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
