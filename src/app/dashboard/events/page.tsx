"use client";

import React, { useState } from "react";
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

const seasons = [
  { id: 1, name: "2025-2026" },
  { id: 2, name: "2026-2027" },
];

const initialRows = [
  { id: 1, name: "Men's Cricket", seasonId: 1 },
  { id: 2, name: "Women's Cricket", seasonId: 1 },
  { id: 3, name: "Junior Cricket", seasonId: 2 },
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

  // Handle search
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

  // Handle season change
  const handleSeasonChange = (event: any) => {
    const newSeasonId = event.target.value;
    setSelectedSeason(newSeasonId);
    setFilteredRows(
      newSeasonId === "all"
        ? initialRows
        : initialRows.filter((event) => event.seasonId === newSeasonId)
    );
  };

  // Edit event
  const handleEdit = (eventId: number) => {
    router.push(`/dashboard/events/add?edit=${eventId}`);
  };

  // Open delete confirmation
  const handleDeleteClick = (event: { id: number; name: string }) => {
    setSelectedEvent(event);
    setOpenDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedEvent) {
      console.log(`Deleting event ${selectedEvent.id}`);
      // TODO: Add actual delete logic here
    }
    setOpenDeleteDialog(false);
    setSelectedEvent(null);
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    { field: "name", headerName: "Event Name", width: 250 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
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
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", p: 2 }}>
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
          sx={{ width: 250 }} // Set default width
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
          sx={{ height: 40 }} // Fix button height
          onClick={() => router.push("/dashboard/events/add")}
        >
          Add Event
        </Button>
      </Box>

      {/* Season Dropdown Below Search Bar */}
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
              minWidth: 150, // Adjust width dynamically
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

      {/* Data Grid with White Background */}
      <DataGrid
        rows={filteredRows}
        columns={columns}
        sx={{
          bgcolor: "white",
          "& .MuiDataGrid-cell": { bgcolor: "white" },
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "white",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-footerContainer": { bgcolor: "white" },
        }}
      />

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
