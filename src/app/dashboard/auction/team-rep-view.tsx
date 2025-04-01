import { useState, useEffect } from 'react';
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
  }
];

const TeamRepAuctionView = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [soldPlayers, setSoldPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [auctionStatus, setAuctionStatus] = useState<'ready' | 'active' | 'paused' | 'completed'>('active');
  
  const userTeam = teams.find(team => team._id === user?.teamId) || teams[0]; 
  
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
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && mockPlayers.length > 0) {
        const randomIndex = Math.floor(Math.random() * mockPlayers.length);
        const player = mockPlayers[randomIndex];
        
        const soldAmount = player.basePrice + Math.floor(Math.random() * player.basePrice);
        
        const teamIndex = Math.floor(Math.random() * teams.length);
        const team = teams[teamIndex];
        
        const updatedPlayer = {
          ...player,
          status: Math.random() > 0.2 ? 'sold' as const : 'unsold' as const,
          teamId: Math.random() > 0.2 ? team._id : undefined,
          soldAmount: Math.random() > 0.2 ? soldAmount : undefined
        };
        
        setSoldPlayers(prev => [updatedPlayer, ...prev]);
        setCurrentPlayer(null);
      } else if (Math.random() > 0.5 && mockPlayers.length > 0) {
        const randomIndex = Math.floor(Math.random() * mockPlayers.length);
        setCurrentPlayer(mockPlayers[randomIndex]);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [teams]);
  
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
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>

        <Paper sx={{ p: 3, mb: 3 }}>
        {currentPlayer ? (
            <>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, borderBottom: '2px solid #f0f0f0', pb: 1 }}>
                Currently Bidding
            </Typography>
            
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
                    
                    {/* Decorative elements */}
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
            </>
        ) : (
            <Box sx={{ 
            textAlign: 'center', 
            py: 5, 
            px: 3,
            background: 'linear-gradient(to bottom, #f9f9f9, #f5f5f5)',
            borderRadius: 4,
            border: '1px dashed #ccc'
            }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'text.secondary' }}>
                Waiting for next player...
            </Typography>
            <CircularProgress sx={{ mt: 2, color: 'primary.main' }} />
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