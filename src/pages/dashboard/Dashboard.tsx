import { Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useAuth } from "../../hooks/useAuth";
import { DashboardCard } from "./components/DashboardCard";
import {
  People as PeopleIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  PointOfSale as VentaIcon,
  Article as BlogIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    { title: "Ventas", icon: <VentaIcon fontSize="inherit" />, path: "/ventas" },
    { title: "Usuarios", icon: <PeopleIcon fontSize="inherit" />, path: "/usuarios" },
    { title: "Productos", icon: <InventoryIcon fontSize="inherit" />, path: "/productos" },
    { title: "Blog", icon: <BlogIcon fontSize="inherit" />, path: "/blog" },
    { title: "Configuración", icon: <SettingsIcon fontSize="inherit" />, path: "/configuracion-negocio" },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Principal
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Bienvenido al panel de administración de Pensagro, {user?.name || "Usuario Dev"}!
      </Typography>
      <Grid container spacing={3} sx={{ mt: 1, mb: 2 }}>
        {cards.map(card => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={card.title} {...({} as any)}>
            <DashboardCard title={card.title} icon={card.icon} onClick={() => navigate(card.path)} />
          </Grid>
        ))}
      </Grid>
      <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
        Modo desarrollo: Acceso hardcodeado habilitado
      </Typography>
    </Box>
  );
}