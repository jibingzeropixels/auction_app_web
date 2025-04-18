// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Typography, Paper, Grid, Box } from '@mui/material';

export default function DashboardPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(user);
  
  useEffect(() => {
    // If user is already in context, use it
    if (user) {
      setUserData(user);
      return;
    }
    
    // Otherwise check localStorage
    try {
      const storedUserJSON = localStorage.getItem('user');
      if (storedUserJSON) {
        setUserData(JSON.parse(storedUserJSON));
      }
    } catch (error) {
      console.error('Error parsing user data', error);
    }
  }, [user]);
  
  if (!userData) {
    return <Typography>Loading...</Typography>;
  }
  
  // Determine role display text
  let roleText = 'User';
  if (userData.isSuperAdmin) {
    roleText = 'Super Admin';
  } else if (userData.role === 'eventAdmin') {
    roleText = 'Event Admin';
  } else if (userData.role === 'teamRepresentative') {
    roleText = 'Team Representative';
  }
  
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Welcome, {userData.firstName} {userData.lastName}!
        </Typography>
        <Typography variant="body1">
          You are logged in as: <strong>{roleText}</strong>
        </Typography>
        {userData.eventId && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Managing Event ID: {userData.eventId}
          </Typography>
        )}
        {userData.teamId && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Team ID: {userData.teamId}
          </Typography>
        )}
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2">
              No recent activity to display.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                {userData.isSuperAdmin && 'Total Seasons: 3'}
                {userData.role === 'eventAdmin' && 'Total Teams: 8'}
                {userData.role === 'teamRepresentative' && 'Players Acquired: 0'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Events
            </Typography>
            <Typography variant="body2">
              No upcoming events.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}