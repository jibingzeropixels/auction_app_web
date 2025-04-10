"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  Autocomplete,
  CircularProgress,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { eventsService } from "@/services/events";
import { seasonsService } from "@/services/seasons";

// Import the reusable CustomPagination component.
import CustomPagination from "@/components/CustomPagination";
import CustomNoRowsOverlay from "@/components/CustomNoRowsOverlay";

type Season = { _id: string | number; name: string };

type Event = {
  _id: string;
  name: string;
  desc: string;
  startDate: string;
  endDate: string;
  seasonId: string;
  skills?: string[]; // New: include skills field (optional)
};

export default function EventsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Load seasons via API, then prepend "All Seasons"
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season>({
    _id: "all",
    name: "All Seasons",
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredRows, setFilteredRows] = useState<Event[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [computedMaxWidth, setComputedMaxWidth] = useState("100%");
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      setComputedMaxWidth(`${containerRef.current.offsetWidth}px`);
    }
  }, []);

  // Fetch seasons and events when component mounts.
  useEffect(() => {
    async function fetchData() {
      try {
        // Load seasons and prepend "All Seasons"
        const seasonsData = await seasonsService.getAllSeasons();
        const formattedSeasons = [
          { _id: "all", name: "All Seasons" },
          ...seasonsData.map((s: Season) => ({ _id: s._id, name: s.name })),
        ];
        setSeasons(formattedSeasons);
        setSelectedSeason(formattedSeasons[0]);

        // Load events from API
        const eventsData: Event[] = await eventsService.getAllEvents();
        setEvents(eventsData);
        setFilteredRows(eventsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter events based on search term and selected season.
  useEffect(() => {
    setFilteredRows(
      events.filter(
        (row) =>
          (selectedSeason._id === "all" ||
            row.seasonId === selectedSeason._id) &&
          row.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, selectedSeason, events]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // When a season is selected from the Autocomplete.
  const handleSeasonChange = (
    _: React.SyntheticEvent,
    newValue: Season | null
  ) => {
    if (newValue) {
      setSelectedSeason(newValue);
    }
  };

  // When editing an event, pass full event details as query parameters (including skills).
  const handleEdit = (row: Event) => {
    const { _id, name, desc, startDate, endDate, seasonId, skills } = row;
    // Format dates to YYYY-MM-DD (if in ISO string format).
    const formattedStartDate = startDate.split("T")[0];
    const formattedEndDate = endDate.split("T")[0];
    router.push(
      `/dashboard/events/add?edit=${_id}&name=${encodeURIComponent(
        name
      )}&desc=${encodeURIComponent(desc)}&startDate=${encodeURIComponent(
        formattedStartDate
      )}&endDate=${encodeURIComponent(
        formattedEndDate
      )}&seasonId=${encodeURIComponent(seasonId)}&skills=${encodeURIComponent(
        JSON.stringify(skills || [])
      )}`
    );
  };

  const handleDeleteClick = (row: Event) => {
    setSelectedEvent(row);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedEvent) {
      try {
        await eventsService.deleteEvent(selectedEvent._id);
        setEvents((prev) => prev.filter((e) => e._id !== selectedEvent._id));
      } catch (error) {
        console.error(`Error deleting event ${selectedEvent._id}:`, error);
      }
    }
    setOpenDeleteDialog(false);
    setSelectedEvent(null);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Event Name",
      width: 250,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "desc",
      headerName: "Description",
      flex: 2,
      minWidth: 200,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 150,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (params.value ? params.value.split("T")[0] : ""),
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 150,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (params.value ? params.value.split("T")[0] : ""),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              handleEdit(params.row);
            }}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              handleDeleteClick(params.row);
            }}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              console.log("Info action triggered for", params.row);
            }}
            color="info"
          >
            <VisibilityIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box
      ref={containerRef}
      sx={{ width: "100%", p: 2, maxWidth: computedMaxWidth }}
    >
      {/* Page Heading */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Events
      </Typography>

      {/* Season Autocomplete Dropdown */}
      <FormControl sx={{ minWidth: 150, mb: 2 }}>
        <Autocomplete
          disablePortal
          options={seasons}
          value={selectedSeason}
          onChange={handleSeasonChange}
          getOptionLabel={(option) => option.name}
          sx={{ width: 200, "& .MuiInputBase-root": { height: 40 } }}
          clearIcon={null}
          renderInput={(params) => <TextField {...params} label="Season" />}
        />
      </FormControl>

      {/* Search Bar & Add Event Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search events..."
          size="small"
          sx={{ width: 200 }}
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ height: 40 }}
          onClick={() => router.push("/dashboard/events/add")}
        >
          Add Event
        </Button>
      </Box>

      {/* Data Grid */}
      <Box sx={{ width: "100%" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 200,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredRows}
            columns={columns}
            disableColumnMenu
            getRowId={(row) => row._id}
            sx={{
              width: "100%",
              minHeight: "300px",
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
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
              sorting: { sortModel: [{ field: "startDate", sort: "desc" }] },
            }}
            // Use the custom pagination via the "slots" prop
            slots={{
              pagination: CustomPagination,
              noRowsOverlay: CustomNoRowsOverlay,
            }}
          />
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the event{" "}
            <strong>{selectedEvent?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
