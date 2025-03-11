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
  Breadcrumbs,
  Link,
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
  const seasonId = pathParts[2] ? decodeURIComponent(pathParts[2]) : null;
  const eventId = pathParts[3] ? decodeURIComponent(pathParts[3]) : null;

  const isActive = (path: string) => {
    if (pathname === path) return true;
    if (path === "/seasons" && pathname.startsWith("/seasons")) return true;
    if (seasonId && path === `/seasons/${seasonId}`) return true;
    if (eventId && path === `/seasons/${seasonId}/${eventId}`) return true;
    return false;
  };

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
              onClick={() =>
                handleNavigate(`/seasons/${encodeURIComponent(seasonId)}`)
              }
            >
              <ListItemText primary={seasonId} />
            </ListItemButton>
          )}

          {seasonId && eventId && (
            <ListItemButton
              selected={isActive(`/seasons/${seasonId}/${eventId}`)}
              onClick={() =>
                handleNavigate(
                  `/seasons/${encodeURIComponent(
                    seasonId
                  )}/${encodeURIComponent(eventId)}`
                )
              }
            >
              <ListItemText primary={eventId} />
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

      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 8, height: "100%" }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => handleNavigate("/seasons")}
            sx={{ cursor: "pointer" }}
          >
            Seasons
          </Link>

          {seasonId && (
            <Link
              underline="hover"
              color={eventId ? "inherit" : "text.primary"}
              onClick={() =>
                handleNavigate(`/seasons/${encodeURIComponent(seasonId)}`)
              }
              sx={{ cursor: "pointer" }}
            >
              {seasonId}
            </Link>
          )}

          {seasonId && eventId && (
            <Link
              underline="hover"
              color="text.primary"
              onClick={() =>
                handleNavigate(
                  `/seasons/${encodeURIComponent(
                    seasonId
                  )}/${encodeURIComponent(eventId)}`
                )
              }
              sx={{ cursor: "pointer" }}
            >
              {eventId}
            </Link>
          )}
        </Breadcrumbs>

        {children}
      </Box>
    </Box>
  );
}
