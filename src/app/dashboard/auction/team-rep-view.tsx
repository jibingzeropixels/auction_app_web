import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import PlayerTradingCard from '@/components/PlayerTradingCard';
import { useAuth } from '@/context/auth-context';
import { auctionService } from '@/services/auction-service';
import { ApiPlayer } from '@/types/player';

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

const TeamRepAuctionView = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [eventId, setEventId] = useState<string>('');
  const [auctionId, setAuctionId] = useState<string>('');
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [soldPlayers, setSoldPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<ApiPlayer | null>(null);
  const [auctionStatus, setAuctionStatus] = useState<'ready' | 'active' | 'paused' | 'completed'>('active');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const userTeam = teams.find(team => team._id === user?.teamId) || teams[0];
  
  useEffect(() => {
    const urlAuctionId = searchParams.get('auctionId');
    const urlEventId = searchParams.get('eventId') || '67daf7232fef49cb95788d77'; 
    
    if (urlAuctionId) {
      setAuctionId(urlAuctionId);
    } else {
      setError('No auction ID provided in the URL');
    }
    
    setEventId(urlEventId);
    
    const pollInterval = setInterval(async () => {
      if (urlEventId) {
        try {
          setLoading(true);
          const player = await auctionService.getRandomPlayer(urlEventId);
          setCurrentPlayer(player);
        } catch (err) {
          console.error('Error fetching current player:', err);
        } finally {
          setLoading(false);
        }
      }
    }, 5000); // Poll every 5 seconds
    
    if (urlEventId) {
      const fetchCurrentPlayer = async () => {
        try {
          setLoading(true);
          const player = await auctionService.getRandomPlayer(urlEventId);
          setCurrentPlayer(player);
        } catch (err) {
          console.error('Error fetching current player:', err);
          setError('Failed to load current player');
        } finally {
          setLoading(false);
        }
      };
      
      fetchCurrentPlayer();
    }
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [searchParams]);
  
  const calculateMaxBid = () => {
    const remainingPlayersNeeded = 15 - userTeam.players.length;
    
    if (remainingPlayersNeeded <= 1) {
      return userTeam.remainingBudget;
    } else {
      const reserveBudget = 50000 * (remainingPlayersNeeded - 1); 
      const maxBid = userTeam.remainingBudget - reserveBudget;
      
      return Math.max(maxBid, 0); 
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Live Auction
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body1">
          Auction Status:
        </Typography>
        <Chip 
          label={auctionStatus.toUpperCase()} 
          color={
            auctionStatus === 'ready' ? 'default' : 
            auctionStatus === 'active' ? 'success' : 
            auctionStatus === 'paused' ? 'warning' : 
            'error'
          }
          variant="outlined"
        />
        
        {auctionStatus === 'paused' && (
          <Typography variant="body2" color="text.secondary">
            The auction is currently paused. Please wait for it to resume.
          </Typography>
        )}
        
        {auctionStatus === 'completed' && (
          <Typography variant="body2" color="text.secondary">
            The auction has concluded. Thank you for participating.
          </Typography>
        )}
        
        {error && (
          <Chip 
            label={error}
            color="error"
            variant="outlined"
            sx={{ ml: 'auto' }}
          />
        )}
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
                  <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <PlayerTradingCard player={currentPlayer} />
                  </Grid>
                  
                  <Grid item xs={12} md={7}>
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: 'primary.main', 
                      color: 'white', 
                      borderRadius: 4,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #1976d2, #0d47a1)'
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Your Bidding Limit
                      </Typography>
                      <Typography variant="h2" sx={{ 
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        letterSpacing: '-0.5px'
                      }}>
                        ₹{calculateMaxBid().toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                        This is the maximum amount you can bid for this player based on your remaining budget and squad needs.
                      </Typography>
                      
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        fontSize: '1.8rem', 
                        opacity: 0.2,
                        transform: 'rotate(15deg)'
                      }}>
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
                  textAlign: 'center',
                  border: '1px dashed #ccc',
                  borderRadius: 1
                }}
              >
                <Typography variant="body1" gutterBottom>
                  {auctionStatus === 'ready' ? 
                    "Waiting for the auction to start" : 
                    auctionStatus === 'completed' ?
                    "Auction completed!" :
                    "No player currently on auction"
                  }
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
                    <TableCell><strong>Player</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Team</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
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
                        {player.status === 'unsold' ? (
                          <Chip size="small" label="UNSOLD" color="error" />
                        ) : (
                          player.teamId ? teams.find(t => t._id === player.teamId)?.name : '-'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {player.soldAmount ? `₹${player.soldAmount.toLocaleString()}` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {soldPlayers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
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
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Team Status
            </Typography>
            
            <Typography variant="h5" sx={{ color: 'primary.main', mt: 2 }}>
              {userTeam.name}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Budget
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">Remaining:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  ₹{userTeam.remainingBudget.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">Total:</Typography>
                <Typography variant="body1">
                  ₹{userTeam.totalBudget.toLocaleString()}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate"
                value={(userTeam.remainingBudget / userTeam.totalBudget) * 100}
                sx={{ mt: 2, mb: 1, height: 8, borderRadius: 1 }}
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Maximum Possible Bid
              </Typography>
              <Typography variant="h4" sx={{ color: 'success.main' }}>
                ₹{calculateMaxBid().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This is the maximum amount you can bid for a player
              </Typography>
              
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Squad Size:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {userTeam.players.length}/15
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Remaining Spots:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {15 - userTeam.players.length}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate"
                  value={(userTeam.players.length / 15) * 100}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Your Squad (Players: {userTeam.players.length})
              </Typography>
              
              {userTeam.players.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                  You haven't acquired any players yet
                </Typography>
              ) : (
                userTeam.players.map(player => (
                  <Box key={player._id} sx={{ mb: 1 }}>
                    <Typography variant="body1">
                      {player.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        {player.category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ₹{player.soldAmount?.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeamRepAuctionView;