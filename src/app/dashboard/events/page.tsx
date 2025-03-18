"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";

const seasons = [
  { id: 1, name: "2025-2026" },
  { id: 2, name: "2026-2027" },
];

const initialRows = [
  {
    id: 1,
    name: "Men's Cricket",
    description: "Exciting men's cricket tournament",
    startDate: "2025-06-01",
    endDate: "2025-06-15",
    seasonId: 1,
  },
  {
    id: 2,
    name: "Women's Cricket",
    description: "High-level women's cricket competition",
    startDate: "2025-07-01",
    endDate: "2025-07-10",
    seasonId: 1,
  },
  {
    id: 3,
    name: "Junior Cricket",
    description: "Up-and-coming talent in junior cricket",
    startDate: "2025-08-01",
    endDate: "2025-08-12",
    seasonId: 2,
  },
];

export default function EventsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<number | "all">("all");
  const [filteredRows, setFilteredRows] = useState(initialRows);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [computedMaxWidth, setComputedMaxWidth] = useState("100%");

  // Ref to measure the container's rendered width.
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      const measuredWidth = containerRef.current.offsetWidth;
      setComputedMaxWidth(`${measuredWidth}px`);
    }
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredRows(
      initialRows.filter(
        (row) =>
          (selectedSeason === "all" || row.seasonId === selectedSeason) &&
          row.name.toLowerCase().includes(value)
      )
    );
  };

  const handleSeasonChange = (event: any) => {
    const newSeasonId = event.target.value;
    setSelectedSeason(newSeasonId);
    setFilteredRows(
      newSeasonId === "all"
        ? initialRows
        : initialRows.filter((row) => row.seasonId === newSeasonId)
    );
  };

  const handleEdit = (eventId: number) => {
    router.push(`/dashboard/events/add?edit=${eventId}`);
  };

  const handleDeleteClick = (event: { id: number; name: string }) => {
    setSelectedEvent(event);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedEvent) {
      console.log(`Deleting event ${selectedEvent.id}`);
      // TODO: Add actual delete logic here
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
      field: "description",
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
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 150,
      headerClassName: "super-app-theme--header",
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
              handleEdit(params.row.id);
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
            <InfoIcon />
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

      {/* Season Dropdown Above Search Bar */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          flexDirection: "column",
          width: "fit-content",
        }}
      >
        <Typography
          sx={{ mb: 0.5, fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}
        >
          Season
        </Typography>
        <FormControl sx={{ minWidth: "auto" }}>
          <Select
            value={selectedSeason}
            onChange={handleSeasonChange}
            sx={{
              height: 40,
              minWidth: 150,
              textOverflow: "ellipsis",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MenuItem value="all">All Seasons</MenuItem>
            {seasons.map((season) => (
              <MenuItem key={season.id} value={season.id}>
                {season.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
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
        <DataGrid
          rows={filteredRows}
          columns={columns}
          disableColumnMenu
          sx={{
            width: "100%",
            bgcolor: "white",
            "& .MuiDataGrid-cell": { bgcolor: "white" },
            "& .MuiDataGrid-footerContainer": { bgcolor: "white" },
            "& .super-app-theme--header": {
              backgroundColor: "#1976d2", // Blue used in the button
              color: "white",
              fontWeight: 700,
              borderBottom: "2px solid #115293",
            },
          }}
        />
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
