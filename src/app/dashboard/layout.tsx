"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Breadcrumbs,
  Link,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 240;

// Define navigation items by role
const navigationItems = {
  superAdmin: [
    { name: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      name: "Seasons",
      icon: <CalendarViewMonthIcon />,
      path: "/dashboard/seasons",
    },
    { name: "Events", icon: <EventIcon />, path: "/dashboard/events" },
    { name: "Teams", icon: <GroupsIcon />, path: "/dashboard/teams" },
  ],
  eventAdmin: [
    { name: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { name: "My Event", icon: <EventIcon />, path: "/dashboard/my-event" },
    { name: "Teams", icon: <GroupsIcon />, path: "/dashboard/teams" },
    { name: "Players", icon: <PersonIcon />, path: "/dashboard/players" },
  ],
  teamRepresentative: [
    { name: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { name: "My Team", icon: <GroupsIcon />, path: "/dashboard/my-team" },
    { name: "Auction", icon: <EventIcon />, path: "/dashboard/auction" },
  ],
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, login, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    if (user) {
      setUserData(user);
      setIsLoading(false);
      return;
    }

    try {
      const storedUserJSON = localStorage.getItem("user");
      if (!storedUserJSON) {
        router.push("/login");
        return;
      }

      const storedUser = JSON.parse(storedUserJSON);
      setUserData(storedUser);
      login(storedUser);
      setIsLoading(false);
    } catch (error) {
      console.error("Error parsing user data", error);
      router.push("/login");
    }
  }, [user, login, router]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    router.push("/login");
  };

  if (isLoading || !userData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const userRole = userData.role as keyof typeof navigationItems;
  const navItems = navigationItems[userRole] || [];

  // Extract seasonId and eventId from path
  const pathParts = pathname.split("/");
  const seasonId = pathParts[3] ? decodeURIComponent(pathParts[3]) : null;
  const eventId = pathParts[4] ? decodeURIComponent(pathParts[4]) : null;

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap component="div">
            Sports Bidding App
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {userData.name}
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls="menu-appbar"
              aria-haspopup="true"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {userData.name.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.name} disablePadding>
                <ListItemButton onClick={() => router.push(item.path)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />

        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => router.push("/dashboard/seasons")}
            sx={{ cursor: "pointer" }}
          >
            Seasons
          </Link>

          {seasonId && (
            <Link
              underline="hover"
              color={eventId ? "inherit" : "text.primary"}
              onClick={() =>
                router.push(
                  `/dashboard/seasons/${encodeURIComponent(seasonId)}`
                )
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
                router.push(
                  `/dashboard/seasons/${encodeURIComponent(
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
