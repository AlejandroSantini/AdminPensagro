import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import { Input } from "../common/Input";
import { ContainedButton } from "../common/ContainedButton";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
} from "@mui/icons-material";

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface RegisterFormData extends RegisterData {
  confirmPassword: string;
}

interface RegisterProps {
  onRegister?: (userData: RegisterData) => void;
  onSwitchToLogin?: () => void;
}

export default function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setLoading(true);

    try {
      // Simular registro (aquí irías a tu API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onRegister) {
        const { confirmPassword, ...registerData } = data;
        onRegister(registerData);
      }
    } catch (err) {
      setError("Error al crear la cuenta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f7f7f7",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 500, width: "100%", borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', border: '1px solid #e0e0e0', background: '#fff' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                py: 1,
              }}
            >
              <img src="/logo.png" alt="Logo" style={{ maxWidth: 180, width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }} />
            </Box>
            <Typography variant="h5" fontWeight={600} gutterBottom color="text.primary">
              Crear cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Únete a Pensagro Admin
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack sx={{ spacing: 2 }}>
              <Input
                {...register("name", {
                  required: "El nombre es requerido",
                  minLength: {
                    value: 2,
                    message: "El nombre debe tener al menos 2 caracteres"
                  }
                })}
                label="Nombre completo"
                error={!!errors.name}
                helperText={errors.name?.message}
                icon={
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                }
                sx={{ borderRadius: 2, mb: 2, height: 48 }}
                variant="outlined"
              />

              <Input
                {...register("email", {
                  required: "El email es requerido",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Por favor ingresa un email válido"
                  }
                })}
                label="Email"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                icon={
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                }
                sx={{ borderRadius: 2, mb: 2, height: 48 }}
                variant="outlined"
              />

              <Input
                {...register("phone", {
                  required: "El teléfono es requerido",
                  pattern: {
                    value: /^\+?[\d\s-]{10,}$/,
                    message: "Por favor ingresa un teléfono válido"
                  }
                })}
                label="Teléfono"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                icon={
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                }
                sx={{ borderRadius: 2, mb: 2, height: 48 }}
                variant="outlined"
              />

              <Input
                {...register("password", {
                  required: "La contraseña es requerida",
                  minLength: {
                    value: 6,
                    message: "La contraseña debe tener al menos 6 caracteres"
                  }
                })}
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                error={!!errors.password}
                helperText={errors.password?.message}
                icon={
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ borderRadius: 2, mb: 2, height: 48 }}
                variant="outlined"
              />

              <Input
                {...register("confirmPassword", {
                  required: "Confirma tu contraseña",
                  validate: (value) =>
                    value === password || "Las contraseñas no coinciden"
                })}
                label="Confirmar contraseña"
                type={showConfirmPassword ? "text" : "password"}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                icon={
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ borderRadius: 2, mb: 2, height: 48 }}
                variant="outlined"
              />
            </Stack>

            <ContainedButton
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </ContainedButton>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                ¿Ya tienes cuenta?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={onSwitchToLogin}
                  sx={{ cursor: "pointer" }}
                >
                  Inicia sesión aquí
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}