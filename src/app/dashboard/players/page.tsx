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
  Chip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { seasonsService } from "@/services/seasons";
import { eventsService } from "@/services/events";
import { teamsService } from "@/services/teams";
import { playersService } from "@/services/players-service";

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
  category: string;
  status: "available" | "sold" | "unsold";
  eventId: string;
  createdAt: string;
};

export default function PlayersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  
  const [selectedSeason, setSelectedSeason] = useState<Season | { _id: "all"; name: string }>({
    _id: "all",
    name: "All Seasons",
  });
  const [selectedEvent, setSelectedEvent] = useState<EventType | { _id: "all"; name: string; seasonId: "all" }>({
    _id: "all",
    name: "All Events",
    seasonId: "all",
  });
  const [selectedTeam, setSelectedTeam] = useState<TeamType | { _id: "all"; name: string; eventId: "all" }>({
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
    async function fetchData() {
      try {
        const [fetchedSeasons, fetchedEvents, fetchedTeams, fetchedPlayers] = await Promise.all(
          [
            seasonsService.getAllSeasons(),
            eventsService.getAllEvents(),
            teamsService.getAllTeams(),
            playersService.getAllPlayers(),
          ]
        );
        setSeasons(fetchedSeasons);
        setEvents(fetchedEvents);
        setTeams(fetchedTeams);
        
        // Convert API players to the format needed for the UI
        const formattedPlayers: Player[] = fetchedPlayers.map(player => ({
          _id: player._id,
          name: `${player.firstName} ${player.lastName}`,
          teamId: player.teamId || null,
          category: player.skills && player.skills.length > 0 ? 
            (typeof player.skills[0] === 'string' ? player.skills[0] : 
             Object.keys(player.skills[0])[0] || 'Unknown') : 'Unknown',
          status: player.soldStatus || 'available',
          eventId: player.eventId || "",
          createdAt: player.createdAt
        }));
        
        setPlayers(formattedPlayers);
        setFilteredPlayers(formattedPlayers);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = players.filter(player => {
      const playerEvent = events.find(e => e._id === player.eventId);
      
      const eventBelongsToSeason = 
        selectedSeason._id === "all" || 
        playerEvent?.seasonId === selectedSeason._id;
      
      const belongsToEvent = 
        selectedEvent._id === "all" || 
        player.eventId === selectedEvent._id;
      
      const belongsToTeam = 
        selectedTeam._id === "all" || 
        player.teamId === selectedTeam._id;
      
      const matchesSearch = 
        player.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return eventBelongsToSeason && belongsToEvent && belongsToTeam && matchesSearch;
    });
    
    setFilteredPlayers(filtered);
  }, [selectedSeason, selectedEvent, selectedTeam, searchTerm, players, events, teams]);

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
    const player = players.find(p => p._id === playerId);
    if (!player) return;
    
    router.push(`/dashboard/players/add?edit=${playerId}&name=${encodeURIComponent(player.name)}&eventId=${encodeURIComponent(player.eventId)}&category=${encodeURIComponent(player.category)}`);
  };

  const handleDeleteClick = (player: Player) => {
    setSelectedPlayer(player);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedPlayer) {
      try {
        setLoading(true);
        await playersService.deletePlayer(selectedPlayer._id);
        
        setPlayers(prevPlayers => 
          prevPlayers.filter(p => p._id !== selectedPlayer._id)
        );
        
        setFilteredPlayers(prevPlayers => 
          prevPlayers.filter(p => p._id !== selectedPlayer._id)
        );
        
        setOpenDeleteDialog(false);
        setSelectedPlayer(null);
      } catch (error) {
        console.error("Error deleting player:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "primary";
      case "sold": return "success";
      case "unsold": return "error";
      default: return "default";
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
    {
      field: "category",
      headerName: "Category",
      width: 130,
      headerClassName: "super-app-theme--header",
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <Chip 
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)} 
          color={getStatusColor(params.value) as "primary" | "success" | "error" | "default"}
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
          ? teams.find(team => team._id === params.value)?.name || "Unknown Team"
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

  const seasonOptions = [
    { _id: "all", name: "All Seasons" },
    ...seasons
  ];
  
  const eventOptions = [
    { _id: "all", name: "All Events", seasonId: "all" },
    ...events
  ];
  
  const teamOptions = [
    { _id: "all", name: "All Teams", eventId: "all" },
    ...teams
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
              labelDisplayedRows: ({ from, to, count }) => {
                const currentPage = Math.ceil(from / 10);
                const totalPages = Math.max(1, Math.ceil(count / 10));
                return `Page ${currentPage} of ${totalPages}`;
              }
            }
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