import { useState } from 'react';
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
  SelectChangeEvent
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ReplayIcon from '@mui/icons-material/Replay';
import PlayerTradingCard from '@/components/PlayerTradingCard';

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
  status: 'available' | 'sold' | 'unsold';
  teamId?: string;
  soldAmount?: number;
  battingSkill?: number;
  bowlingSkill?: number;
  fieldingSkill?: number;
}

const mockTeams: Team[] = [
  {
    _id: '1',
    name: 'Chennai Super Kings',
    totalBudget: 1000000,
    remainingBudget: 850000,
    players: []
  },
  {
    _id: '2',
    name: 'Mumbai Indians',
    totalBudget: 1000000,
    remainingBudget: 720000,
    players: []
  },
  {
    _id: '3',
    name: 'Royal Challengers Bangalore',
    totalBudget: 1000000,
    remainingBudget: 900000,
    players: []
  },
  {
    _id: '4',
    name: 'Kolkata Knight Riders',
    totalBudget: 1000000,
    remainingBudget: 800000,
    players: []
  }
];

const mockPlayers: Player[] = [
  {
    _id: 'p1',
    name: 'Virat Kohli',
    basePrice: 200000,
    category: 'Batsman',
    status: 'available',
    battingSkill: 9,
    bowlingSkill: 3,
    fieldingSkill: 8
  },
  {
    _id: 'p2',
    name: 'MS Dhoni',
    basePrice: 180000,
    category: 'Wicket Keeper',
    status: 'available',
    battingSkill: 8,
    bowlingSkill: 2,
    fieldingSkill: 9
  },
  {
    _id: 'p3',
    name: 'Rohit Sharma',
    basePrice: 190000,
    category: 'Batsman',
    status: 'available',
    battingSkill: 9,
    bowlingSkill: 4,
    fieldingSkill: 7
  },
  {
    _id: 'p4',
    name: 'Jasprit Bumrah',
    basePrice: 170000,
    category: 'Bowler',
    status: 'available',
    battingSkill: 3,
    bowlingSkill: 9,
    fieldingSkill: 7
  },
  {
    _id: 'p5',
    name: 'Ravindra Jadeja',
    basePrice: 150000,
    category: 'All-rounder',
    status: 'available',
    battingSkill: 7,
    bowlingSkill: 8,
    fieldingSkill: 9
  }
];

