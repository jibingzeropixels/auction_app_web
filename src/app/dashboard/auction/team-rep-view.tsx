"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  LinearProgress,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import PlayerTradingCard from "@/components/PlayerTradingCard";
import { useAuth } from "@/context/auth-context";
import { auctionService } from "@/services/auction-service";
import { playersService } from "@/services/players-service";
import { ApiPlayer } from "@/types/player";
import { EventSourcePolyfill } from "event-source-polyfill";
import PlayersByStatusPopup from "./PlayersByStatusPopup";

export interface TeamBudget {
  teamName: string;
  playersBought: number;
  teamId: string;
  remainingBudget: number;
  reserveAmount: number;
  maxAuctionAmount: number;
  initialBudget: number;
  players: { firstName: string; lastName: string }[];
}

interface Team {
  _id: string;
  name: string;
  totalBudget: number;
  remainingBudget: number;
  players: Player[];
}

interface Player {
  _id: string;
  name: string;
  basePrice: number;
  category: string;
  status: "available" | "sold" | "unsold";
  teamId?: string;
  soldAmount?: number;
  battingSkill?: number;
  bowlingSkill?: number;
  fieldingSkill?: number;
}

// Define interfaces based on expected user/token structure
interface TeamAttribute {
  id: string;
  // potentially other attributes like name, role, etc.
}

interface AuthUser {
  // other properties of the user object (e.g., id, name, email)
  teamAttributes?: TeamAttribute[]; // Make optional if it might not exist
}

const decodeJWT = (token: string) => {
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = atob(payloadBase64);
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

const getTeamIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const payload = decodeJWT(token);
  return payload && payload.teamAttributes
    ? payload.teamAttributes[0]?.id
    : null;
};

const mockTeams: Team[] = [
  {
    _id: "1",
    name: "Chennai Super Kings",
    totalBudget: 1000000,
    remainingBudget: 850000,
    players: [],
  },
  {
    _id: "2",
    name: "Mumbai Indians",
    totalBudget: 1000000,
    remainingBudget: 720000,
    players: [],
  },
  {
    _id: "3",
    name: "Royal Challengers Bangalore",
    totalBudget: 1000000,
    remainingBudget: 900000,
    players: [],
  },
  {
    _id: "4",
    name: "Kolkata Knight Riders",
    totalBudget: 1000000,
    remainingBudget: 800000,
    players: [],
  },
];

