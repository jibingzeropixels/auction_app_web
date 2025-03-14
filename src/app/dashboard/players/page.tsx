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

const teams = [
  { id: 1, name: "Mumbai Indians", eventId: 1 },
  { id: 2, name: "CSK", eventId: 1 },
  { id: 3, name: "RCB", eventId: 2 },
];

const initialRows = [
  { id: 1, name: "Virat Kohli", teamId: 1 },
  { id: 2, name: "MS Dhoni", teamId: 2 },
  { id: 3, name: "Rohit Sharma", teamId: 3 },
];

export default function PlayersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<number | "all">("all");
  const [selectedEvent, setSelectedEvent] = useState<number | "all">("all");
  const [selectedTeam, setSelectedTeam] = useState<number | "all">("all");
  const [filteredRows, setFilteredRows] = useState(initialRows);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    filterData(selectedSeason, selectedEvent, selectedTeam, value);
  };

  const handleSeasonChange = (event: any) => {
    setSelectedSeason(event.target.value);
    setSelectedEvent("all");
    setSelectedTeam("all");
    filterData(event.target.value, "all", "all", searchTerm);
  };

  const handleEventChange = (event: any) => {
    setSelectedEvent(event.target.value);
    setSelectedTeam("all");
    filterData(selectedSeason, event.target.value, "all", searchTerm);
  };

  const handleTeamChange = (event: any) => {
    setSelectedTeam(event.target.value);
    filterData(selectedSeason, selectedEvent, event.target.value, searchTerm);
  };

  const filterData = (
    seasonId: number | "all",
    eventId: number | "all",
    teamId: number | "all",
    search: string
  ) => {
    const filtered = initialRows.filter((row) => {
      const team = teams.find((t) => t.id === row.teamId);
      const event = events.find((e) => e.id === team?.eventId);
      const season = seasons.find((s) => s.id === event?.seasonId);

      return (
        (seasonId === "all" || season?.id === seasonId) &&
        (eventId === "all" || event?.id === eventId) &&
        (teamId === "all" || team?.id === teamId) &&
        row.name.toLowerCase().includes(search)
      );
    });
    setFilteredRows(filtered);
  };

  const handleEdit = (playerId: number) => {
    router.push(`/dashboard/players/add?edit=${playerId}`);
  };

  const handleDeleteClick = (player: { id: number; name: string }) => {
    setSelectedPlayer(player);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedPlayer) {
      console.log(`Deleting player ${selectedPlayer.id}`);
      // TODO: Add actual delete logic here
    }
    setOpenDeleteDialog(false);
    setSelectedPlayer(null);
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Player Name", width: 250 },
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
      {/* Search Bar & Add Player Button */}
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
          placeholder="Search players..."
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
          onClick={() => router.push("/dashboard/players/add")}
        >
          Add Player
        </Button>
      </Box>

      {/* Dropdown Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Box>
          <Typography sx={{ mb: 0.5, fontSize: 12, fontWeight: 500 }}>
            Season
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

        <Box>
          <Typography sx={{ mb: 0.5, fontSize: 12, fontWeight: 500 }}>
            Event
          </Typography>
          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value={selectedEvent}
              onChange={handleEventChange}
              sx={{ height: 40 }}
            >
              <MenuItem value="all">All Events</MenuItem>
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Typography sx={{ mb: 0.5, fontSize: 12, fontWeight: 500 }}>
            Team
          </Typography>
          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value={selectedTeam}
              onChange={handleTeamChange}
              sx={{ height: 40 }}
            >
              <MenuItem value="all">All Teams</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Data Grid */}
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

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{selectedPlayer?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
