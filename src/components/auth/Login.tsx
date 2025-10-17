import { useState } from "react";
import { useForm } from "react-hook-form";
import { Box, Card, CardContent, Typography, Alert, InputAdornment, IconButton } from "@mui/material";
import { Input } from "../common/Input";
import { ContainedButton } from "../common/ContainedButton";
import { useAuth } from '../../hooks/useAuth';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from "@mui/icons-material";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>();

  const { login } = useAuth();
  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err?.message || "Error al iniciar sesión. Intenta de nuevo.");
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
      <Card sx={{ maxWidth: 400, width: "100%", borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)', border: '1px solid #e0e0e0', background: '#fff' }}>
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
              Iniciar sesión
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bienvenido a Pensagro Admin
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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

            <ContainedButton
              type="submit"
              fullWidth
              disabled={
                loading ||
                !watch("email") ||
                !watch("password")
              }
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </ContainedButton>

          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}