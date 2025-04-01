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
import { auctionService } from '@/services/auction-service';
import { ApiPlayer } from '@/types/player';

interface Team {
  _id: string;
  name: string;
  totalBudget: number;
  remainingBudget: number;
  players: ApiPlayer[];
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

const AdminAuctionView = () => {
  // Event ID for API calls
  const [eventId, setEventId] = useState<string>('67daf7232fef49cb95788d77');
  
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [soldPlayers, setSoldPlayers] = useState<ApiPlayer[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<ApiPlayer | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [auctionStatus, setAuctionStatus] = useState<'ready' | 'active' | 'paused' | 'completed'>('ready');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [processedPlayerCount, setProcessedPlayerCount] = useState<number>(0);

  const startAuction = async () => {
    if (!eventId) {
      setError('No event ID provided');
      return;
    }
    
    setLoading(true);
    try {
      const randomPlayer = await auctionService.getRandomPlayer(eventId);
      
      setCurrentPlayer(randomPlayer);
      setBidAmount(randomPlayer.basePrice?.toString() || '50000');
      setAuctionStatus('active');
      setError('');
      setSuccess('Auction started');
    } catch (err) {
      console.error('Error starting auction:', err);
      setError('Failed to start auction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pauseAuction = () => {
    setAuctionStatus('paused');
    setSuccess('Auction paused');
  };

  const resumeAuction = () => {
    setAuctionStatus('active');
    setSuccess('Auction resumed');
  };

  const nextPlayer = async () => {
    if (!eventId) {
      setError('No event ID provided');
      return;
    }

    setLoading(true);
    try {
      const randomPlayer = await auctionService.getRandomPlayer(eventId);
      
      setCurrentPlayer(randomPlayer);
      setBidAmount(randomPlayer.basePrice?.toString() || '50000');
      setSelectedTeamId('');
      setError('');
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setSuccess(`Next player: ${randomPlayer.firstName} ${randomPlayer.lastName}`);
    } catch (err) {
      console.error('Error fetching next player:', err);
      setError('Failed to fetch next player. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const restartAuction = () => {
    setTeams(mockTeams);
    setSoldPlayers([]);
    setCurrentPlayer(null);
    setCurrentPlayerIndex(0);
    setProcessedPlayerCount(0);
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

  const handleSellPlayer = async () => {
    if (!currentPlayer || !selectedTeamId) return;

    setLoading(true);
    
    try {
      const amount = parseInt(bidAmount);
      
      const updatedPlayer = {
        ...currentPlayer,
        soldStatus: 'sold' as const,
        teamId: selectedTeamId,
        soldAmount: amount
      };
      
      // Update teams data
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
      
      setTeams(updatedTeams);
      setSoldPlayers([...soldPlayers, updatedPlayer]);
      setCurrentPlayer(null);
      setProcessedPlayerCount(prev => prev + 1);
      setSuccess(`${updatedPlayer.firstName} ${updatedPlayer.lastName} sold to ${teams.find(t => t._id === selectedTeamId)?.name} for ₹${amount.toLocaleString()}`);
      
      setBidAmount('');
      setSelectedTeamId('');
      
      if (auctionStatus === 'active') {
        setTimeout(() => {
          nextPlayer();
        }, 1500);
      }
    } catch (err) {
      console.error('Error selling player:', err);
      setError('Failed to process player sale');
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleMarkUnsold = async () => {
    if (!currentPlayer) return;

    setLoading(true);
    
    try {
      const updatedPlayer = {
        ...currentPlayer,
        soldStatus: 'unsold' as const
      };
      
      setSoldPlayers([...soldPlayers, updatedPlayer]);
      setCurrentPlayer(null);
      setProcessedPlayerCount(prev => prev + 1);
      setSuccess(`${updatedPlayer.firstName} ${updatedPlayer.lastName} marked as unsold`);
      
      setBidAmount('');
      setSelectedTeamId('');
      
      if (auctionStatus === 'active') {
        setTimeout(() => {
          nextPlayer();
        }, 1500);
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
            disabled={loading}
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
            disabled={loading}
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
                          inputProps: { min: currentPlayer.basePrice || 50000 }
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
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    Start Auction
                  </Button>
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
                value={processedPlayerCount ? (processedPlayerCount / (processedPlayerCount + 1)) * 100 : 0}
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
                        {`${player.firstName} ${player.lastName}`}
                        <Chip 
                          size="small"
                          label={player.soldStatus === 'sold' ? 'SOLD' : 'UNSOLD'} 
                          color={player.soldStatus === 'sold' ? 'success' : 'error'}
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
            Are you sure you want to sell {currentPlayer ? `${currentPlayer.firstName} ${currentPlayer.lastName}` : ''} to {teams.find(t => t._id === selectedTeamId)?.name} for ₹{parseInt(bidAmount || '0').toLocaleString()}?
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