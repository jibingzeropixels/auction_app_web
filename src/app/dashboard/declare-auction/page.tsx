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

type Season = {
  _id: string;
  name: string;
};

type Event = {
  _id: string;
  name: string;
  seasonId: string;
  auctionStatus: "pending" | "declared" | "in-progress" | "completed";
  auctionId?: string;
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

  const [totalTeams, setTotalTeams] = useState<number>(0);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  // Mapping for auction status labels
  const statusMapping: Record<string, string> = {
    pending: "Pending",
    declared: "Declared",
    "in-progress": "In Progress",
    completed: "Complete",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const seasonsData: Season[] = await seasonsService.getAllSeasons();
        setSeasons(seasonsData);

        const eventsData: Event[] = await eventsService.getAllEvents();
        setEvents(eventsData);
        // Filter out completed events when first loading
        setFilteredEvents(
          eventsData.filter((e) => e.auctionStatus !== "completed")
        );
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      setFilteredEvents(
        events.filter(
          (e) =>
            e.seasonId === selectedSeason._id && e.auctionStatus !== "completed"
        )
      );
    } else {
      setFilteredEvents(events.filter((e) => e.auctionStatus !== "completed"));
    }
    setSelectedEvent(null);
    setTotalTeams(0);
    setTotalPlayers(0);
  }, [selectedSeason, events]);

  useEffect(() => {
    if (selectedEvent) {
      const fetchCounts = async () => {
        try {
          const allTeams: TeamType[] = await teamsService.getAllTeams();
          const eventTeams = allTeams.filter(
            (team) => team.eventId === selectedEvent._id
          );

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

  const calculateTeamSize = () => {
    if (totalTeams === 0) return "-";
    const size = totalPlayers / totalTeams;
    const floorSize = Math.floor(size);
    const ceilSize = Math.ceil(size);
    return floorSize === ceilSize
      ? `${floorSize}`
      : `${floorSize} - ${ceilSize}`;
  };

  const handleSeasonChange = (_: any, value: Season | null) => {
    setSelectedSeason(value);
  };

  const handleEventChange = (_: any, value: Event | null) => {
    setSelectedEvent(value);
  };

  const handleDeclareAuction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      router.push(
        `/dashboard/auction?auctionId=${data.auctionId}&eventId=${selectedEvent._id}&auctionStatus=${selectedEvent.auctionStatus}&basePrice=${basePrice}`
      );
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
          Auctions
        </Typography>

        <Box component="form" onSubmit={handleDeclareAuction} noValidate>
          <Stack spacing={3}>
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
                        label={statusMapping[option.auctionStatus]}
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

            {selectedEvent && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  backgroundColor: "grey.200",
                  borderRadius: 1,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontSize: "1.1rem", fontWeight: 500 }}
                >
                  Total Teams: {totalTeams} | Total Players: {totalPlayers}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontSize: "1.1rem", fontWeight: 500 }}
                >
                  Team Size: {calculateTeamSize()}
                </Typography>
              </Box>
            )}

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
                    `/dashboard/auction?auctionId=${selectedEvent.auctionId}&eventId=${selectedEvent._id}&auctionStatus=${selectedEvent.auctionStatus}&basePrice=${basePrice}`
                  )
                }
              >
                Go to Auction
              </Button>
            </Box>
          )}
      </Paper>

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
