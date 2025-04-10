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
  Autocomplete,
  CircularProgress,
  Chip,
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { seasonsService } from "@/services/seasons";
import { eventsService } from "@/services/events";
import { teamsService } from "@/services/teams";
import { playersService } from "@/services/players-service";

type Season = { _id: string; name: string };
type EventType = { _id: string; name: string; seasonId: string };
type TeamType = { _id: string; name: string; eventId: string };

// Internally, we store skills as a flat array of name/rating pairs
type SkillEntry = { skillName: string; rating: number };

type Player = {
  _id: string;
  name: string;
  teamId: string | null;
  skills: SkillEntry[];
  status: "available" | "sold" | "unsold" | string;
  eventId: string;
  email: string;
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

  const [selectedSeason, setSelectedSeason] = useState<
    Season | { _id: "all"; name: string }
  >({ _id: "all", name: "All Seasons" });
  const [selectedEvent, setSelectedEvent] = useState<
    EventType | { _id: "all"; name: string; seasonId: "all" }
  >({ _id: "all", name: "All Events", seasonId: "all" });
  const [selectedTeam, setSelectedTeam] = useState<
    TeamType | { _id: "all"; name: string; eventId: "all" }
  >({ _id: "all", name: "All Teams", eventId: "all" });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [computedMaxWidth, setComputedMaxWidth] = useState("100%");
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container width
  useEffect(() => {
    if (containerRef.current) {
      setComputedMaxWidth(`${containerRef.current.offsetWidth}px`);
    }
  }, []);

  // Fetch seasons, events, teams, and players
  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedSeasons, fetchedEvents, fetchedTeams, fetchedPlayers] =
          await Promise.all([
            seasonsService.getAllSeasons(),
            eventsService.getAllEvents(),
            teamsService.getAllTeams(),
            playersService.getAllPlayers(),
          ]);

        setSeasons(fetchedSeasons);
        setEvents(fetchedEvents);
        setTeams(fetchedTeams);

        // Map API players into our UI shape
        const formattedPlayers: Player[] = fetchedPlayers.map((p) => {
          // flatten API skills: array of objects { skill: rating }
          const flat: SkillEntry[] = Array.isArray(p.skills)
            ? p.skills.flatMap((obj) =>
                Object.entries(obj).map(([skillName, rating]) => ({
                  skillName,
                  rating: Number(rating),
                }))
              )
            : [];

          return {
            _id: p._id,
            name: `${p.firstName} ${p.lastName}`,
            teamId: p.teamId ?? null,
            skills: flat,
            status: p.soldStatus ?? "available",
            eventId: p.eventId ?? "",
            email: p.email ?? "",
            createdAt: p.createdAt,
          };
        });

        setPlayers(formattedPlayers);
        setFilteredPlayers(formattedPlayers);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Apply season/event/team/search filters
  useEffect(() => {
    setFilteredPlayers(
      players.filter((player) => {
        const ev = events.find((e) => e._id === player.eventId);
        const okSeason =
          selectedSeason._id === "all" || ev?.seasonId === selectedSeason._id;
        const okEvent =
          selectedEvent._id === "all" || player.eventId === selectedEvent._id;
        const okTeam =
          selectedTeam._id === "all" || player.teamId === selectedTeam._id;
        const okSearch = player.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return okSeason && okEvent && okTeam && okSearch;
      })
    );
  }, [
    players,
    events,
    selectedSeason,
    selectedEvent,
    selectedTeam,
    searchTerm,
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  const handleSeasonChange = (
    _: React.SyntheticEvent,
    val: Season | { _id: "all"; name: string } | null
  ) => {
    if (val) {
      setSelectedSeason(val);
      setSelectedEvent({ _id: "all", name: "All Events", seasonId: "all" });
      setSelectedTeam({ _id: "all", name: "All Teams", eventId: "all" });
    }
  };
  const handleEventChange = (
    _: React.SyntheticEvent,
    val: EventType | { _id: "all"; name: string; seasonId: "all" } | null
  ) => {
    if (val) {
      setSelectedEvent(val);
      setSelectedTeam({ _id: "all", name: "All Teams", eventId: "all" });
    }
  };
  const handleTeamChange = (
    _: React.SyntheticEvent,
    val: TeamType | { _id: "all"; name: string; eventId: "all" } | null
  ) => {
    if (val) setSelectedTeam(val);
  };

  const handleAddPlayer = () => {
    router.push("/dashboard/players/add");
  };

  const handleEdit = (playerId: string) => {
    const p = players.find((x) => x._id === playerId);
    if (!p) return;

    // Re‑group into a single object: { skillName: rating, ... }
    const grouped = p.skills.reduce<Record<string, number>>((acc, cur) => {
      acc[cur.skillName] = cur.rating;
      return acc;
    }, {});

    const skillsParam = encodeURIComponent(JSON.stringify([grouped]));

    router.push(
      `/dashboard/players/add?edit=${playerId}` +
        `&name=${encodeURIComponent(p.name)}` +
        `&eventId=${encodeURIComponent(p.eventId)}` +
        `&skills=${skillsParam}` +
        `&email=${encodeURIComponent(p.email)}`
    );
  };

  const handleDeleteClick = (player: Player) => {
    setSelectedPlayer(player);
    setOpenDeleteDialog(true);
  };
  const confirmDelete = async () => {
    if (!selectedPlayer) return;
    try {
      setLoading(true);
      await playersService.deletePlayer(selectedPlayer._id);
      setPlayers((prev) => prev.filter((x) => x._id !== selectedPlayer._id));
      setOpenDeleteDialog(false);
      setSelectedPlayer(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
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
    {
      field: "skills",
      headerName: "Skills",
      flex: 1,
      minWidth: 200,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => {
        const skills: SkillEntry[] = params.value || [];
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {skills.map((s, index) => (
              <Chip
                key={`${s.skillName}-${index}`}
                label={`${s.skillName}: ${s.rating}`}
                size="small"
              />
            ))}
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <Chip
          label={String(params.value).replace(/^./, (c) => c.toUpperCase())}
          color={getStatusColor(String(params.value))}
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
        const team = teams.find((t) => t._id === params.value);
        return <span>{team?.name ?? "Not Assigned"}</span>;
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
              console.log("View", params.row);
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
        <FormControl sx={{ width: 200 }}>
          <Autocomplete
            options={seasonOptions}
            value={selectedSeason}
            onChange={handleSeasonChange}
            getOptionLabel={(o) => o.name}
            renderInput={(params) => <TextField {...params} label="Season" />}
          />
        </FormControl>
        <FormControl sx={{ width: 200 }}>
          <Autocomplete
            options={eventOptions.filter(
              (e) =>
                selectedSeason._id === "all" ||
                e._id === "all" ||
                e.seasonId === selectedSeason._id
            )}
            value={selectedEvent}
            onChange={handleEventChange}
            getOptionLabel={(o) => o.name}
            renderInput={(params) => <TextField {...params} label="Event" />}
          />
        </FormControl>
        <FormControl sx={{ width: 200 }}>
          <Autocomplete
            options={teamOptions.filter(
              (t) =>
                selectedEvent._id === "all" ||
                t._id === "all" ||
                t.eventId === selectedEvent._id
            )}
            value={selectedTeam}
            onChange={handleTeamChange}
            getOptionLabel={(o) => o.name}
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
          size="small"
          placeholder="Search players..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 250 }}
        />
        <Button variant="contained" onClick={handleAddPlayer}>
          Add Player
        </Button>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 300,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={filteredPlayers}
          columns={columns}
          getRowId={(r) => r._id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          disableColumnMenu
          sx={{
            "& .super-app-theme--header": {
              backgroundColor: "#1976d2",
              color: "white",
              fontWeight: 700,
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
            Delete <strong>{selectedPlayer?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