const AdminAuctionView = () => {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>(mockPlayers);
  const [soldPlayers, setSoldPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [auctionStatus, setAuctionStatus] = useState<'ready' | 'active' | 'paused' | 'completed'>('ready');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(-1);

  const startAuction = () => {
    if (availablePlayers.length === 0) {
      setError('No players available for auction');
      return;
    }
    
    setCurrentPlayerIndex(0);
    const firstPlayer = availablePlayers[0];
    setCurrentPlayer(firstPlayer);
    setBidAmount(firstPlayer.basePrice.toString());
    setAuctionStatus('active');
    setError('');
    setSuccess('Auction started');
  };

  const pauseAuction = () => {
    setAuctionStatus('paused');
    setSuccess('Auction paused');
  };

  const resumeAuction = () => {
    setAuctionStatus('active');
    setSuccess('Auction resumed');
  };

  const nextPlayer = () => {
    if (currentPlayerIndex >= availablePlayers.length - 1) {
      setError('No more players available');
      return;
    }
    
    const nextIndex = currentPlayerIndex + 1;
    setCurrentPlayerIndex(nextIndex);
    const nextPlayer = availablePlayers[nextIndex];
    setCurrentPlayer(nextPlayer);
    setBidAmount(nextPlayer.basePrice.toString());
    setSelectedTeamId('');
    setError('');
    setSuccess(`Next player: ${nextPlayer.name}`);
  };

  const restartAuction = () => {
    setTeams(mockTeams);
    setAvailablePlayers(mockPlayers);
    setSoldPlayers([]);
    setCurrentPlayer(null);
    setCurrentPlayerIndex(-1);
    setBidAmount('');
    setSelectedTeamId('');
    setAuctionStatus('ready');
    setError('');
    setSuccess('Auction reset. Ready to start.');
  };

  const handleOpenConfirmDialog = () => {
    if (!selectedTeamId) {
      setError('Please select a team');
      return;
    }

    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    const selectedTeam = teams.find(team => team._id === selectedTeamId);
    if (!selectedTeam) {
      setError('Invalid team selected');
      return;
    }

    if (amount > selectedTeam.remainingBudget) {
      setError(`Bid amount exceeds ${selectedTeam.name}'s remaining budget`);
      return;
    }

    setError('');
    setConfirmDialogOpen(true);
  };

  const handleSelectTeam = (event: SelectChangeEvent<string>) => {
    setSelectedTeamId(event.target.value);
  };

  const handleBidAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBidAmount(event.target.value);
  };

  const handleSellPlayer = () => {
    if (!currentPlayer || !selectedTeamId) return;

    setLoading(true);
    
    try {
      const amount = parseInt(bidAmount);
      
      const updatedPlayer = {
        ...currentPlayer,
        status: 'sold' as const,
        teamId: selectedTeamId,
        soldAmount: amount
      };
      
      const updatedTeams = teams.map(team => {
        if (team._id === selectedTeamId) {
          return {
            ...team,
            remainingBudget: team.remainingBudget - amount,
            players: [...team.players, updatedPlayer]
          };
        }
        return team;
      });
      
      const newAvailablePlayers = [...availablePlayers];
      newAvailablePlayers.splice(currentPlayerIndex, 1);
      
      setTeams(updatedTeams);
      setAvailablePlayers(newAvailablePlayers);
      setSoldPlayers([...soldPlayers, updatedPlayer]);
      setCurrentPlayer(null);
      setCurrentPlayerIndex(-1);
      setSuccess(`${updatedPlayer.name} sold to ${teams.find(t => t._id === selectedTeamId)?.name} for ₹${amount.toLocaleString()}`);
      
      setBidAmount('');
      setSelectedTeamId('');
      
      if (newAvailablePlayers.length === 0) {
        setAuctionStatus('completed');
        setSuccess('Auction completed! All players have been processed.');
      } else {
        if (auctionStatus === 'active') {
          setCurrentPlayerIndex(0);
          setCurrentPlayer(newAvailablePlayers[0]);
          setBidAmount(newAvailablePlayers[0].basePrice.toString());
        }
      }
    } catch (err) {
      console.error('Error selling player:', err);
      setError('Failed to process player sale');
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleMarkUnsold = () => {
    if (!currentPlayer) return;

    setLoading(true);
    
    try {
      const updatedPlayer = {
        ...currentPlayer,
        status: 'unsold' as const
      };
      
      const newAvailablePlayers = [...availablePlayers];
      newAvailablePlayers.splice(currentPlayerIndex, 1);
      
      setAvailablePlayers(newAvailablePlayers);
      setSoldPlayers([...soldPlayers, updatedPlayer]);
      setCurrentPlayer(null);
      setCurrentPlayerIndex(-1);
      setSuccess(`${updatedPlayer.name} marked as unsold`);
      
      setBidAmount('');
      setSelectedTeamId('');
      
      if (newAvailablePlayers.length === 0) {
        setAuctionStatus('completed');
        setSuccess('Auction completed! All players have been processed.');
      } else {
        if (auctionStatus === 'active') {
          setCurrentPlayerIndex(0);
          setCurrentPlayer(newAvailablePlayers[0]);
          setBidAmount(newAvailablePlayers[0].basePrice.toString());
        }
      }
    } catch (err) {
      console.error('Error marking player as unsold:', err);
      setError('Failed to mark player as unsold');
    } finally {
      setLoading(false);
    }
  };

  const calculateMaxBid = (teamId: string) => {
    const team = teams.find(t => t._id === teamId);
    if (!team) return 0;
    
    return team.remainingBudget;
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Auction Management
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        {auctionStatus === 'ready' && (
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={startAuction}
            disabled={availablePlayers.length === 0}
          >
            Start Auction
          </Button>
        )}
        
        {auctionStatus === 'active' && (
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<PauseIcon />}
            onClick={pauseAuction}
          >
            Pause Auction
          </Button>
        )}
        
        {auctionStatus === 'paused' && (
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={resumeAuction}
          >
            Resume Auction
          </Button>
        )}
        
        {(auctionStatus === 'active' || auctionStatus === 'paused') && (
          <Button 
            variant="outlined"
            startIcon={<SkipNextIcon />}
            onClick={nextPlayer}
            disabled={currentPlayerIndex >= availablePlayers.length - 1}
          >
            Next Player
          </Button>
        )}
        
        <Button 
          variant="outlined"
          color="warning"
          startIcon={<ReplayIcon />}
          onClick={restartAuction}
          sx={{ ml: 'auto' }}
        >
          Reset Auction
        </Button>
        
        <Chip 
          label={`Auction ${auctionStatus.toUpperCase()}`} 
          color={
            auctionStatus === 'ready' ? 'default' : 
            auctionStatus === 'active' ? 'success' : 
            auctionStatus === 'paused' ? 'warning' : 
            'error'
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
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Player
            </Typography>
            
            {currentPlayer ? (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <PlayerTradingCard player={currentPlayer} />
                  </Grid>
                  
                  <Grid item xs={12} md={7}>
                    <Box sx={{ mb: 3 }}>
                      <FormControl fullWidth error={!selectedTeamId && error.includes('team')}>
                        <InputLabel id="team-select-label">Winning Team</InputLabel>
                        <Select
                          labelId="team-select-label"
                          value={selectedTeamId}
                          label="Winning Team"
                          onChange={handleSelectTeam}
                          disabled={auctionStatus !== 'active'}
                        >
                          <MenuItem value="">
                            <em>Select a team</em>
                          </MenuItem>
                          {teams.map((team) => (
                            <MenuItem 
                              key={team._id} 
                              value={team._id}
                              disabled={team.remainingBudget < parseInt(bidAmount || '0')}
                            >
                              {team.name} (₹{team.remainingBudget.toLocaleString()} left)
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
                          inputProps: { min: currentPlayer.basePrice }
                        }}
                        error={error.includes('bid amount')}
                        helperText={selectedTeamId ? `Max: ₹${calculateMaxBid(selectedTeamId).toLocaleString()}` : ''}
                        disabled={auctionStatus !== 'active'}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleOpenConfirmDialog}
                        disabled={!selectedTeamId || !bidAmount || auctionStatus !== 'active'}
                        size="large"
                        sx={{ 
                          px: 4, 
                          py: 1, 
                          borderRadius: 2, 
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          background: 'linear-gradient(45deg, #2196F3, #1565C0)'
                        }}
                      >
                        Sell Player
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        onClick={handleMarkUnsold}
                        disabled={auctionStatus !== 'active'}
                        size="large"
                        sx={{ 
                          borderRadius: 2,
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2
                          }
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
                  textAlign: 'center',
                  border: '1px dashed #ccc',
                  borderRadius: 1
                }}
              >
                <Typography variant="body1" gutterBottom>
                  {auctionStatus === 'ready' ? 
                    "Start the auction to begin" : 
                    auctionStatus === 'completed' ?
                    "Auction completed!" :
                    "No player currently on auction"
                  }
                </Typography>
                {auctionStatus === 'ready' && (
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={startAuction}
                    disabled={availablePlayers.length === 0}
                    sx={{ mt: 2 }}
                  >
                    Start Auction
                  </Button>
                )}
              </Box>
            )}
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Auction Progress
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {availablePlayers.length} players remaining • {soldPlayers.length} players processed
              </Typography>
              <LinearProgress 
                variant="determinate"
                value={(soldPlayers.length / (soldPlayers.length + availablePlayers.length)) * 100}
                sx={{ mt: 1 }}
              />
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Recent Activity</strong></TableCell>
                    <TableCell><strong>Team</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {soldPlayers.slice(-5).reverse().map((player) => (
                    <TableRow key={player._id}>
                      <TableCell>
                        {player.name}
                        <Chip 
                          size="small"
                          label={player.status === 'sold' ? 'SOLD' : 'UNSOLD'} 
                          color={player.status === 'sold' ? 'success' : 'error'}
                          sx={{ ml: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        {player.teamId ? teams.find(t => t._id === player.teamId)?.name : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {player.soldAmount ? `₹${player.soldAmount.toLocaleString()}` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {soldPlayers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
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
            
            {teams.map((team) => {
              const budgetPercentage = (team.remainingBudget / team.totalBudget) * 100;
              let budgetColor = 'success.main';
              if (budgetPercentage < 30) budgetColor = 'error.main';
              else if (budgetPercentage < 60) budgetColor = 'warning.main';
              
              return (
                <Box key={team._id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">
                      {team.name}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: budgetColor }}>
                      ₹{team.remainingBudget.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate"
                    value={budgetPercentage}
                    color={budgetPercentage < 30 ? 'error' : budgetPercentage < 60 ? 'warning' : 'success'}
                    sx={{ mt: 1, mb: 1, height: 8, borderRadius: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {team.players.length} players • ₹{(team.totalBudget - team.remainingBudget).toLocaleString()} spent
                  </Typography>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              );
            })}
          </Paper>
        </Grid>
      </Grid>
      
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Confirm Player Sale</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to sell {currentPlayer?.name} to {teams.find(t => t._id === selectedTeamId)?.name} for ₹{parseInt(bidAmount || '0').toLocaleString()}?
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
            {loading ? <CircularProgress size={24} /> : 'Confirm Sale'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAuctionView;