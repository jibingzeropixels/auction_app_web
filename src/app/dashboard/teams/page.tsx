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

const events = [
  { id: 1, name: "Men's Cricket", seasonId: 1 },
  { id: 2, name: "Women's Cricket", seasonId: 1 },
  { id: 3, name: "Junior Cricket", seasonId: 2 },
];

const initialTeams = [
  { id: 1, name: "Mumbai Indians", eventId: 1, seasonId: 1 },
  { id: 2, name: "CSK", eventId: 1, seasonId: 1 },
  { id: 3, name: "RCB", eventId: 2, seasonId: 1 },
  { id: 4, name: "Delhi Capitals", eventId: 3, seasonId: 2 },
];

export default function TeamsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<number | "all">("all");
  const [selectedEvent, setSelectedEvent] = useState<number | "all">("all");
  const [filteredTeams, setFilteredTeams] = useState(initialTeams);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    filterTeams(selectedSeason, selectedEvent, value);
  };

  const handleSeasonChange = (event: any) => {
    const newSeasonId = event.target.value;
    setSelectedSeason(newSeasonId);
    setSelectedEvent("all");
    filterTeams(newSeasonId, "all", searchTerm);
  };

  const handleEventChange = (event: any) => {
    const newEventId = event.target.value;
    setSelectedEvent(newEventId);
    filterTeams(selectedSeason, newEventId, searchTerm);
  };

  const filterTeams = (
    season: number | "all",
    event: number | "all",
    search: string
  ) => {
    setFilteredTeams(
      initialTeams.filter(
        (team) =>
          (season === "all" || team.seasonId === season) &&
          (event === "all" || team.eventId === event) &&
          team.name.toLowerCase().includes(search)
      )
    );
  };

  const handleEdit = (teamId: number) => {
    router.push(`/dashboard/teams/add?edit=${teamId}`);
  };

  const handleDeleteClick = (team: { id: number; name: string }) => {
    setSelectedTeam(team);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedTeam) {
      console.log(`Deleting team ${selectedTeam.id}`);
      // TODO: Add actual delete logic here
    }
    setOpenDeleteDialog(false);
    setSelectedTeam(null);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Team Name", width: 250 },
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
      {/* Search Bar & Add Team Button */}
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
          placeholder="Search teams..."
          size="small"
          sx={{ width: 250 }}
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
          onClick={() => router.push("/dashboard/teams/add")}
        >
          Add Team
        </Button>
      </Box>

      {/* Season & Event Dropdowns */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography sx={{ mb: 0.5, fontSize: 12, fontWeight: 500 }}>
            Seasons
          </Typography>
          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value={selectedSeason}
              onChange={handleSeasonChange}
              sx={{ height: 40 }}
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

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography sx={{ mb: 0.5, fontSize: 12, fontWeight: 500 }}>
            Events
          </Typography>
          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value={selectedEvent}
              onChange={handleEventChange}
              sx={{ height: 40 }}
            >
              <MenuItem value="all">All Events</MenuItem>
              {events
                .filter(
                  (event) =>
                    selectedSeason === "all" ||
                    event.seasonId === selectedSeason
                )
                .map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Data Grid */}
      <DataGrid
        rows={filteredTeams}
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
            Are you sure you want to delete the team{" "}
            <strong>{selectedTeam?.name}</strong>?
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
