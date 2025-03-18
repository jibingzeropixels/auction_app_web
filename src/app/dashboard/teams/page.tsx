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
import VisibilityIcon from "@mui/icons-material/Visibility";

type Season = { id: number | "all"; name: string };
type EventType = { id: number | "all"; name: string; seasonId: number };

const seasons: Season[] = [
  { id: 1, name: "2025-2026" },
  { id: 2, name: "2026-2027" },
];

const events: EventType[] = [
  { id: 1, name: "Men's Cricket", seasonId: 1 },
  { id: 2, name: "Women's Cricket", seasonId: 1 },
  { id: 3, name: "Junior Cricket", seasonId: 2 },
];

// Prepend an "All" option for seasons and events.
const seasonOptions: Season[] = [
  { id: "all", name: "All Seasons" },
  ...seasons,
];
const eventOptions: EventType[] = [
  { id: "all", name: "All Events", seasonId: 0 },
  ...events,
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
  const [selectedSeason, setSelectedSeason] = useState<Season>({
    id: "all",
    name: "All Seasons",
  });
  const [selectedEvent, setSelectedEvent] = useState<EventType>({
    id: "all",
    name: "All Events",
    seasonId: 0,
  });
  const [filteredTeams, setFilteredTeams] = useState(initialTeams);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{
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

  const filterTeams = (season: Season, event: EventType, search: string) => {
    setFilteredTeams(
      initialTeams.filter((team) => {
        const matchesSeason =
          season.id === "all" || team.seasonId === season.id;
        const matchesEvent = event.id === "all" || team.eventId === event.id;
        const matchesSearch = team.name.toLowerCase().includes(search);
        return matchesSeason && matchesEvent && matchesSearch;
      })
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterTeams(selectedSeason, selectedEvent, value);
  };

  const handleSeasonChange = (event: any, newValue: Season | null) => {
    if (newValue) {
      setSelectedSeason(newValue);
      // Reset event selection to "all" whenever season changes.
      setSelectedEvent({ id: "all", name: "All Events", seasonId: 0 });
      filterTeams(
        newValue,
        { id: "all", name: "All Events", seasonId: 0 },
        searchTerm
      );
    }
  };

  const handleEventChange = (event: any, newValue: EventType | null) => {
    if (newValue) {
      setSelectedEvent(newValue);
      filterTeams(selectedSeason, newValue, searchTerm);
    }
  };

  const handleEdit = (teamId: number) => {
    router.push(`/dashboard/teams/add?edit=${teamId}`);
  };

  const handleDeleteClick = (team: { id: number; name: string }) => {
    setSelectedTeam(team);
    setOpenDeleteDialog(true);
  };

  const handleInfoClick = (team: { id: number; name: string }) => {
    console.log("Info action triggered for", team);
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
    {
      field: "name",
      headerName: "Team Name",
      flex: 1,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      minWidth: 150,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
        >
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
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleInfoClick(params.row);
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
        Teams
      </Typography>

      {/* Season & Event Autocomplete Dropdowns */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2 }}>
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
                ev.seasonId === selectedSeason.id ||
                ev.id === "all"
            )}
            value={selectedEvent}
            onChange={handleEventChange}
            getOptionLabel={(option) => option.name}
            sx={{ width: 200, "& .MuiInputBase-root": { height: 40 } }}
            clearIcon={null}
            renderInput={(params) => <TextField {...params} label="Event" />}
          />
        </FormControl>
      </Box>

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

      {/* Data Grid */}
      <DataGrid
        rows={filteredTeams}
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
