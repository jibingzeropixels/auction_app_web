"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
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
import { seasonsService } from "@/services/seasons";
import { eventsService } from "@/services/events";
import { teamsService } from "@/services/teams";

// Define data types
type Season = {
  _id: string;
  name: string;
};

type EventType = {
  _id: string;
  name: string;
  seasonId: string;
};

type TeamType = {
  _id: string;
  name: string;
  eventId: string;
};

type Player = {
  _id: string;
  name: string;
  teamId: string | null;
  basePrice: number;
  category: string;
  status: "available" | "sold" | "unsold";
  eventId: string;
  createdAt: string;
  seasonName: string;
  eventName: string;
};

export default function PlayersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

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
  const [selectedTeam, setSelectedTeam] = useState<
    TeamType | { _id: "all"; name: string; eventId: "all" }
  >({
    _id: "all",
    name: "All Teams",
    eventId: "all",
  });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [computedMaxWidth, setComputedMaxWidth] = useState("100%");
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      setComputedMaxWidth(`${containerRef.current.offsetWidth}px`);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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

        const mockPlayers: Player[] = [
          {
            _id: "1",
            name: "Virat Kohli",
            teamId: fetchedTeams[0]?._id || null,
            basePrice: 200000,
            category: "Batsman",
            status: "sold",
            eventId: fetchedEvents[0]?._id || "",
            createdAt: new Date().toISOString(),
            seasonName:
              fetchedSeasons.find(
                (s: Season) => s._id === fetchedEvents[0]?.seasonId
              )?.name || "Unknown",
            eventName: fetchedEvents[0]?.name || "Unknown",
          },
          {
            _id: "2",
            name: "Rohit Sharma",
            teamId: fetchedTeams[1]?._id || null,
            basePrice: 180000,
            category: "Batsman",
            status: "sold",
            eventId: fetchedEvents[0]?._id || "",
            createdAt: new Date().toISOString(),
            seasonName:
              fetchedSeasons.find((s) => s._id === fetchedEvents[0]?.seasonId)
                ?.name || "Unknown",
            eventName: fetchedEvents[0]?.name || "Unknown",
          },
          {
            _id: "3",
            name: "Jasprit Bumrah",
            teamId: null,
            basePrice: 150000,
            category: "Bowler",
            status: "available",
            eventId: fetchedEvents[0]?._id || "",
            createdAt: new Date().toISOString(),
            seasonName:
              fetchedSeasons.find((s) => s._id === fetchedEvents[0]?.seasonId)
                ?.name || "Unknown",
            eventName: fetchedEvents[0]?.name || "Unknown",
          },
          {
            _id: "4",
            name: "MS Dhoni",
            teamId: null,
            basePrice: 220000,
            category: "Wicket Keeper",
            status: "available",
            eventId: fetchedEvents[1]?._id || "",
            createdAt: new Date().toISOString(),
            seasonName:
              fetchedSeasons.find((s) => s._id === fetchedEvents[1]?.seasonId)
                ?.name || "Unknown",
            eventName: fetchedEvents[1]?.name || "Unknown",
          },
          {
            _id: "5",
            name: "Ravindra Jadeja",
            teamId: null,
            basePrice: 140000,
            category: "All-rounder",
            status: "unsold",
            eventId: fetchedEvents[1]?._id || "",
            createdAt: new Date().toISOString(),
            seasonName:
              fetchedSeasons.find((s) => s._id === fetchedEvents[1]?.seasonId)
                ?.name || "Unknown",
            eventName: fetchedEvents[1]?.name || "Unknown",
          },
        ];

        setPlayers(mockPlayers);
        setFilteredPlayers(mockPlayers);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = players.filter((player: Player) => {
      const playerEvent = events.find(
        (e: EventType) => e._id === player.eventId
      );

      const eventBelongsToSeason =
        selectedSeason._id === "all" ||
        playerEvent?.seasonId === selectedSeason._id;

      const belongsToEvent =
        selectedEvent._id === "all" || player.eventId === selectedEvent._id;

      const belongsToTeam =
        selectedTeam._id === "all" || player.teamId === selectedTeam._id;

      const matchesSearch = player.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return (
        eventBelongsToSeason && belongsToEvent && belongsToTeam && matchesSearch
      );
    });

    setFilteredPlayers(filtered);
  }, [
    selectedSeason,
    selectedEvent,
    selectedTeam,
    searchTerm,
    players,
    events,
    teams,
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSeasonChange = (
    _: React.SyntheticEvent,
    newValue: Season | { _id: "all"; name: string } | null
  ) => {
    if (newValue) {
      setSelectedSeason(newValue);
      setSelectedEvent({ _id: "all", name: "All Events", seasonId: "all" });
      setSelectedTeam({ _id: "all", name: "All Teams", eventId: "all" });
    }
  };

  const handleEventChange = (
    _: React.SyntheticEvent,
    newValue: EventType | { _id: "all"; name: string; seasonId: "all" } | null
  ) => {
    if (newValue) {
      setSelectedEvent(newValue);
      setSelectedTeam({ _id: "all", name: "All Teams", eventId: "all" });
    }
  };

  const handleTeamChange = (
    _: React.SyntheticEvent,
    newValue: TeamType | { _id: "all"; name: string; eventId: "all" } | null
  ) => {
    if (newValue) {
      setSelectedTeam(newValue);
    }
  };

  const handleAddPlayer = () => {
    router.push("/dashboard/players/add");
  };

  const handleEdit = (playerId: string) => {
    router.push(`/dashboard/players/add?edit=${playerId}`);
  };

  const handleDeleteClick = (player: Player) => {
    setSelectedPlayer(player);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedPlayer) {
      try {
        console.log(`Deleting player ${selectedPlayer._id}`);

        setPlayers((prevPlayers) =>
          prevPlayers.filter((p) => p._id !== selectedPlayer._id)
        );

        setOpenDeleteDialog(false);
        setSelectedPlayer(null);
      } catch (error) {
        console.error("Error deleting player:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "primary";
      case "sold":
        return "success";
      case "unsold":
        return "error";
      default:
        return "default";
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Player Name",
      flex: 1,
      minWidth: 180,
      headerClassName: "super-app-theme--header",
    },
    // Only show season column for superAdmin
    ...(user?.role === "superAdmin"
      ? [
          {
            field: "seasonName",
            headerName: "Season",
            width: 150,
            headerClassName: "super-app-theme--header",
          },
        ]
      : []),
    {
      field: "eventName",
      headerName: "Event",
      width: 150,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "basePrice",
      headerName: "Base Price",
      width: 130,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <span>${params.value ? params.value.toLocaleString() : "Not set"}</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          color={
            getStatusColor(params.value) as
              | "primary"
              | "success"
              | "error"
              | "default"
          }
          size="small"
        />
      ),
    },
    {
      field: "teamId",
      headerName: "Team",
      width: 180,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => {
        const teamName = params.value
          ? teams.find((team) => team._id === params.value)?.name ||
            "Unknown Team"
          : "Not Assigned";
        return <span>{teamName}</span>;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              handleEdit(params.row._id);
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
              console.log("View player:", params.row);
            }}
            color="info"
          >
            <VisibilityIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const seasonOptions = [{ _id: "all", name: "All Seasons" }, ...seasons];

  const eventOptions = [
    { _id: "all", name: "All Events", seasonId: "all" },
    ...events,
  ];

  const teamOptions = [
    { _id: "all", name: "All Teams", eventId: "all" },
    ...teams,
  ];

  return (
    <Box
      ref={containerRef}
      sx={{ width: "100%", p: 2, maxWidth: computedMaxWidth }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Players
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
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
                ev._id === "all" ||
                ev.seasonId === selectedSeason._id
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
                selectedEvent._id === "all" ||
                tm._id === "all" ||
                tm.eventId === selectedEvent._id
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
          onClick={handleAddPlayer}
        >
          Add Player
        </Button>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 400,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={filteredPlayers}
          columns={columns}
          disableColumnMenu
          getRowId={(row) => row._id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          localeText={{
            MuiTablePagination: {
              labelDisplayedRows: ({ from, count }) => {
                const currentPage = Math.ceil(from / 10);
                const totalPages = Math.max(1, Math.ceil(count / 10));
                return `Page ${currentPage} of ${totalPages}`;
              },
            },
          }}
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
        />
      )}

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the player{" "}
            <strong>{selectedPlayer?.name}</strong>?
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
