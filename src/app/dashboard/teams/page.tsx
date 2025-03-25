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
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { teamsService } from "@/services/teams";
import { seasonsService } from "@/services/seasons";
import { eventsService } from "@/services/events";

// Import the reusable CustomPagination component.
import CustomPagination from "@/components/CustomPagination";

// Data types
type Season = {
  _id: string;
  name: string;
  desc?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
};

type EventType = {
  _id: string;
  name: string;
  seasonId: string;
  desc?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
};

type Team = { _id: string; name: string; eventId: string };

// Extended team includes extra fields for display.
type ExtendedTeam = Team & {
  seasonName: string;
  eventName: string;
};

export default function TeamsPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [extendedTeams, setExtendedTeams] = useState<ExtendedTeam[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<ExtendedTeam[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<
    Season | { _id: "all"; name: string }
  >({
    _id: "all",
    name: "All Seasons",
  });
  const [selectedEvent, setSelectedEvent] = useState<
    EventType | { _id: "all"; name: string; seasonId: "all" }
  >({
    _id: "all",
    name: "All Events",
    seasonId: "all",
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [computedMaxWidth, setComputedMaxWidth] = useState("100%");
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setComputedMaxWidth(`${containerRef.current.offsetWidth}px`);
    }
  }, []);

  // Fetch seasons, events, and teams from APIs.
  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedSeasons, fetchedEvents, fetchedTeams] = await Promise.all(
          [
            seasonsService.getAllSeasons(),
            eventsService.getAllEvents(),
            teamsService.getAllTeams(),
          ]
        );
        setSeasons(fetchedSeasons);
        setEvents(fetchedEvents);
        setTeams(fetchedTeams);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Function to extend teams with seasonName and eventName.
  const extendTeams = (
    teams: Team[],
    events: EventType[],
    seasons: Season[]
  ): ExtendedTeam[] => {
    return teams.map((team) => ({
      ...team,
      eventName: (() => {
        const ev = events.find((e) => e._id === team.eventId);
        return ev ? ev.name : "Unknown Event";
      })(),
      seasonName: (() => {
        const teamEvent = events.find((e) => e._id === team.eventId);
        if (!teamEvent) return "Unknown Season";
        const season = seasons.find((s) => s._id === teamEvent.seasonId);
        return season ? season.name : "Unknown Season";
      })(),
    }));
  };

  // Recalculate extendedTeams whenever teams, events, or seasons change.
  useEffect(() => {
    const extTeams = extendTeams(teams, events, seasons);
    setExtendedTeams(extTeams);
    // Also update the filtered list if no filter is active.
    setFilteredTeams(extTeams);
  }, [teams, events, seasons]);

  // Build options for dropdowns.
  const seasonOptions: (Season | { _id: "all"; name: string })[] = [
    { _id: "all", name: "All Seasons" },
    ...seasons,
  ];
  const eventOptions: (
    | EventType
    | { _id: "all"; name: string; seasonId: "all" }
  )[] = [{ _id: "all", name: "All Events", seasonId: "all" }, ...events];

  // Filter extendedTeams based on selected season, event, and search.
  const filterTeams = (
    season: Season | { _id: "all"; name: string },
    event: EventType | { _id: "all"; name: string; seasonId: "all" },
    search: string
  ) => {
    const filtered = extendedTeams.filter((team) => {
      const matchesSeason =
        season._id === "all" ||
        team.seasonName === seasons.find((s) => s._id === season._id)?.name;
      const matchesEvent =
        event._id === "all" ||
        team.eventName === events.find((e) => e._id === event._id)?.name;
      const matchesSearch = team.name.toLowerCase().includes(search);
      return matchesSeason && matchesEvent && matchesSearch;
    });
    setFilteredTeams(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterTeams(selectedSeason, selectedEvent, value);
  };

  const handleSeasonChange = (
    _: React.SyntheticEvent,
    newValue: Season | { _id: "all"; name: string } | null
  ) => {
    if (newValue) {
      setSelectedSeason(newValue);
      const resetEvent = { _id: "all", name: "All Events", seasonId: "all" };
      setSelectedEvent(resetEvent);
      filterTeams(newValue, resetEvent, searchTerm);
    }
  };

  const handleEventChange = (
    _: React.SyntheticEvent,
    newValue: EventType | { _id: "all"; name: string; seasonId: "all" } | null
  ) => {
    if (newValue) {
      setSelectedEvent(newValue);
      filterTeams(selectedSeason, newValue, searchTerm);
    }
  };

  const handleEdit = (teamId: string) => {
    router.push(`/dashboard/teams/add?edit=${teamId}`);
  };

  const handleDeleteClick = (team: Team) => {
    setSelectedTeam(team);
    setOpenDeleteDialog(true);
  };

  const handleInfoClick = (team: Team) => {
    console.log("Info action triggered for", team);
  };

  const confirmDelete = async () => {
    if (selectedTeam) {
      try {
        await teamsService.deleteTeam(selectedTeam._id);
        const updatedTeams = teams.filter((t) => t._id !== selectedTeam._id);
        setTeams(updatedTeams);
        filterTeams(selectedSeason, selectedEvent, searchTerm);
      } catch (error) {
        console.error(`Error deleting team ${selectedTeam._id}:`, error);
      }
    }
    setOpenDeleteDialog(false);
    setSelectedTeam(null);
  };

  // Define columns for the DataGrid.
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Team Name",
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
              handleEdit(params.row._id);
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
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Teams
      </Typography>
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
                selectedSeason._id === "all" ||
                ev.seasonId === selectedSeason._id ||
                ev._id === "all"
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
          rows={filteredTeams}
          columns={columns}
          getRowId={(row) => row._id}
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
          pagination
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
          }}
          // Use the custom pagination via the "slots" prop
          slots={{ pagination: CustomPagination }}
        />
      )}
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
