// src/app/dashboard/teams/add/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Breadcrumbs,
  Link,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const mockSeasons = [
  { _id: '1', name: 'Season 2023-24' },
  { _id: '2', name: 'Season 2024-25' },
  { _id: '3', name: 'Season 2025-26' }
];

const mockEvents = [
  { _id: '101', name: 'IPL Tournament', seasonId: '1' },
  { _id: '102', name: 'T20 World Cup', seasonId: '1' },
  { _id: '103', name: 'Test Series', seasonId: '2' },
  { _id: '104', name: 'ODI Championship', seasonId: '2' },
  { _id: '105', name: 'County Championship', seasonId: '3' }
];

interface FormData {
  name: string;
  seasonId: string;
  eventId: string;
}

interface Season {
  _id: string;
  name: string;
}

interface Event {
  _id: string;
  name: string;
  seasonId: string;
}

export default function AddTeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    seasonId: '',
    eventId: ''
  });

  useEffect(() => {
    setSeasons(mockSeasons);
    setEvents(mockEvents);

    // If user is an event admin, preselect their event
    if (user?.role === 'eventAdmin' && user?.eventId) {
      const userEvent = mockEvents.find(event => event._id === user.eventId);
      if (userEvent) {
        const userSeason = mockSeasons.find(season => season._id === userEvent.seasonId);
        if (userSeason) {
          setFormData(prev => ({
            ...prev,
            seasonId: userSeason._id,
            eventId: userEvent._id
          }));
          
          setFilteredEvents(mockEvents.filter(event => event.seasonId === userSeason._id));
        }
      }
    }
  }, [user]);

  // Filter events when season changes
  useEffect(() => {
    if (!formData.seasonId) {
      setFilteredEvents([]);
      return;
    }

    const filtered = events.filter(event => event.seasonId === formData.seasonId);
    setFilteredEvents(filtered);
    
    if (formData.eventId && !filtered.some(e => e._id === formData.eventId)) {
      setFormData(prev => ({ ...prev, eventId: '' }));
    }
  }, [formData.seasonId, events, formData.eventId]);

  if (user?.role !== 'superAdmin' && user?.role !== 'eventAdmin') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">
          You don&apos;t have permission to access this page.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => router.push('/dashboard')}
          sx={{ mt: 2 }}
        >
          Return to Dashboard
        </Button>
      </Box>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Team name is required');
      return false;
    }
    
    if (!formData.seasonId) {
      setError('Season is required');
      return false;
    }
    
    if (!formData.eventId) {
      setError('Event is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // api call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Team created successfully');
      
      setFormData({
        name: '',
        seasonId: user?.role === 'eventAdmin' ? formData.seasonId : '',
        eventId: user?.role === 'eventAdmin' ? formData.eventId : ''
      });
      
      setTimeout(() => {
        router.push('/dashboard/teams');
      }, 2000);
    } catch {
      setError('Failed to create team. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    router.push('/dashboard/teams');
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    router.push(path);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link 
            color="inherit" 
            href="/dashboard"
            onClick={(e) => handleLinkClick(e, '/dashboard')}
          >
            Dashboard
          </Link>
          <Link
            color="inherit"
            href="/dashboard/teams"
            onClick={(e) => handleLinkClick(e, '/dashboard/teams')}
          >
            Teams
          </Link>
          <Typography color="text.primary">Add Team</Typography>
        </Breadcrumbs>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Add New Team
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              required
              fullWidth
              id="name"
              name="name"
              label="Team Name"
              value={formData.name}
              onChange={handleChange}
              error={error.includes('name')}
              helperText={error.includes('name') ? 'Team name is required' : ''}
            />
            
            <FormControl fullWidth required>
              <InputLabel id="season-label">Season</InputLabel>
              <Select
                labelId="season-label"
                id="seasonId"
                name="seasonId"
                value={formData.seasonId}
                label="Season"
                onChange={handleChange}
                // disabled={user?.role === 'eventAdmin'}
              >
                <MenuItem value="">
                  <em>Select a Season</em>
                </MenuItem>
                {seasons.map((season) => (
                  <MenuItem key={season._id} value={season._id}>
                    {season.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth required disabled={!formData.seasonId}>
              <InputLabel id="event-label">Event</InputLabel>
              <Select
                labelId="event-label"
                id="eventId"
                name="eventId"
                value={formData.eventId}
                label="Event"
                onChange={handleChange}
                // disabled={user?.role === 'eventAdmin' || !formData.seasonId}
              >
                <MenuItem value="">
                  <em>Select an Event</em>
                </MenuItem>
                {filteredEvents.map((event) => (
                  <MenuItem key={event._id} value={event._id}>
                    {event.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                sx={{ minWidth: '100px' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ minWidth: '100px' }}
              >
                {loading ? 'Creating...' : 'Add Team'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}