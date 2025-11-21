import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Alert,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ContainedButton } from '../../../components/common/ContainedButton';
import { OutlinedButton } from '../../../components/common/OutlinedButton';
import ImageUploader from '../../../components/common/ImageUploader';
import api from '../../../services/api';
import { uploadGeneratedImageRoute } from '../../../services/upload';

interface ImageUrlGeneratorModalProps {
  open: boolean;
  onClose: () => void;
}

interface UploadedFile {
  fileName: string;
  url: string;
}

export function ImageUrlGeneratorModal({ open, onClose }: ImageUrlGeneratorModalProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleClose = () => {
    setImagePreviews([]);
    setImageFiles([]);
    setUploadedFiles([]);
    setError(null);
    setCopiedIndex(null);
    onClose();
  };

  const handleImagesChange = async (dataUrls: string[]) => {
    setImagePreviews(dataUrls);
    setUploadedFiles([]);
    setError(null);
    
    // Convert dataURLs back to Files for upload
    const files = await Promise.all(
      dataUrls.map(async (dataUrl, index) => {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        return new File([blob], `image-${index}.png`, { type: blob.type });
      })
    );
    setImageFiles(files);
  };

  const handleUpload = async () => {
    if (imageFiles.length === 0) {
      setError('Por favor selecciona al menos una imagen');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await api.post(uploadGeneratedImageRoute(), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status && response.data.files) {
        setUploadedFiles(response.data.files);
        setImageFiles([]);
        setImagePreviews([]);
      } else {
        setError('Error al subir las imágenes');
      }
    } catch (err: any) {
      console.error('Error uploading images:', err);
      setError(err.response?.data?.message || 'Error al subir las imágenes. Por favor, intente nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Generar URL de Imagen
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {uploadedFiles.length === 0 ? (
            <>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Selecciona las imágenes que deseas subir. Se generará una URL permanente para cada una.
              </Typography>

              <ImageUploader
                value={imagePreviews}
                onChange={handleImagesChange}
                multiple={true}
                accept="image/*"
                emptyText="Haz clic aquí o arrastra imágenes para subirlas"
                supportText="Soporta: JPG, PNG, GIF, WebP"
              />
            </>
          ) : (
            <>
              <Alert severity="success">
                ¡Imágenes subidas exitosamente! Puedes copiar las URLs a continuación.
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {uploadedFiles.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      bgcolor: '#fafafa',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>
                      {file.fileName}
                    </Typography>
                    <TextField
                      fullWidth
                      value={file.url}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => handleCopyUrl(file.url, index)}
                              edge="end"
                              size="small"
                              color={copiedIndex === index ? 'success' : 'default'}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {copiedIndex === index && (
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                        ¡URL copiada!
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {uploadedFiles.length === 0 ? (
          <>
            <OutlinedButton onClick={handleClose} disabled={uploading}>
              Cancelar
            </OutlinedButton>
            <ContainedButton
              onClick={handleUpload}
              disabled={imageFiles.length === 0}
              loading={uploading}
            >
              Subir Imágenes
            </ContainedButton>
          </>
        ) : (
          <ContainedButton onClick={handleClose}>
            Cerrar
          </ContainedButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
