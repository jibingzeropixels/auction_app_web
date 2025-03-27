// src/app/dashboard/approvals/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
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
  CircularProgress,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { approvalsService } from "@/services/approvals";

import CustomPagination from "@/components/CustomPagination";
import CustomNoRowsOverlay from "@/components/CustomNoRowsOverlay";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface PendingAction {
  id: string;
  type: "eventAdmin" | "teamRep";
  action: "approve" | "reject";
}

type ApprovalStatus = "pending" | "approved" | "rejected";

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

interface ApiResponse {
  eventAdmins: EventAdmin[];
  teamReps: TeamRep[];
}

const statusOptions = [
  { value: "all", label: "All", color: "default" },
  { value: "pending", label: "Pending", color: "warning" },
  { value: "approved", label: "Approved", color: "success" },
  { value: "rejected", label: "Rejected", color: "error" },
];

const getStatusChipColor = (
  status: ApprovalStatus
): "warning" | "success" | "error" => {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "pending":
    default:
      return "warning";
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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
  const [eventAdmins, setEventAdmins] = useState<EventAdmin[]>([]);
  const [teamReps, setTeamReps] = useState<TeamRep[]>([]);
  const [filteredEventAdmins, setFilteredEventAdmins] = useState<EventAdmin[]>(
    []
  );
  const [filteredTeamReps, setFilteredTeamReps] = useState<TeamRep[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    "pending",
  ]);

  useEffect(() => {
    if (user && user.role !== "superAdmin" && user.role !== "eventAdmin") {
      router.push("/dashboard");
    }

    const fetchApprovals = async () => {
      try {
        setLoading(true);
        const data: ApiResponse = await approvalsService.getAllApprovals();

        console.log("Approvals data:", data);

        setEventAdmins(data.eventAdmins || []);
        setTeamReps(data.teamReps || []);

        setFilteredEventAdmins(
          data.eventAdmins?.filter((admin) => admin.status === "pending") || []
        );

        // role-based filtering for team reps
        const filteredReps = filterTeamRepsByEvent(data.teamReps || []);
        setFilteredTeamReps(
          filteredReps.filter((rep) => rep.status === "pending")
        );
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

  const filterTeamRepsByEvent = (reps: TeamRep[]): TeamRep[] => {
    if (user?.role === "eventAdmin" && user?.eventId) {
      return reps.filter((rep) => rep.eventId === user.eventId);
    }
    return reps;
  };

  useEffect(() => {
    if (!user) return;

    const filteredReps = filterTeamRepsByEvent(teamReps);

    if (selectedStatuses.includes("all")) {
      setFilteredEventAdmins(eventAdmins);
      setFilteredTeamReps(filteredReps);
    } else if (selectedStatuses.length === 0) {
      setFilteredEventAdmins(
        eventAdmins.filter((admin) => admin.status === "pending")
      );
      setFilteredTeamReps(
        filteredReps.filter((rep) => rep.status === "pending")
      );
    } else {
      setFilteredEventAdmins(
        eventAdmins.filter((admin) => selectedStatuses.includes(admin.status))
      );
      setFilteredTeamReps(
        filteredReps.filter((rep) => selectedStatuses.includes(rep.status))
      );
    }
  }, [selectedStatuses, eventAdmins, teamReps, user]);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ): void => {
    setTabValue(newValue);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];

    if (value.includes("all") && !selectedStatuses.includes("all")) {
      setSelectedStatuses(["all", "pending", "approved", "rejected"]);
    } else if (!value.includes("all") && selectedStatuses.includes("all")) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(value);
    }
  };

  const handleActionClick = (
    id: string,
    type: "eventAdmin" | "teamRep",
    action: "approve" | "reject"
  ): void => {
    setPendingAction({ id, type, action });
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async (): Promise<void> => {
    if (!pendingAction) return;

    const { id, type, action } = pendingAction;
    setLoading(true);

    try {
      await approvalsService.updateAdminStatus({
        userId: id,
        status: action === "approve" ? "approved" : "rejected",
      });

      if (type === "eventAdmin") {
        setEventAdmins((prevAdmins) =>
          prevAdmins.map((admin) =>
            admin.id === id
              ? {
                  ...admin,
                  status: action === "approve" ? "approved" : "rejected",
                }
              : admin
          )
        );
        setSuccessMessage(
          `Event admin ${
            action === "approve" ? "approved" : "rejected"
          } successfully`
        );
      } else {
        setTeamReps((prevReps) =>
          prevReps.map((rep) =>
            rep.id === id
              ? {
                  ...rep,
                  status: action === "approve" ? "approved" : "rejected",
                }
              : rep
          )
        );
        setSuccessMessage(
          `Team representative ${
            action === "approve" ? "approved" : "rejected"
          } successfully`
        );
      }
    } catch (error) {
      console.error("Error updating approval status:", error);
      setErrorMessage("Failed to update approval status. Please try again.");
    } finally {
      setLoading(false);
    }

    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
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
      field: "name",
      headerName: "Name",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "seasonName",
      headerName: "Season",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "eventName",
      headerName: "Event",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "createdAt",
      headerName: "Requested On",
      width: 150,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => {
        if (params.value) {
          const date = new Date(params.value.toString());
          return `${date.getDate().toString().padStart(2, "0")}-${(
            date.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}-${date.getFullYear()}`;
        }
        return "";
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => {
        const status = params.value as ApprovalStatus;
        return (
          <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            color={getStatusChipColor(status)}
            size="small"
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <Box>
          {params.row.status === "pending" && (
            <>
              <Tooltip title="Approve">
                <IconButton
                  aria-label="Approve request"
                  onClick={() =>
                    handleActionClick(params.row.id, "eventAdmin", "approve")
                  }
                  sx={{
                    color: "text.secondary",
                    "&:hover": { color: "success.main" },
                  }}
                  disabled={loading}
                >
                  <CheckIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton
                  aria-label="Reject request"
                  onClick={() =>
                    handleActionClick(params.row.id, "eventAdmin", "reject")
                  }
                  sx={{
                    color: "text.secondary",
                    "&:hover": { color: "error.main" },
                  }}
                  disabled={loading}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  const teamRepColumns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "seasonName",
      headerName: "Season",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "eventName",
      headerName: "Event",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "teamName",
      headerName: "Team",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "createdAt",
      headerName: "Requested On",
      width: 150,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => {
        if (params.value) {
          const date = new Date(params.value.toString());
          // Format as dd-mm-yyyy
          return `${date.getDate().toString().padStart(2, "0")}-${(
            date.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}-${date.getFullYear()}`;
        }
        return "";
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => {
        const status = params.value as ApprovalStatus;
        return (
          <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            color={getStatusChipColor(status)}
            size="small"
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <Box>
          {params.row.status === "pending" && (
            <>
              <Tooltip title="Approve">
                <IconButton
                  aria-label="Approve request"
                  onClick={() =>
                    handleActionClick(params.row.id, "teamRep", "approve")
                  }
                  sx={{
                    color: "text.secondary",
                    "&:hover": { color: "success.main" },
                  }}
                  disabled={loading}
                >
                  <CheckIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton
                  aria-label="Reject request"
                  onClick={() =>
                    handleActionClick(params.row.id, "teamRep", "reject")
                  }
                  sx={{
                    color: "text.secondary",
                    "&:hover": { color: "error.main" },
                  }}
                  disabled={loading}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  if (!user || (user.role !== "superAdmin" && user.role !== "eventAdmin")) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">
          You don&apos;t have permission to access this page.
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push("/dashboard")}
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
              if (selected.includes("all")) return "All";
              if (selected.length === 0) return "None";
              return selected
                .map(
                  (value) =>
                    statusOptions.find((option) => option.value === value)
                      ?.label
                )
                .join(", ");
            }}
            MenuProps={MenuProps}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox
                  checked={selectedStatuses.indexOf(option.value) > -1}
                />
                <ListItemText primary={option.label} />
                {option.value !== "all" && (
                  <Chip
                    label={option.label}
                    size="small"
                    color={
                      option.color as
                        | "default"
                        | "warning"
                        | "success"
                        | "error"
                    }
                    sx={{ ml: 1 }}
                  />
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", m: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <Paper sx={{ width: "100%" }}>
          {user.role === "superAdmin" ? (
            <>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
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
                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    rows={filteredEventAdmins}
                    columns={eventAdminColumns}
                    disableColumnMenu
                    getRowId={(row) => row.id}
                    sx={{
                      width: "100%",
                      bgcolor: "white",
                      "& .MuiDataGrid-cell": { bgcolor: "white" },
                      "& .MuiDataGrid-footerContainer": { bgcolor: "white" },
                      "& .super-app-theme--header": {
                        backgroundColor: "#1976d2",
                        color: "white",
                        fontWeight: 700,
                        borderBottom: "2px solid #115293",
                      },
                    }}
                    pagination
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                      },
                    }}
                    // Use the custom pagination via the "slots" prop
                    slots={{
                      pagination: CustomPagination,
                      noRowsOverlay: CustomNoRowsOverlay,
                    }}
                  />
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    rows={filteredTeamReps}
                    columns={teamRepColumns}
                    disableColumnMenu
                    getRowId={(row) => row.id}
                    sx={{
                      width: "100%",
                      bgcolor: "white",
                      "& .MuiDataGrid-cell": { bgcolor: "white" },
                      "& .MuiDataGrid-footerContainer": { bgcolor: "white" },
                      "& .super-app-theme--header": {
                        backgroundColor: "#1976d2",
                        color: "white",
                        fontWeight: 700,
                        borderBottom: "2px solid #115293",
                      },
                    }}
                    pagination
                    initialState={{
                      pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                      },
                    }}
                    // Use the custom pagination via the "slots" prop
                    slots={{
                      pagination: CustomPagination,
                      noRowsOverlay: CustomNoRowsOverlay,
                    }}
                  />
                </Box>
              </TabPanel>
            </>
          ) : (
            // For Event Admins: Show only the DataGrid without any header text
            <Box sx={{ p: 3 }}>
              <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={filteredTeamReps}
                  columns={teamRepColumns}
                  disableColumnMenu
                  getRowId={(row) => row.id}
                  sx={{
                    width: "100%",
                    bgcolor: "white",
                    "& .MuiDataGrid-cell": { bgcolor: "white" },
                    "& .MuiDataGrid-footerContainer": { bgcolor: "white" },
                    "& .super-app-theme--header": {
                      backgroundColor: "#1976d2",
                      color: "white",
                      fontWeight: 700,
                      borderBottom: "2px solid #115293",
                    },
                  }}
                  pagination
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 },
                    },
                  }}
                  // Use the custom pagination via the "slots" prop
                  slots={{
                    pagination: CustomPagination,
                    noRowsOverlay: CustomNoRowsOverlay,
                  }}
                />
              </Box>
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
          {pendingAction?.action === "approve"
            ? "Confirm Approval"
            : "Confirm Rejection"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {pendingAction?.action === "approve"
              ? "Are you sure you want to approve this request? This will grant access to the user."
              : "Are you sure you want to reject this request? This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            color={pendingAction?.action === "approve" ? "primary" : "error"}
            autoFocus
          >
            {pendingAction?.action === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
