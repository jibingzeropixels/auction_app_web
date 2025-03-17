// src/app/dashboard/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
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
  MenuItem
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import EventIcon from '@mui/icons-material/Event';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';


const drawerWidth = 240;

// Define navigation items by role
const navigationItems = {
  superAdmin: [
    { name: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { name: 'Seasons', icon: <CalendarViewMonthIcon />, path: '/dashboard/seasons' },
    { name: 'Events', icon: <EventIcon />, path: '/dashboard/events' },
    { name: 'Teams', icon: <GroupsIcon />, path: '/dashboard/teams' },
    { name: 'Approvals', icon: <AssignmentTurnedInIcon />, path: '/dashboard/approvals' },

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
  const { user, login, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    // If user is already in context, use it
    if (user) {
      setUserData(user);
      setIsLoading(false);
      return;
    }

    // Otherwise check localStorage
    try {
      const storedUserJSON = localStorage.getItem("user");
      if (!storedUserJSON) {
        router.push("/login");
        return;
      }

      const storedUser = JSON.parse(storedUserJSON);
      // Update both local state and auth context
      setUserData(storedUser);
      login(storedUser); // This ensures the context is updated
      setIsLoading(false);
    } catch (error) {
      console.error("Error parsing user data", error);
      router.push("/login");
    }
  }, [user, login, router]);

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle logout
  const handleLogout = () => {
    handleMenuClose();
    logout();
    router.push("/login");
  };

  // Show loading state
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

  // Get navigation items for current user role
  const userRole = userData.role as keyof typeof navigationItems;
  const navItems = navigationItems[userRole] || [];

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
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
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
        {children}
      </Box>
    </Box>
  );
}
