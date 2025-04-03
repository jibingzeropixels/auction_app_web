'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '@/context/auth-context';
import AdminAuctionView from './admin-view';
import TeamRepAuctionView from './team-rep-view';

export default function AuctionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const auctionId = searchParams.get('auctionId');
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);
  
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!auctionId) {
    return (
      <Box sx={{ p: 5 }}>
        <Alert severity="error">
          No auction ID provided. Please access this page with a valid auction ID in the URL.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 2 }}>
      {(user.role === 'superAdmin' || user.role === 'eventAdmin') ? (
        <AdminAuctionView />
      ) : (
        <TeamRepAuctionView />
      )}
    </Box>
  );
}