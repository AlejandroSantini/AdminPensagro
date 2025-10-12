import { 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemText, 
  ListItemIcon,
  Toolbar,
  Box,
  Divider,
  IconButton
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
  PointOfSale as VentaIcon,
  Article as BlogIcon,
  ChevronLeft,
  ChevronRight,
  ExitToApp as LogoutIcon
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";

interface SidebarItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: SidebarItem[] = [
  { text: "Inicio", icon: <DashboardIcon />, path: "/inicio" },
  { text: "Ventas", icon: <VentaIcon />, path: "/ventas" },
  { text: "Usuarios", icon: <PeopleIcon />, path: "/usuarios" },
  { text: "Productos", icon: <InventoryIcon />, path: "/productos" },
  { text: "Blog", icon: <BlogIcon />, path: "/blog" },
  { text: "Configuración", icon: <SettingsIcon />, path: "/configuracion-negocio" },
];

interface SidebarProps {
  selectedItem?: string;
  onItemClick?: (path: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ selectedItem, onItemClick, collapsed, onToggle }: SidebarProps) {
  const drawerWidth = 210;
  const collapsedWidth = 64;
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        transition: (theme) => theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        "& .MuiDrawer-paper": {
          width: collapsed ? collapsedWidth : drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          transition: (theme) => theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: "hidden",
        },
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: 0,
          minHeight: 64,
          height: 64,
          width: '100%',
          minWidth: collapsed ? `${collapsedWidth}px` : undefined,
        }}
      >
        {!collapsed && (
          <Box
            sx={{
              height: 48,
              width: 90,
              minHeight: 48,
              minWidth: 90,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{
                height: 1,
                width: 1,
                objectFit: "contain",
                opacity: 1,
                transform: 'scale(1)',
                transition: 'opacity 0.3s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1)',
              }}
            />
          </Box>
        )}
        <Box sx={{ minWidth: 32, display: 'flex', justifyContent: 'right', alignItems: 'center', flex: 1 }}>
          <IconButton
            onClick={onToggle}
            size="small"
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Box>
      </Toolbar>
      <Divider />
  <List sx={{ pt: 1, pb: 8 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            selected={selectedItem === item.path}
            onClick={() => onItemClick?.(item.path)}
            sx={{
              mx: 1,
              borderRadius: 2,
              minHeight: 48,
              justifyContent: collapsed ? "center" : "flex-start",
              px: 2,
              transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
              "&.Mui-selected": {
                backgroundColor: '#ccccccff',
                "&:hover": {
                  backgroundColor: '#f5f5f5',
                },
              },
            }}
          >
            <ListItemIcon sx={{
              color: selectedItem === item.path ? "primary.main" : "text.secondary",
              minWidth: 40,
              width: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              mr: 0,
              transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                opacity: collapsed ? 0 : 1,
                maxWidth: collapsed ? 0 : 160,
                minWidth: 0,
                ml: 0,
                transition: 'opacity 0.3s, max-width 0.3s cubic-bezier(.4,0,.2,1), margin 0.3s cubic-bezier(.4,0,.2,1)',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                "& .MuiListItemText-primary": {
                  fontWeight: 400,
                  fontSize: '0.85rem',
                },
              }}
            />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', mb: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            mx: 1,
            borderRadius: 2,
            minHeight: 48,
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: 2,
            mb: 0.5,
            transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
          }}
        >
          <ListItemIcon
            sx={{
              color: 'text.secondary',
              minWidth: 40,
              width: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              mr: 0,
              transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
            }}
          >
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary={collapsed ? '' : 'Cerrar sesión'}
            sx={{
              opacity: collapsed ? 0 : 1,
              maxWidth: collapsed ? 0 : 160,
              minWidth: 0,
              ml: 0,
              transition: 'opacity 0.3s, max-width 0.3s cubic-bezier(.4,0,.2,1), margin 0.3s cubic-bezier(.4,0,.2,1)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              '& .MuiListItemText-primary': {
                fontWeight: 400,
                fontSize: '0.85rem',
              },
            }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}