'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/context/auth-context';
import AdminAuctionView from './admin-view';
import TeamRepAuctionView from './team-rep-view';

export default function AuctionPage() {
  const router = useRouter();
  const { user } = useAuth();
  
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