import {
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";

interface TopBarProps {
  title?: string;
  drawerWidth?: number;
}

export default function TopBar({
  title = "Panel Admin",
  drawerWidth = 210,
}: TopBarProps) {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: "background.paper",
        color: "text.primary",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderBottom: "1px solid",
        borderColor: "divider",
        transition: 'width 0.3s cubic-bezier(.4,0,.2,1), margin-left 0.3s cubic-bezier(.4,0,.2,1)',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            transition: 'margin 0.3s cubic-bezier(.4,0,.2,1)',
            ml: 0,
          }}
        >
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}