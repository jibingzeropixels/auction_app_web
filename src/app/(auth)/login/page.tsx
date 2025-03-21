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

// App imports
import { authService } from '@/services/auth-service';
import { useAuth } from '@/context/auth-context';
import type { User } from '@/context/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
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
      const user = await login(formData.email, formData.password);
      
      console.log('Login successful, user:', user);
      
      // Safely access role with optional chaining
      const role = user?.role;
      console.log('User role:', role);
      
      // Handle all role cases with a clean switch statement
      switch (role) {
        case 'superAdmin':
        case 'eventAdmin':
        case 'teamRepresentative':
        default:
          router.push('/dashboard');
          break;
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
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
                Don&apos;t have an account? Register
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