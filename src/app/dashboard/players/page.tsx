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
  FormControl,
  Autocomplete,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

type Season = { id: number | "all"; name: string };
type EventType = { id: number | "all"; name: string; seasonId: number };
type TeamType = { id: number | "all"; name: string; eventId: number };

const seasons: Season[] = [
  { id: 1, name: "2025-2026" },
  { id: 2, name: "2026-2027" },
];

const events: EventType[] = [
  { id: 1, name: "Men's Cricket", seasonId: 1 },
  { id: 2, name: "Women's Cricket", seasonId: 1 },
  { id: 3, name: "Junior Cricket", seasonId: 2 },
];

const teams: TeamType[] = [
  { id: 1, name: "Mumbai Indians", eventId: 1 },
  { id: 2, name: "CSK", eventId: 1 },
  { id: 3, name: "RCB", eventId: 2 },
];

// Prepend "All" options.
const seasonOptions: Season[] = [
  { id: "all", name: "All Seasons" },
  ...seasons,
];
const eventOptions: EventType[] = [
  { id: "all", name: "All Events", seasonId: 0 },
  ...events,
];
const teamOptions: TeamType[] = [
  { id: "all", name: "All Teams", eventId: 0 },
  ...teams,
];

const initialRows = [
  { id: 1, name: "Virat Kohli", teamId: 1 },
  { id: 2, name: "MS Dhoni", teamId: 2 },
  { id: 3, name: "Rohit Sharma", teamId: 3 },
];

export default function PlayersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<Season>({
    id: "all",
    name: "All Seasons",
  });
  const [selectedEvent, setSelectedEvent] = useState<EventType>({
    id: "all",
    name: "All Events",
    seasonId: 0,
  });
  const [selectedTeam, setSelectedTeam] = useState<TeamType>({
    id: "all",
    name: "All Teams",
    eventId: 0,
  });
  const [filteredRows, setFilteredRows] = useState(initialRows);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{
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

  const filterData = (
    season: Season,
    event: EventType,
    team: TeamType,
    search: string
  ) => {
    const filtered = initialRows.filter((row) => {
      const teamFound = teams.find((t) => t.id === row.teamId);
      const eventFound = events.find((e) => e.id === teamFound?.eventId);
      const seasonFound = seasons.find((s) => s.id === eventFound?.seasonId);

      return (
        (season.id === "all" || seasonFound?.id === season.id) &&
        (event.id === "all" || eventFound?.id === event.id) &&
        (team.id === "all" || teamFound?.id === team.id) &&
        row.name.toLowerCase().includes(search)
      );
    });
    setFilteredRows(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterData(selectedSeason, selectedEvent, selectedTeam, value);
  };

  const handleSeasonChange = (_: any, newValue: Season | null) => {
    if (newValue) {
      setSelectedSeason(newValue);
      // Reset event and team to "All" whenever season changes.
      const allEvent: EventType = {
        id: "all",
        name: "All Events",
        seasonId: 0,
      };
      const allTeam: TeamType = { id: "all", name: "All Teams", eventId: 0 };
      setSelectedEvent(allEvent);
      setSelectedTeam(allTeam);
      filterData(newValue, allEvent, allTeam, searchTerm);
    }
  };

  const handleEventChange = (_: any, newValue: EventType | null) => {
    if (newValue) {
      setSelectedEvent(newValue);
      // Reset team to "All" when event changes.
      const allTeam: TeamType = { id: "all", name: "All Teams", eventId: 0 };
      setSelectedTeam(allTeam);
      filterData(selectedSeason, newValue, allTeam, searchTerm);
    }
  };

  const handleTeamChange = (_: any, newValue: TeamType | null) => {
    if (newValue) {
      setSelectedTeam(newValue);
      filterData(selectedSeason, selectedEvent, newValue, searchTerm);
    }
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
      // TODO: Add actual delete logic here.
    }
    setOpenDeleteDialog(false);
    setSelectedPlayer(null);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Player Name",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      headerClassName: "super-app-theme--header",
      flex: 0,
      minWidth: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(params.row.id);
            }}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
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
    <Box
      ref={containerRef}
      sx={{ width: "100%", p: 2, maxWidth: computedMaxWidth }}
    >
      {/* Page Heading */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Players
      </Typography>

      {/* Dropdown Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <Autocomplete
            disablePortal
            options={seasonOptions}
            value={selectedSeason}
            onChange={handleSeasonChange}
            getOptionLabel={(option) => option.name}
            sx={{ width: 200, "& .MuiInputBase-root": { height: 40 } }}
            clearIcon={null}
            renderInput={(params) => <TextField {...params} label="Season" />}
          />
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <Autocomplete
            disablePortal
            options={eventOptions.filter(
              (ev) =>
                selectedSeason.id === "all" ||
                ev.id === "all" ||
                ev.seasonId === selectedSeason.id
            )}
            value={selectedEvent}
            onChange={handleEventChange}
            getOptionLabel={(option) => option.name}
            sx={{ width: 200, "& .MuiInputBase-root": { height: 40 } }}
            clearIcon={null}
            renderInput={(params) => <TextField {...params} label="Event" />}
          />
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <Autocomplete
            disablePortal
            options={teamOptions.filter(
              (tm) =>
                selectedEvent.id === "all" ||
                tm.id === "all" ||
                tm.eventId === selectedEvent.id
            )}
            value={selectedTeam}
            onChange={handleTeamChange}
            getOptionLabel={(option) => option.name}
            sx={{ width: 200, "& .MuiInputBase-root": { height: 40 } }}
            clearIcon={null}
            renderInput={(params) => <TextField {...params} label="Team" />}
          />
        </FormControl>
      </Box>

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

      {/* Data Grid */}
      <DataGrid
        rows={filteredRows}
        columns={columns}
        sx={{
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
      />

      {/* Delete Confirmation Dialog */}
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
