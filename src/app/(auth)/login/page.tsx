'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {jwtDecode} from 'jwt-decode';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert
} from '@mui/material';
import { authService } from '@/services/auth-service';

//token
interface DecodedToken {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string | null;
  isSuperAdmin: boolean;
  eventAttributes: Array<{id: string, adminStatus: string, isAdmin: boolean}>;
  teamAttributes: Array<{id: string, adminStatus: string, isAdmin: boolean}>;
  isActive: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

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

    try {
      const response = await authService.login(formData.email, formData.password);
      
      localStorage.setItem('token', response.token);
      
      // decode
      const decodedToken = jwtDecode<DecodedToken>(response.token);
      console.log('Decoded token:', decodedToken);
      
      //user role
      let userRole = 'user'; // default
      
      if (decodedToken.isSuperAdmin) {
        userRole = 'superAdmin';
      } else if (decodedToken.eventAttributes?.some(attr => attr.isAdmin)) {
        userRole = 'eventAdmin';
      } else if (decodedToken.teamAttributes?.some(attr => attr.isAdmin)) {
        userRole = 'teamRepresentative';
      }
      
      const user = {
        id: decodedToken._id,
        name: `${decodedToken.firstName} ${decodedToken.lastName}`,
        email: decodedToken.email,
        role: userRole
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('Login successful, user role:', userRole);
      
      if (userRole === 'superAdmin') {
        router.push('/dashboard/seasons');
      } else if (userRole === 'eventAdmin') {
        router.push('/dashboard/events');
      } else if (userRole === 'teamRepresentative') {
        router.push('/dashboard/teams');
      } else {
        router.push('/dashboard');
      }
      
    } catch (err: unknown) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
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
          </Box>
          <Box textAlign="center" sx={{ mt: 1 }}>
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