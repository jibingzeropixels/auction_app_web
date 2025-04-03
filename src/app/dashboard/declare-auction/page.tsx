"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Paper,
  Typography,
  FormControl,
  Autocomplete,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { eventsService } from "@/services/events";
import { seasonsService } from "@/services/seasons";
import { teamsService } from "@/services/teams";
import { playersService } from "@/services/players-service";

// Updated type definitions
type Season = {
  _id: string;
  name: string;
};

type Event = {
  _id: string;
  name: string;
  seasonId: string;
  auctionStatus: "pending" | "declared" | "in-progress" | "completed";
  auctionId?: string; // For later use
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
  skills: string[];
  status: "available" | "sold" | "unsold" | string;
  eventId: string;
  email: string;
  createdAt: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `${token}` } : {}),
  };
};

const DeclareAuctionPage = () => {
  const router = useRouter();

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [basePrice, setBasePrice] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // New state variables for teams and players count
  const [totalTeams, setTotalTeams] = useState<number>(0);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);

  // State for the dialog
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  // Fetch seasons and events from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const seasonsData: Season[] = await seasonsService.getAllSeasons();
        setSeasons(seasonsData);

        const eventsData: Event[] = await eventsService.getAllEvents();
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter events based on selected season
  useEffect(() => {
    if (selectedSeason) {
      setFilteredEvents(
        events.filter((e) => e.seasonId === selectedSeason._id)
      );
    } else {
      setFilteredEvents(events);
    }
    // Clear selected event and previous counts when season changes
    setSelectedEvent(null);
    setTotalTeams(0);
    setTotalPlayers(0);
  }, [selectedSeason, events]);

  // Each time the selected event changes, update team and player counts
  useEffect(() => {
    if (selectedEvent) {
      const fetchCounts = async () => {
        try {
          // Fetch all teams and filter by selected event
          const allTeams: TeamType[] = await teamsService.getAllTeams();
          const eventTeams = allTeams.filter(
            (team) => team.eventId === selectedEvent._id
          );

          // Fetch all players and transform API response if needed
          const apiPlayers = await playersService.getAllPlayers();
          const eventPlayers: Player[] = apiPlayers
            .map((apiPlayer: any) => ({
              _id: apiPlayer._id,
              name: apiPlayer.name || "Unknown",
              teamId: apiPlayer.teamId ?? null,
              skills: apiPlayer.skills || [],
              status: apiPlayer.status || "available",
              eventId: apiPlayer.eventId,
              email: apiPlayer.email,
              createdAt: apiPlayer.createdAt,
            }))
            .filter((player: Player) => player.eventId === selectedEvent._id);

          setTotalTeams(eventTeams.length);
          setTotalPlayers(eventPlayers.length);
        } catch (error) {
          console.error("Error fetching counts:", error);
          setTotalTeams(0);
          setTotalPlayers(0);
        }
      };
      fetchCounts();
    }
  }, [selectedEvent]);

  // Calculate team size (players per team). If not whole, display a range.
  const calculateTeamSize = () => {
    if (totalTeams === 0) return "-";
    const size = totalPlayers / totalTeams;
    const floorSize = Math.floor(size);
    const ceilSize = Math.ceil(size);
    return floorSize === ceilSize
      ? `${floorSize}`
      : `${floorSize} to ${ceilSize}`;
  };

  const handleSeasonChange = (_: any, value: Season | null) => {
    setSelectedSeason(value);
  };

  const handleEventChange = (_: any, value: Event | null) => {
    setSelectedEvent(value);
  };

  const handleDeclareAuction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation: Check if counts are zero before proceeding
    if (totalTeams === 0 || totalPlayers === 0) {
      setOpenDialog(true);
      return;
    }

    if (!selectedEvent || selectedEvent.auctionStatus !== "pending") return;

    const payload = {
      basePrice: Number(basePrice),
      eventId: selectedEvent._id,
      budget: Number(budget),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/auctions/declareAuction`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorDetails = await res.json();
        throw new Error(errorDetails.message || "Failed to declare auction");
      }

      const data = await res.json();
      router.push(`/dashboard/auction?auctionId=${data.auctionId}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error declaring auction:", err.message);
        alert(err.message);
      } else {
        console.error("Error declaring auction:", err);
        alert("An unknown error occurred.");
      }
    }
  };

  // Function to close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" align="center" sx={{ mb: 3 }}>
          Declare Auction
        </Typography>

        {/* Display event details if an event is selected */}
        {selectedEvent && (
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Typography variant="body1">
              Total Teams: {totalTeams} | Total Players: {totalPlayers}
            </Typography>
            <Typography variant="body1">
              Team Size: {calculateTeamSize()}
            </Typography>
          </Box>
        )}

        {/* Form Start */}
        <Box component="form" onSubmit={handleDeclareAuction} noValidate>
          <Stack spacing={3}>
            {/* Season Select */}
            <FormControl fullWidth>
              <Autocomplete
                options={seasons}
                getOptionLabel={(option) => option.name}
                onChange={handleSeasonChange}
                renderInput={(params) => (
                  <TextField {...params} label="Select Season" required />
                )}
              />
            </FormControl>

            {/* Event Select */}
            <FormControl fullWidth>
              <Autocomplete
                options={filteredEvents}
                getOptionLabel={(option) => option.name}
                onChange={handleEventChange}
                renderOption={(props, option) => (
                  <li {...props} key={option._id}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <span>{option.name}</span>
                      <Chip
                        label={option.auctionStatus}
                        size="small"
                        color={
                          option.auctionStatus === "pending"
                            ? "warning"
                            : option.auctionStatus === "declared"
                            ? "success"
                            : option.auctionStatus === "in-progress"
                            ? "info"
                            : "default"
                        }
                      />
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Select Event" required />
                )}
              />
            </FormControl>

            {/* Conditional fields for a pending event */}
            {selectedEvent && selectedEvent.auctionStatus === "pending" && (
              <>
                <TextField
                  required
                  fullWidth
                  label="Base Price"
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  required
                  fullWidth
                  label="Budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            {selectedEvent && selectedEvent.auctionStatus === "pending" && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Declare Auction
              </Button>
            )}
          </Stack>
        </Box>
        {/* Form End */}

        {/* Button for declared or in-progress events */}
        {selectedEvent &&
          (selectedEvent.auctionStatus === "declared" ||
            selectedEvent.auctionStatus === "in-progress") && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() =>
                  router.push(
                    `/dashboard/auction?auctionId=${selectedEvent.auctionId}`
                  )
                }
              >
                Go to Auction
              </Button>
            </Box>
          )}
      </Paper>

      {/* Dialog for insufficient teams or players */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Insufficient Teams or Players</DialogTitle>
        <DialogContent>
          <Typography>
            Not enough teams or players to declare the auction.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeclareAuctionPage;
