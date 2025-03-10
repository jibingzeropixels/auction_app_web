"use client";

import React from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  AppBar,
  Toolbar,
  Button,
  Typography,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";

const drawerWidth = 240;

export default function NonAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const pathParts = pathname.split("/");
  const seasonId = pathParts[3] || null;
  const eventId = pathParts[4] || null;

  const isActive = (match: string) => pathname.includes(match);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">ZeroBid</Typography>
        </Box>

        <List>
          <ListItemButton
            selected={isActive("/seasons")}
            onClick={() => handleNavigate("/seasons")}
          >
            <ListItemText primary="Seasons" />
          </ListItemButton>

          {seasonId && (
            <ListItemButton
              selected={isActive(`/seasons/${seasonId}`)}
              onClick={() => handleNavigate(`/seasons/${seasonId}`)}
            >
              <ListItemText primary="Events" />
            </ListItemButton>
          )}

          {seasonId && eventId && (
            <ListItemButton
              selected={isActive(`/seasons/${seasonId}/${eventId}`)}
              onClick={() => handleNavigate(`/seasons/${seasonId}/${eventId}`)}
            >
              <ListItemText primary="Teams" />
            </ListItemButton>
          )}
        </List>
      </Drawer>

      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Box sx={{ ml: "auto" }}>
            <Button color="inherit">Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ pt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