const TeamRepAuctionView = () => {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [auctionId, setAuctionId] = useState<string>("");
  const [eventId, setEventId] = useState<string>("");
  const [teams] = useState<Team[]>(mockTeams);
  const [soldPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<ApiPlayer | null>(null);
  const [auctionStatus] = useState<"ready" | "active" | "paused" | "completed">(
    "active"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [showPopup, setShowPopup] = useState(false);
  const [allPlayers, setAllPlayers] = useState<ApiPlayer[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  useEffect(() => {
    const eid = searchParams.get("eventId");
    console.log("URL eventId:", eid);
    if (eid) setEventId(eid);
  }, [searchParams]);

  // 2) Only fetch when both showPopup AND eventId are truthy:
  useEffect(() => {
    if (!showPopup || !eventId) return;
    setLoadingPlayers(true);
    playersService
      .getAllPlayers()
      .then((players) => {
        const filtered = players.filter((p) => p.eventId === eventId);
        setAllPlayers(filtered);
      })
      .catch((err) => console.error("Failed to load players", err))
      .finally(() => setLoadingPlayers(false));
  }, [showPopup, eventId]);

  // Helpers to split into three groups
  const upcomingPlayers = allPlayers.filter((p) => p.soldStatus === "pending");
  const unsoldPlayers = allPlayers.filter((p) => p.soldStatus === "unsold");
  const soldPlayersList = allPlayers.filter((p) => p.soldStatus === "sold");
  console.log({
    allPlayers,
    upcomingPlayers: allPlayers.filter((p) => p.soldStatus === "pending"),
    unsoldPlayers: allPlayers.filter((p) => p.soldStatus === "unsold"),
    soldPlayersList: allPlayers.filter((p) => p.soldStatus === "sold"),
  });
  // Live team status from SSE
  const [liveTeamStatus, setLiveTeamStatus] = useState<TeamBudget | null>(null);
  const [liveSquadPlayers, setLiveSquadPlayers] = useState<
    { firstName: string; lastName: string }[]
  >([]);

  // Use the defined type instead of 'any'
  const typedUser = user as AuthUser | null; // Cast to your defined type (and allow null)

  const userTeamId = typedUser?.teamAttributes?.[0]?.id || getTeamIdFromToken();

  // Fallback to static team if live data isn’t available.
  const userTeam = teams.find((team) => team._id === userTeamId) || teams[0];

  useEffect(() => {
    const auctionIdValue = searchParams.get("auctionId");
    if (auctionIdValue) {
      setAuctionId(auctionIdValue);
    } else {
      setError("No auction ID provided in the URL");
    }
    const eventIdValue =
      searchParams.get("eventId") || "67daf7232fef49cb95788d77";
    setEventId(eventIdValue);
  }, [searchParams]);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      if (eventId) {
        try {
          setLoading(true);
          const player = await auctionService.getRandomPlayer(eventId);
          setCurrentPlayer(player);
        } catch (err) {
          console.error("Error fetching current player:", err);
        } finally {
          setLoading(false);
        }
      }
    }, 5000);

    if (eventId) {
      const fetchCurrentPlayer = async () => {
        try {
          setLoading(true);
          const player = await auctionService.getRandomPlayer(eventId);
          setCurrentPlayer(player);
        } catch (err) {
          console.error("Error fetching current player:", err);
          setError("Failed to load current player");
        } finally {
          setLoading(false);
        }
      };

      fetchCurrentPlayer();
    }

    return () => clearInterval(pollInterval);
  }, [eventId]);

  // Establish SSE connection for live team updates.
  useEffect(() => {
    console.log("auctionId:", auctionId, "userTeamId:", userTeamId);
    if (!auctionId || !userTeamId) {
      console.log("Missing auctionId or userTeamId:", {
        auctionId,
        userTeamId,
      });
      return;
    }

    const sseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auctions/liveTeamUpdates?teamId=${userTeamId}&auctionId=${auctionId}`;
    const token = localStorage.getItem("token");

    console.log("Establishing SSE connection to:", sseUrl);
    console.log("Authorization token:", token);

    const eventSource = new EventSourcePolyfill(sseUrl, {
      headers: {
        Authorization: token || "",
      },
      heartbeatTimeout: 45000,
    });

    eventSource.onopen = function (ev) {
      console.log("SSE connection opened.", ev);
    };

    eventSource.onmessage = function (ev) {
      console.log("SSE message received:", ev.data);
      try {
        const data = JSON.parse(ev.data);
        // Check if response contains team status directly
        if (data.teamData && data.teamData.length > 0) {
          setLiveTeamStatus(data.teamData[0]);
        } else if (data.teamName) {
          setLiveTeamStatus(data);
        }
        if (data.players) {
          setLiveSquadPlayers(data.players);
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = function (ev) {
      console.error("SSE error:", ev);
      eventSource.close();
    };

    return () => {
      console.log("Closing SSE connection.");
      eventSource.close();
    };
  }, [auctionId, userTeamId]);

  // Calculate the maximum bid using the initial budget if available.
  const calculateMaxBid = () => {
    if (liveTeamStatus) {
      // Use maxAuctionAmount from SSE if provided,
      // or compute using the initial budget.
      if (liveTeamStatus.maxAuctionAmount) {
        return liveTeamStatus.maxAuctionAmount;
      }
      const totalBudget = liveTeamStatus.initialBudget;
      const currentBudget = liveTeamStatus.remainingBudget;
      const remainingPlayersNeeded = 15 - liveTeamStatus.playersBought;
      if (remainingPlayersNeeded <= 1) {
        return currentBudget;
      } else {
        // Reserve budget proportionate to the initial budget.
        const reserveBudget = (totalBudget / 15) * (remainingPlayersNeeded - 1);
        return Math.max(currentBudget - reserveBudget, 0);
      }
    }
    // Fallback to static team data
    const remainingPlayersNeeded = 15 - userTeam.players.length;
    if (remainingPlayersNeeded <= 1) {
      return userTeam.remainingBudget;
    } else {
      const reserveBudget = 50000 * (remainingPlayersNeeded - 1);
      return Math.max(userTeam.remainingBudget - reserveBudget, 0);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Live Auction
      </Typography>

      <Paper
        sx={{ p: 2, mb: 3, display: "flex", alignItems: "center", gap: 2 }}
      >
        <Typography variant="body1">Auction Status:</Typography>
        <Chip
          label={auctionStatus.toUpperCase()}
          color={
            auctionStatus === "ready"
              ? "default"
              : auctionStatus === "active"
              ? "success"
              : auctionStatus === "paused"
              ? "warning"
              : "error"
          }
          variant="outlined"
        />
        {auctionStatus === "paused" && (
          <Typography variant="body2" color="text.secondary">
            The auction is currently paused. Please wait for it to resume.
          </Typography>
        )}
        {auctionStatus === "completed" && (
          <Typography variant="body2" color="text.secondary">
            The auction has concluded. Thank you for participating.
          </Typography>
        )}
        {error && (
          <Chip
            label={error}
            color="error"
            variant="outlined"
            sx={{ ml: "auto" }}
          />
        )}
        <Button
          variant="contained"
          sx={{ ml: "auto" }}
          onClick={() => setShowPopup(true)}
        >
          Upcoming Players
        </Button>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Player
            </Typography>
            {currentPlayer ? (
              <Box>
                <Grid container spacing={3}>
                  <Grid
                    item
                    xs={12}
                    md={5}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <PlayerTradingCard player={currentPlayer} />
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: "primary.main",
                        color: "white",
                        borderRadius: 4,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #1976d2, #0d47a1)",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Your Bidding Limit
                      </Typography>
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: "bold",
                          textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          letterSpacing: "-0.5px",
                        }}
                      >
                        ₹{calculateMaxBid().toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                        This is the maximum amount you can bid for this player
                        based on your remaining budget and squad needs.
                      </Typography>
                      <Box
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          fontSize: "1.8rem",
                          opacity: 0.2,
                          transform: "rotate(15deg)",
                        }}
                      >
                        💰
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  border: "1px dashed #ccc",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1" gutterBottom>
                  {auctionStatus === "ready"
                    ? "Waiting for the auction to start"
                    : auctionStatus === "completed"
                    ? "Auction completed!"
                    : "No player currently on auction"}
                </Typography>
                {loading && <CircularProgress sx={{ mt: 2 }} />}
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Auction History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Player</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Category</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Team</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Amount</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {soldPlayers.slice(0, 10).map((player) => (
                    <TableRow key={player._id}>
                      <TableCell>
                        {player.name}
                        {player.teamId === userTeam._id && (
                          <Chip
                            size="small"
                            label="YOUR TEAM"
                            color="success"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{player.category}</TableCell>
                      <TableCell>
                        {player.status === "unsold" ? (
                          <Chip size="small" label="UNSOLD" color="error" />
                        ) : (
                          (player.teamId &&
                            teams.find((t) => t._id === player.teamId)?.name) ||
                          "-"
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {player.soldAmount
                          ? `₹${player.soldAmount.toLocaleString()}`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {soldPlayers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ py: 3 }}
                        >
                          No auction history yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              mb: 3,
              fontFamily: "Roboto, sans-serif",
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Your Team Status
            </Typography>

            {liveTeamStatus ? (
              <Grid container spacing={2}>
                {/* Players Bought */}
                <Grid item xs={6}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="text.secondary"
                  >
                    Players Bought
                  </Typography>
                  <Typography variant="body1">
                    {liveTeamStatus.playersBought - 1}
                  </Typography>
                </Grid>

                {/* Initial Budget */}
                <Grid item xs={6}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="text.secondary"
                  >
                    Initial Budget
                  </Typography>
                  <Typography variant="body1">
                    ₹{liveTeamStatus.initialBudget.toLocaleString()}
                  </Typography>
                </Grid>

                {/* Reserve Amount */}
                <Grid item xs={6}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="text.secondary"
                  >
                    Reserve Amount
                  </Typography>
                  <Typography variant="body1">
                    ₹{liveTeamStatus.reserveAmount.toLocaleString()}
                  </Typography>
                </Grid>

                {/* Max Auction Amount */}
                <Grid item xs={6}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="text.secondary"
                  >
                    Max Auction Amount
                  </Typography>
                  <Typography variant="body1">
                    ₹{liveTeamStatus.maxAuctionAmount.toLocaleString()}
                  </Typography>
                </Grid>

                {/* Remaining Budget with Label */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="text.secondary"
                  >
                    Remaining Budget
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                    ₹{liveTeamStatus.remainingBudget.toLocaleString()}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (liveTeamStatus.remainingBudget /
                        (liveTeamStatus.initialBudget ||
                          userTeam.totalBudget ||
                          1)) *
                      100
                    }
                    sx={{ height: 10, borderRadius: 1 }}
                  />
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Loading team status...
              </Typography>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Squad List */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Your Squad (Players: {liveSquadPlayers.length})
            </Typography>
            {liveSquadPlayers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                You haven’t acquired any players yet.
              </Typography>
            ) : (
              liveSquadPlayers.map((player, idx) => (
                <Typography key={idx} variant="body1" sx={{ mb: 0.5 }}>
                  {player.firstName} {player.lastName}
                </Typography>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>

      <PlayersByStatusPopup
        open={showPopup}
        onClose={() => setShowPopup(false)}
        upcomingPlayers={upcomingPlayers}
        unsoldPlayers={unsoldPlayers}
        soldPlayers={soldPlayersList}
        loading={loadingPlayers}
      />
    </Box>
  );
};

export default TeamRepAuctionView;
