

import { Box, Toolbar } from "@mui/material";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useState } from "react";



const drawerWidth = 210;
const collapsedWidth = 64;


export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedMenuItem = location.pathname;
  const [collapsed, setCollapsed] = useState(false);

  const handleMenuItemClick = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar
        selectedItem={selectedMenuItem}
        onItemClick={handleMenuItemClick}
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />
      <Box sx={{ flexGrow: 1 }}>
        <TopBar
          drawerWidth={collapsed ? collapsedWidth : drawerWidth}
        />
        <Toolbar />
        <Box
          component="main"
          sx={{
            p: 3,
            backgroundColor: "background.default",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

