import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import PlayerTradingCard from "@/components/PlayerTradingCard";
import { teamsService } from "@/services/teams";
import { auctionService } from "@/services/auction-service";
import { ApiPlayer } from "@/types/player";

interface Team {
  _id: string;
  name: string;
  totalBudget: number;
  players: ApiPlayer[];
}

const AdminAuctionView = () => {
  const searchParams = useSearchParams();

  const [eventId, setEventId] = useState<string>(""); // default is empty now
  const [auctionId, setAuctionId] = useState<string>("");

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamBudgetData, setTeamBudgetData] = useState<any[]>([]); // live team budget data
  const [initialBudget, setInitialBudget] = useState<number>(0); // dynamic initial budget from API
  const [soldPlayers, setSoldPlayers] = useState<ApiPlayer[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<ApiPlayer | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [teamsLoading, setTeamsLoading] = useState<boolean>(true);
  const [auctionStatus, setAuctionStatus] = useState<
    "ready" | "live" | "paused" | "completed"
  >("ready");
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [processedPlayerCount, setProcessedPlayerCount] = useState<number>(0);

  // Read auctionId and eventId from URL search parameters
  useEffect(() => {
    const urlAuctionId = searchParams.get("auctionId");
    if (urlAuctionId) {
      setAuctionId(urlAuctionId);
    } else {
      setError("No auction ID provided. Please include auctionId in the URL.");
    }
    const urlEventId = searchParams.get("eventId");
    if (urlEventId) {
      setEventId(urlEventId);
    } else {
      setError((prev) =>
        prev
          ? prev + " Also, no event ID provided in URL."
          : "No event ID provided in URL."
      );
    }
  }, [searchParams]);

  // Fetch teams data from teamsService.
  // The teams' totalBudget is not used for live calculations.
  useEffect(() => {
    const fetchTeams = async () => {
      setTeamsLoading(true);
      try {
        const fetchedTeams = await teamsService.getAllTeams();
        const formattedTeams: Team[] = fetchedTeams.map((team: any) => ({
          _id: team._id,
          name: team.name,
          totalBudget: 0, // budget will come from the auctionService.getTeamBudget API
          players: [],
        }));
        setTeams(formattedTeams);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Failed to load teams data");
      } finally {
        setTeamsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // Fetch live team budget data from auctionService.
  // The API returns an object with { teams: [...], initialBudget: number }
  useEffect(() => {
    const updateTeamBudgets = async () => {
      if (!auctionId) return;
      try {
        const budgetData = (await auctionService.getTeamBudget(
          auctionId
        )) as unknown as {
          teams: any[];
          initialBudget: number;
        };
        setTeamBudgetData(budgetData.teams);
        setInitialBudget(budgetData.initialBudget);
      } catch (err) {
        console.error("Error updating team budgets:", err);
      }
    };

    updateTeamBudgets();
  }, [auctionId, currentPlayer]);

  const startAuction = async () => {
    if (!eventId) {
      setError("No event ID provided");
      return;
    }
    if (!auctionId) {
      setError("No auction ID provided");
      return;
    }
    setLoading(true);
    try {
      const randomPlayer = await auctionService.getRandomPlayer(eventId);
      setCurrentPlayer(randomPlayer);
      setBidAmount(randomPlayer.basePrice?.toString() || "100");
      setAuctionStatus("live");
      setError("");
      setSuccess("Auction started");
    } catch (err) {
      console.error("Error starting auction:", err);
      setError("Failed to start auction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pauseAuction = () => {
    setAuctionStatus("paused");
    setSuccess("Auction paused");
  };

  const resumeAuction = () => {
    setAuctionStatus("live");
    setSuccess("Auction resumed");
  };

  const nextPlayer = async () => {
    if (!eventId) {
      setError("No event ID provided");
      return;
    }
    if (!auctionId) {
      setError("No auction ID provided");
      return;
    }
    setLoading(true);
    try {
      const randomPlayer = await auctionService.getRandomPlayer(eventId);
      setCurrentPlayer(randomPlayer);
      setBidAmount(randomPlayer.basePrice?.toString() || "100");
      setSelectedTeamId("");
      setError("");
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setSuccess(
        `Next player: ${randomPlayer.firstName} ${randomPlayer.lastName}`
      );
    } catch (err) {
      console.error("Error fetching next player:", err);
      setError("Failed to fetch next player. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const restartAuction = () => {
    // Do not modify teams data here because budgets are shown separately.
    setSoldPlayers([]);
    setCurrentPlayer(null);
    setCurrentPlayerIndex(0);
    setProcessedPlayerCount(0);
    setBidAmount("");
    setSelectedTeamId("");
    setAuctionStatus("ready");
    setError("");
    setSuccess("Auction reset. Ready to start.");
  };

  const handleOpenConfirmDialog = () => {
    if (!selectedTeamId) {
      setError("Please select a team");
      return;
    }
    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid bid amount");
      return;
    }
    // Find live budget from teamBudgetData; if not available, fallback to the initialBudget from API.
    const teamBudget = teamBudgetData.find(
      (b: any) => b.teamId === selectedTeamId
    );
    const remainingBudget = teamBudget
      ? teamBudget.remainingBudget
      : initialBudget;
    if (amount > remainingBudget) {
      const teamName = teams.find((team) => team._id === selectedTeamId)?.name;
      setError(`Bid amount exceeds ${teamName}'s remaining budget`);
      return;
    }
    setError("");
    setConfirmDialogOpen(true);
  };

  const handleSelectTeam = (event: any) => {
    setSelectedTeamId(event.target.value);
  };

  const handleBidAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBidAmount(event.target.value);
  };

  const handleSellPlayer = async () => {
    if (!currentPlayer || !selectedTeamId) return;
    if (!auctionId) {
      setError("No auction ID provided");
      setConfirmDialogOpen(false);
      return;
    }
    setLoading(true);
    try {
      const amount = parseInt(bidAmount);
      await auctionService.purchasePlayer({
        auctionId,
        playerId: currentPlayer._id,
        teamId: selectedTeamId,
        soldPrice: amount,
      });
      const updatedPlayer = {
        ...currentPlayer,
        soldStatus: "sold" as const,
        teamId: selectedTeamId,
        soldAmount: amount,
      };
      setSoldPlayers([...soldPlayers, updatedPlayer]);
      setCurrentPlayer(null);
      setProcessedPlayerCount((prev) => prev + 1);
      setSuccess(
        `${updatedPlayer.firstName} ${updatedPlayer.lastName} sold to ${
          teams.find((t) => t._id === selectedTeamId)?.name
        } for ₹${amount.toLocaleString()}`
      );
      setBidAmount("");
      setSelectedTeamId("");
      if (auctionStatus === "live") {
        setTimeout(async () => {
          try {
            const randomPlayer = await auctionService.getRandomPlayer(eventId);
            setCurrentPlayer(randomPlayer);
            setBidAmount(randomPlayer.basePrice?.toString() || "100");
            setSelectedTeamId("");
          } catch (err) {
            console.error("Error fetching next player:", err);
            setError("Failed to fetch next player. Please try again.");
          } finally {
            setLoading(false);
          }
        }, 1500);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error selling player:", err);
      setError("Failed to process player sale");
      setLoading(false);
    }
    setConfirmDialogOpen(false);
  };

  const handleMarkUnsold = async () => {
    if (!currentPlayer) return;
    if (!auctionId) {
      setError("No auction ID provided");
      return;
    }
    if (!eventId) {
      setError("No event ID provided");
      return;
    }
    setLoading(true);
    try {
      const updatedPlayer = {
        ...currentPlayer,
        soldStatus: "unsold" as const,
      };
      setSoldPlayers([...soldPlayers, updatedPlayer]);
      setCurrentPlayer(null);
      setProcessedPlayerCount((prev) => prev + 1);
      setSuccess(
        `${updatedPlayer.firstName} ${updatedPlayer.lastName} marked as unsold`
      );
      setBidAmount("");
      setSelectedTeamId("");
      if (auctionStatus === "live") {
        setTimeout(async () => {
          try {
            const randomPlayer = await auctionService.getRandomPlayer(eventId, {
              skipped: true,
              playerId: updatedPlayer._id,
            });
            setCurrentPlayer(randomPlayer);
            setBidAmount(randomPlayer.basePrice?.toString() || "100");
            setSelectedTeamId("");
          } catch (err) {
            console.error("Error fetching next player:", err);
            setError("Failed to fetch next player. Please try again.");
          } finally {
            setLoading(false);
          }
        }, 1500);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error marking player as unsold:", err);
      setError("Failed to mark player as unsold");
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Auction Management
      </Typography>

      <Paper
        sx={{ p: 2, mb: 3, display: "flex", alignItems: "center", gap: 2 }}
      >
        {auctionStatus === "ready" && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={startAuction}
            disabled={loading || teamsLoading || teams.length === 0}
          >
            Start Auction
          </Button>
        )}

        {auctionStatus === "live" && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PauseIcon />}
            onClick={pauseAuction}
          >
            Pause Auction
          </Button>
        )}

        {auctionStatus === "paused" && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={resumeAuction}
          >
            Resume Auction
          </Button>
        )}

        <Button
          variant="outlined"
          color="warning"
          startIcon={<ReplayIcon />}
          onClick={restartAuction}
          sx={{ ml: "auto" }}
          disabled={teamsLoading || loading}
        >
          Reset Auction
        </Button>

        <Chip
          label={`Auction ${auctionStatus.toUpperCase()}`}
          color={
            auctionStatus === "ready"
              ? "default"
              : auctionStatus === "live"
              ? "success"
              : auctionStatus === "paused"
              ? "warning"
              : "error"
          }
          variant="outlined"
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {teamsLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading teams data...
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
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
                    <Box sx={{ mb: 3 }}>
                      <FormControl
                        fullWidth
                        error={!selectedTeamId && error.includes("team")}
                      >
                        <InputLabel id="team-select-label">
                          Winning Team
                        </InputLabel>
                        <Select
                          labelId="team-select-label"
                          value={selectedTeamId}
                          label="Winning Team"
                          onChange={handleSelectTeam}
                          disabled={
                            auctionStatus !== "live" || teams.length === 0
                          }
                        >
                          <MenuItem value="">
                            <em>Select a team</em>
                          </MenuItem>
                          {teams.map((team) => (
                            <MenuItem
                              key={team._id}
                              value={team._id}
                              disabled={
                                (teamBudgetData.find(
                                  (b: any) => b.teamId === team._id
                                )?.remainingBudget || initialBudget) <
                                parseInt(bidAmount || "0")
                              }
                            >
                              {team.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Bid Amount (₹)"
                        value={bidAmount}
                        onChange={handleBidAmountChange}
                        type="number"
                        InputProps={{
                          inputProps: { min: currentPlayer.basePrice || 100 },
                        }}
                        error={error.includes("bid amount")}
                        disabled={auctionStatus !== "live"}
                      />
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenConfirmDialog}
                        disabled={
                          !selectedTeamId ||
                          !bidAmount ||
                          auctionStatus !== "live"
                        }
                        size="large"
                        sx={{
                          px: 4,
                          py: 1,
                          borderRadius: 2,
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          background:
                            "linear-gradient(45deg, #2196F3, #1565C0)",
                        }}
                      >
                        Sell Player
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleMarkUnsold}
                        disabled={auctionStatus !== "live" || !currentPlayer}
                        size="large"
                        sx={{
                          borderRadius: 2,
                          borderWidth: 2,
                          "&:hover": {
                            borderWidth: 2,
                          },
                        }}
                      >
                        Mark as Unsold
                      </Button>
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
                    ? "Start the auction to begin"
                    : auctionStatus === "completed"
                    ? "Auction completed!"
                    : "No player currently on auction"}
                </Typography>
                {teamsLoading && <CircularProgress sx={{ mt: 2 }} />}
                {!teamsLoading && teams.length === 0 && (
                  <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    No teams available. Please add teams before starting the
                    auction.
                  </Typography>
                )}
                {loading && <CircularProgress sx={{ mt: 2 }} />}
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Auction Progress
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {processedPlayerCount} players processed
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  processedPlayerCount
                    ? (processedPlayerCount / (processedPlayerCount + 1)) * 100
                    : 0
                }
                sx={{ mt: 1 }}
              />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Recent Activity</strong>
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
                  {soldPlayers
                    .slice(-5)
                    .reverse()
                    .map((player) => (
                      <TableRow key={player._id}>
                        <TableCell>
                          {`${player.firstName} ${player.lastName}`}
                          <Chip
                            size="small"
                            label={
                              player.soldStatus === "sold" ? "SOLD" : "UNSOLD"
                            }
                            color={
                              player.soldStatus === "sold" ? "success" : "error"
                            }
                            sx={{ ml: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          {player.teamId
                            ? teams.find((t) => t._id === player.teamId)?.name
                            : "-"}
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
                      <TableCell colSpan={3} align="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ py: 2 }}
                        >
                          No players sold yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Team Budgets
            </Typography>

            {teamsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress />
              </Box>
            ) : teamBudgetData.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No team budget data available for this auction
                </Typography>
              </Box>
            ) : (
              teamBudgetData.map((budget: any) => {
                const team = teams.find((t) => t._id === budget.teamId);
                if (!team) return null;
                const remainingBudget = budget.remainingBudget;
                const budgetPercentage =
                  (remainingBudget / initialBudget) * 100;
                let budgetColor = "success.main";
                if (budgetPercentage < 30) budgetColor = "error.main";
                else if (budgetPercentage < 60) budgetColor = "warning.main";

                return (
                  <Box key={budget.teamId} sx={{ mb: 3 }}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="subtitle1">{team.name}</Typography>
                      <Typography
                        variant="subtitle1"
                        sx={{ color: budgetColor }}
                      >
                        ₹{remainingBudget.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={budgetPercentage}
                      color={
                        budgetPercentage < 30
                          ? "error"
                          : budgetPercentage < 60
                          ? "warning"
                          : "success"
                      }
                      sx={{ mt: 1, mb: 1, height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {budget.playersBought ?? 0} players bought
                    </Typography>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                );
              })
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={confirmDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Player Sale</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to sell{" "}
            {currentPlayer
              ? `${currentPlayer.firstName} ${currentPlayer.lastName}`
              : ""}{" "}
            to {teams.find((t) => t._id === selectedTeamId)?.name} for ₹
            {parseInt(bidAmount || "0").toLocaleString()}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSellPlayer}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Confirm Sale"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAuctionView;
