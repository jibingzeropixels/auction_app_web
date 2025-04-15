// src/app/dashboard/approvals/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
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
  ListItemText,
  Chip,
  CircularProgress
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { approvalsService } from '@/services/approvals';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface PendingAction {
  id: string;
  action: 'approve' | 'reject';
}

type ApprovalStatus = 'requested' | 'approved' | 'rejected';

interface ApprovalRequest {
  id: string;
  teamName?: string;
  eventName: string;
  seasonName: string;
  status: ApprovalStatus;
  type?: 'teamRep' | 'eventAdmin';
}

interface UserWithRequests {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  request: ApprovalRequest[];
}

interface ApprovalRow {
  id: string;
  userId: string;
  requestId: string;
  name: string;
  email: string;
  eventName: string;
  seasonName: string;
  teamName?: string;
  status: string;
}

const statusOptions = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'requested', label: 'Requested', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' }
];

const getStatusChipColor = (status: ApprovalStatus): 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'approved': return 'success';
    case 'rejected': return 'error';
    case 'requested':
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
  const [eventAdminData, setEventAdminData] = useState<UserWithRequests[]>([]);
  const [teamRepData, setTeamRepData] = useState<UserWithRequests[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['requested']);

  useEffect(() => {
    if (user && user.role !== 'superAdmin' && user.role !== 'eventAdmin') {
      router.push('/dashboard');
      return;
    }
    
    // Fetch approvals data based on user role
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        
        if (user?.role === 'superAdmin') {
          const eventsData = await approvalsService.getAllApprovals('events');
          const teamsData = await approvalsService.getAllApprovals('teams');
          
          setEventAdminData(eventsData);
          setTeamRepData(teamsData);
        } else {
          const teamsData = await approvalsService.getAllApprovals('teams');
          setTeamRepData(teamsData);
        }
      } catch (error) {
        console.error("Error fetching approvals:", error);
        setErrorMessage("Failed to load approvals. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchApprovals();
    }
    
  }, [user, router]);

  const filteredEventAdminData = useMemo(() => {
    return eventAdminData.map(user => {
      const filteredRequests = user.request.filter(req => 
        selectedStatuses.includes('all') || selectedStatuses.includes(req.status)
      );
      
      return {
        ...user,
        request: filteredRequests
      };
    }).filter(user => user.request.length > 0); 
  }, [eventAdminData, selectedStatuses]);
  
  const filteredTeamRepData = useMemo(() => {
    return teamRepData.map(user => {
      const filteredRequests = user.request.filter(req => 
        selectedStatuses.includes('all') || selectedStatuses.includes(req.status)
      );
      
      return {
        ...user,
        request: filteredRequests
      };
    }).filter(user => user.request.length > 0);
  }, [teamRepData, selectedStatuses]);

  const eventAdminRows = useMemo(() => {
    const rows: ApprovalRow[] = [];
    
    filteredEventAdminData.forEach(user => {
      user.request.forEach(req => {
        rows.push({
          id: `${user._id}-${req.id}`, 
          userId: user._id,
          requestId: req.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          eventName: req.eventName,
          seasonName: req.seasonName,
          status: req.status || 'requested'
        });
      });
    });
    
    return rows;
  }, [filteredEventAdminData]);
  
  const teamRepRows = useMemo(() => {
    const rows: ApprovalRow[] = [];
    
    filteredTeamRepData.forEach(user => {
      user.request.forEach(req => {
        rows.push({
          id: `${user._id}-${req.id}`, 
          userId: user._id,
          requestId: req.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          eventName: req.eventName,
          seasonName: req.seasonName,
          teamName: req.teamName || 'N/A',
          status: req.status || 'requested'
        });
      });
    });
    
    return rows;
  }, [filteredTeamRepData]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    
    if (value.includes('all') && !selectedStatuses.includes('all')) {
      setSelectedStatuses(['all', 'requested', 'approved', 'rejected']);
    } else if (!value.includes('all') && selectedStatuses.includes('all')) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(value);
    }
  };

  const handleActionClick = (id: string, action: 'approve' | 'reject'): void => {
    setPendingAction({ id, action });
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async (): Promise<void> => {
    if (!pendingAction) return;
    
    const { id, action } = pendingAction;
    setLoading(true);
    
    try {
      const [userId, requestId] = id.split('-');
      
      const approvalType = user?.role === 'superAdmin' 
        ? (tabValue === 0 ? 'events' : 'teams')
        : 'teams';
      
      await approvalsService.updateAdminStatus({
        userId,
        requestId,
        status: action === 'approve' ? 'approved' : 'rejected',
        type: approvalType
      });
      
      if (approvalType === 'events') {
        setEventAdminData(prevData => 
          prevData.map(user => {
            if (user._id === userId) {
              return {
                ...user,
                request: user.request.map(req => 
                  req.id === requestId 
                    ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
                    : req
                )
              };
            }
            return user;
          })
        );
      } else {
        setTeamRepData(prevData => 
          prevData.map(user => {
            if (user._id === userId) {
              return {
                ...user,
                request: user.request.map(req => 
                  req.id === requestId 
                    ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
                    : req
                )
              };
            }
            return user;
          })
        );
      }
      
      setSuccessMessage(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating approval status:', error);
      setErrorMessage('Failed to update approval status. Please try again.');
    } finally {
      setLoading(false);
    }

    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);

    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  const handleCancelAction = (): void => {
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  const eventAdminColumns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1,
      headerClassName: 'super-app-theme--header'
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1,
      headerClassName: 'super-app-theme--header'
    },
    { 
      field: 'seasonName', 
      headerName: 'Season', 
      flex: 1,
      headerClassName: 'super-app-theme--header'
    },
    { 
      field: 'eventName', 
      headerName: 'Event', 
      flex: 1,
      headerClassName: 'super-app-theme--header'
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => {
        const status = params.value as ApprovalStatus;
        return (
          <Chip 
            label={status.charAt(0).toUpperCase() + status.slice(1)} 
            color={getStatusChipColor(status)} 
            size="small" 
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.7,
      headerClassName: 'super-app-theme--header',
      renderCell: (params) => (
        <Box>
          {params.row.status === 'requested' && (
            <>
              <Tooltip title="Approve">
                <IconButton 
                  aria-label="Approve request"
                  onClick={() => handleActionClick(params.row.id, 'approve')}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: 'success.main' } 
                  }}
                  disabled={loading}
                >
                  <CheckIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton 
                  aria-label="Reject request"
                  onClick={() => handleActionClick(params.row.id, 'reject')}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: 'error.main' } 
                  }}
                  disabled={loading}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      )
    }
  ];

  const teamRepColumns: GridColDef[] = [
    ...eventAdminColumns.slice(0, 4), 
    { 
      field: 'teamName', 
      headerName: 'Team', 
      flex: 1,
      headerClassName: 'super-app-theme--header'
    },
    ...eventAdminColumns.slice(4) 
  ];

  if (!user || (user.role !== 'superAdmin' && user.role !== 'eventAdmin')) {
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
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
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
              if (selected.includes('all')) return 'All';
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
                {option.value !== 'all' && (
                  <Chip 
                    label={option.label} 
                    size="small" 
                    color={option.color as 'default' | 'warning' | 'success' | 'error'} 
                    sx={{ ml: 1 }} 
                  />
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', m: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {!loading && (
        <Paper sx={{ width: '100%' }}>
          {user.role === 'superAdmin' ? (
          <>
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
                  />
                  <Tab 
                  label="Team Representatives" 
                  id="approval-tab-1" 
                  aria-controls="approval-tabpanel-1" 
                  />
              </Tabs>
              </Box>
              
              <TabPanel value={tabValue} index={0}>
                {eventAdminRows.length > 0 ? (
                  <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                      rows={eventAdminRows}
                      columns={eventAdminColumns}
                      disableColumnMenu
                      getRowId={(row) => row.id}
                      pageSizeOptions={[10, 25, 50]}
                      initialState={{
                        pagination: {
                          paginationModel: { pageSize: 10, page: 0 },
                        },
                      }}
                      sx={{
                          width: '100%',
                          bgcolor: 'white',
                          '& .MuiDataGrid-cell': { bgcolor: 'white' },
                          '& .MuiDataGrid-footerContainer': { bgcolor: 'white' },
                          '& .super-app-theme--header': {
                          backgroundColor: '#1976d2',
                          color: 'white',
                          fontWeight: 700,
                          borderBottom: '2px solid #115293',
                          },
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No event admin approvals found.
                    </Typography>
                  </Box>
                )}
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                {teamRepRows.length > 0 ? (
                  <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                      rows={teamRepRows}
                      columns={teamRepColumns}
                      disableColumnMenu
                      getRowId={(row) => row.id}
                      pageSizeOptions={[10, 25, 50]}
                      initialState={{
                        pagination: {
                          paginationModel: { pageSize: 10, page: 0 },
                        },
                      }}
                      sx={{
                          width: '100%',
                          bgcolor: 'white',
                          '& .MuiDataGrid-cell': { bgcolor: 'white' },
                          '& .MuiDataGrid-footerContainer': { bgcolor: 'white' },
                          '& .super-app-theme--header': {
                          backgroundColor: '#1976d2',
                          color: 'white',
                          fontWeight: 700,
                          borderBottom: '2px solid #115293',
                          },
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No team representative approvals found.
                    </Typography>
                  </Box>
                )}
              </TabPanel>
          </>
          ) : (
          <Box sx={{ p: 3 }}>
              {teamRepRows.length > 0 ? (
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={teamRepRows}
                    columns={teamRepColumns}
                    disableColumnMenu
                    getRowId={(row) => row.id}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                      },
                    }}
                    sx={{
                      width: '100%',
                      bgcolor: 'white',
                      '& .MuiDataGrid-cell': { bgcolor: 'white' },
                      '& .MuiDataGrid-footerContainer': { bgcolor: 'white' },
                      '& .super-app-theme--header': {
                        backgroundColor: '#1976d2',
                        color: 'white',
                        fontWeight: 700,
                        borderBottom: '2px solid #115293',
                      },
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No team representative approvals found.
                  </Typography>
                </Box>
              )}
          </Box>
          )}
        </Paper>
      )}

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