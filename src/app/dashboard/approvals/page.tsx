// src/app/dashboard/approvals/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tooltip,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

// Mock data for pending approvals
const mockEventAdmins = [
  { id: '1', name: 'Peter Johnson', email: 'peter@example.com', role: 'eventAdmin', seasonId: '1', seasonName: 'Season 2024', status: 'Pending', createdAt: '2024-03-10' },
  { id: '2', name: 'Jibin George', email: 'jibin@example.com', role: 'eventAdmin', seasonId: '2', seasonName: 'Season 2025', status: 'Pending', createdAt: '2024-03-11' },
];

const mockTeamReps = [
  { id: '3', name: 'Roshin Rajesh', email: 'roshin@example.com', role: 'teamRepresentative', seasonId: '1', seasonName: 'Season 2024', eventId: '101', eventName: 'Tournament A', teamId: '201', teamName: 'Team A', status: 'Pending', createdAt: '2024-03-12' },
  { id: '4', name: 'Ryan Thomas', email: 'ryan@example.com', role: 'teamRepresentative', seasonId: '1', seasonName: 'Season 2024', eventId: '102', eventName: 'Tournament B', teamId: '202', teamName: 'Team B', status: 'Pending', createdAt: '2024-03-13' },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`approval-tabpanel-${index}`}
      aria-labelledby={`approval-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ApprovalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [eventAdmins, setEventAdmins] = useState(mockEventAdmins);
  const [teamReps, setTeamReps] = useState(mockTeamReps);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    id: string,
    type: 'eventAdmin' | 'teamRep',
    action: 'approve' | 'reject'
  } | null>(null);

  useEffect(() => {
    if (user && user.role !== 'superAdmin') {
      router.push('/dashboard');
    }
    
    // fetchPendingApprovals();
  }, [user, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleActionClick = (id: string, type: 'eventAdmin' | 'teamRep', action: 'approve' | 'reject') => {
    setPendingAction({ id, type, action });
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    
    const { id, type, action } = pendingAction;
    //api
    if (action === 'approve') {
      if (type === 'eventAdmin') {
        setEventAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== id));
        setSuccessMessage('Event admin approved successfully');
      } else {
        setTeamReps(prevReps => prevReps.filter(rep => rep.id !== id));
        setSuccessMessage('Team representative approved successfully');
      }
    } else {  //api
      if (type === 'eventAdmin') {
        setEventAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== id));
        setSuccessMessage('Event admin rejected');
      } else {
        setTeamReps(prevReps => prevReps.filter(rep => rep.id !== id));
        setSuccessMessage('Team representative rejected');
      }
    }

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  const handleCancelAction = () => {
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  if (user?.role !== 'superAdmin') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">
          You don't have permission to access this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Approvals
      </Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="approval tabs">
            <Tab label="Event Admins" id="approval-tab-0" aria-controls="approval-tabpanel-0" />
            <Tab label="Team Representatives" id="approval-tab-1" aria-controls="approval-tabpanel-1" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Season</TableCell>
                  <TableCell>Requested On</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {eventAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No pending event admin approvals
                    </TableCell>
                  </TableRow>
                ) : (
                  eventAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.seasonName}</TableCell>
                      <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip label={admin.status} color="warning" size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Approve">
                          <IconButton 
                            aria-label="Approve request"
                            onClick={() => handleActionClick(admin.id, 'eventAdmin', 'approve')}
                            sx={{ 
                              color: 'text.secondary',
                              '&:hover': { color: 'success.main' } 
                            }}
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton 
                            aria-label="Reject request"
                            onClick={() => handleActionClick(admin.id, 'eventAdmin', 'reject')}
                            sx={{ 
                              color: 'text.secondary',
                              '&:hover': { color: 'error.main' } 
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Season</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Requested On</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamReps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No pending team representative approvals
                    </TableCell>
                  </TableRow>
                ) : (
                  teamReps.map((rep) => (
                    <TableRow key={rep.id}>
                      <TableCell>{rep.name}</TableCell>
                      <TableCell>{rep.email}</TableCell>
                      <TableCell>{rep.seasonName}</TableCell>
                      <TableCell>{rep.eventName}</TableCell>
                      <TableCell>{rep.teamName}</TableCell>
                      <TableCell>{new Date(rep.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip label={rep.status} color="warning" size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Approve">
                          <IconButton 
                            aria-label="Approve request"
                            onClick={() => handleActionClick(rep.id, 'teamRep', 'approve')}
                            sx={{ 
                              color: 'text.secondary',
                              '&:hover': { color: 'success.main' } 
                            }}
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton 
                            aria-label="Reject request"
                            onClick={() => handleActionClick(rep.id, 'teamRep', 'reject')}
                            sx={{ 
                              color: 'text.secondary',
                              '&:hover': { color: 'error.main' } 
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Confirmation dialog box */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelAction}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {pendingAction?.action === 'approve' ? "Confirm Approval" : "Confirm Rejection"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {pendingAction?.action === 'approve' 
              ? "Are you sure you want to approve this request? This will grant access to the user."
              : "Are you sure you want to reject this request? This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction}>Cancel</Button>
          <Button 
            onClick={handleConfirmAction} 
            color={pendingAction?.action === 'approve' ? "primary" : "error"} 
            autoFocus
          >
            {pendingAction?.action === 'approve' ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}