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
  Chip,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { SelectChangeEvent } from '@mui/material/Select';


// Type definitions
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface PendingAction {
  id: string;
  type: 'eventAdmin' | 'teamRep';
  action: 'approve' | 'reject';
}

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface EventAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  seasonId: string;
  seasonName: string;
  eventId: string;
  eventName: string;
  status: ApprovalStatus;
  createdAt: string;
}

interface TeamRep extends EventAdmin {
  teamId: string;
  teamName: string;
}

const mockEventAdmins: EventAdmin[] = [
  { 
    id: '1', 
    name: 'Jibin George', 
    email: 'jibin@example.com', 
    role: 'eventAdmin', 
    seasonId: '1', 
    seasonName: 'Season 2024', 
    eventId: '101', 
    eventName: 'Tournament A', 
    status: 'pending', 
    createdAt: '2024-03-10' 
  },
  { 
    id: '2', 
    name: 'Peter Johnson', 
    email: 'peter@example.com', 
    role: 'eventAdmin', 
    seasonId: '2', 
    seasonName: 'Season 2025', 
    eventId: '102', 
    eventName: 'Tournament B', 
    status: 'approved', 
    createdAt: '2024-03-11' 
  }
];

const mockTeamReps: TeamRep[] = [
  { 
    id: '4', 
    name: 'Roshin Rajesh', 
    email: 'roshin@example.com', 
    role: 'teamRepresentative', 
    seasonId: '1', 
    seasonName: 'Season 2024', 
    eventId: '101', 
    eventName: 'Tournament A', 
    teamId: '201', 
    teamName: 'Team Alpha', 
    status: 'pending', 
    createdAt: '2024-03-12' 
  },
  { 
    id: '5', 
    name: 'Ryan Thomas', 
    email: 'ryan@example.com', 
    role: 'teamRepresentative', 
    seasonId: '1', 
    seasonName: 'Season 2024', 
    eventId: '102', 
    eventName: 'Tournament B', 
    teamId: '202', 
    teamName: 'Team Beta', 
    status: 'approved', 
    createdAt: '2024-03-13' 
  }
];

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' }
];

// Status color mapping
const getStatusChipColor = (status: ApprovalStatus): 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'approved': return 'success';
    case 'rejected': return 'error';
    case 'pending':
    default:
      return 'warning';
  }
};

function TabPanel(props: TabPanelProps): React.ReactElement {
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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function ApprovalsPage(): React.ReactElement {
  const router = useRouter();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState<number>(0);
  const [eventAdmins, setEventAdmins] = useState<EventAdmin[]>(mockEventAdmins);
  const [teamReps, setTeamReps] = useState<TeamRep[]>(mockTeamReps);
  const [filteredEventAdmins, setFilteredEventAdmins] = useState<EventAdmin[]>(mockEventAdmins);
  const [filteredTeamReps, setFilteredTeamReps] = useState<TeamRep[]>(mockTeamReps);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['pending', 'approved', 'rejected']);

  useEffect(() => {
    if (user && user.role !== 'superAdmin' && user.role !== 'eventAdmin') {
      router.push('/dashboard');
    }
    
  }, [user, router]);

  useEffect(() => {
    if (selectedStatuses.length === 0) {
      setFilteredEventAdmins(eventAdmins);
      setFilteredTeamReps(filterTeamRepsByEvent(teamReps));
    } else {
      setFilteredEventAdmins(
        eventAdmins.filter(admin => selectedStatuses.includes(admin.status))
      );
      setFilteredTeamReps(
        filterTeamRepsByEvent(teamReps.filter(rep => selectedStatuses.includes(rep.status)))
      );
    }
  }, [selectedStatuses, eventAdmins, teamReps, user]);

  const filterTeamRepsByEvent = (reps: TeamRep[]): TeamRep[] => {
    if (user?.role === 'eventAdmin' && user?.eventId) {
      return reps.filter(rep => rep.eventId === user.eventId);
    }
    return reps;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedStatuses(value);
  };

  const handleActionClick = (id: string, type: 'eventAdmin' | 'teamRep', action: 'approve' | 'reject'): void => {
    setPendingAction({ id, type, action });
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = (): void => {
    if (!pendingAction) return;
    
    const { id, type, action } = pendingAction;
    
    if (type === 'eventAdmin') {
      setEventAdmins(prevAdmins => 
        prevAdmins.map(admin => 
          admin.id === id 
            ? { ...admin, status: action === 'approve' ? 'approved' : 'rejected' } 
            : admin
        )
      );
      setSuccessMessage(`Event admin ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } else {
      setTeamReps(prevReps => 
        prevReps.map(rep => 
          rep.id === id 
            ? { ...rep, status: action === 'approve' ? 'approved' : 'rejected' } 
            : rep
        )
      );
      setSuccessMessage(`Team representative ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    }

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  const handleCancelAction = (): void => {
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  if (!user || (user.role !== 'superAdmin' && user.role !== 'eventAdmin')) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">
          You don&apos;t have permission to access this page.
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
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl sx={{ width: 300 }}>
          <InputLabel id="status-filter-label">Status Filter</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            multiple
            value={selectedStatuses}
            onChange={handleStatusFilterChange}
            input={<OutlinedInput label="Status Filter" />}
            renderValue={(selected) => {
              if (selected.length === statusOptions.length) return 'All';
              if (selected.length === 0) return 'None';
              return selected
                .map(value => statusOptions.find(option => option.value === value)?.label)
                .join(', ');
            }}
            MenuProps={MenuProps}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={selectedStatuses.indexOf(option.value) > -1} />
                <ListItemText primary={option.label} />
                <Chip 
                  label={option.label} 
                  size="small" 
                  color={option.color as 'warning' | 'success' | 'error'} 
                  sx={{ ml: 1 }} 
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="approval tabs"
          >
            <Tab 
              label="Event Admins" 
              id="approval-tab-0" 
              aria-controls="approval-tabpanel-0" 
              disabled={user.role !== 'superAdmin'}
            />
            <Tab 
              label="Team Representatives" 
              id="approval-tab-1" 
              aria-controls="approval-tabpanel-1" 
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {user.role === 'superAdmin' ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Season</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Event</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Requested On</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEventAdmins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No event admin approvals matching the selected filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEventAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>{admin.name}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.seasonName}</TableCell>
                        <TableCell>{admin.eventName}</TableCell>
                        <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={admin.status.charAt(0).toUpperCase() + admin.status.slice(1)} 
                            color={getStatusChipColor(admin.status)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          {admin.status === 'pending' && (
                            <>
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
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" sx={{ p: 2 }}>
              You don&apos;t have permission to manage event admin approvals.
            </Typography>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Season</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Event</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Team</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Requested On</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTeamReps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No team representative approvals matching the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeamReps.map((rep) => (
                    <TableRow key={rep.id}>
                      <TableCell>{rep.name}</TableCell>
                      <TableCell>{rep.email}</TableCell>
                      <TableCell>{rep.seasonName}</TableCell>
                      <TableCell>{rep.eventName}</TableCell>
                      <TableCell>{rep.teamName}</TableCell>
                      <TableCell>{new Date(rep.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={rep.status.charAt(0).toUpperCase() + rep.status.slice(1)} 
                          color={getStatusChipColor(rep.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        {rep.status === 'pending' && (
                          <>
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
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

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