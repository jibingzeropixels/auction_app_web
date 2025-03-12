// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert
} from '@mui/material';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // FOR TESTING ONLY - mock users
    try {
        const mockUsers = {
        superAdmin: {
            id: '1',
            name: 'Admin User',
            email: formData.email,
            role: 'superAdmin'
        },
        eventAdmin: {
            id: '2',
            name: 'Event Manager',
            email: formData.email,
            role: 'eventAdmin',
            seasonId: '1'
        },
        teamRep: {
            id: '3',
            name: 'Team Manager',
            email: formData.email,
            role: 'teamRepresentative',
            seasonId: '1',
            eventId: '101'
        }
        };
    
        // Choose which mock user to login as based on email
        let userData;
        if (formData.email.includes('admin')) {
        userData = mockUsers.superAdmin;
        } else if (formData.email.includes('event')) {
        userData = mockUsers.eventAdmin;
        } else if (formData.email.includes('team')) {
        userData = mockUsers.teamRep;
        } else {
        // Default to superAdmin
        userData = mockUsers.superAdmin;
        }
    
        // Store auth data
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect to dashboard
        router.push('/dashboard');
    
    } catch (error) {
        // Error handling...
    }


    // for actual api call

    // try {
    //     //backend
    //   const response = await fetch('/api/auth/login', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(formData)
    //   });

    //   const data = await response.json();

    //   if (!response.ok) {
    //     throw new Error(data.message || 'Login failed');
    //   }

    //   localStorage.setItem('token', data.token);
    //   localStorage.setItem('user', JSON.stringify(data.user));

    //   // Redirect based on user role
    //   if (data.user.role === 'superAdmin') {
    //     router.push('/dashboard/seasons');
    //   } else if (data.user.role === 'eventAdmin') {
    //     router.push(`/dashboard/seasons/${data.user.seasonId}/events`);
    //   } else {
    //     router.push(`/dashboard/events/${data.user.eventId}`);
    //   }
    // } catch (error: any) {
    //   setError(error.message || 'Login failed');
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 8, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          <Box textAlign="center">
            <Link href="/register">
              <Typography variant="body2" color="primary">
                Don't have an account? Register
              </Typography>
            </Link>

            <Link href="/forgot-password">
                <Typography variant="body2" color="primary">
                     Forgot password?
                </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}