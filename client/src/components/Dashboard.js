import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as StatsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { games, loading, error, createGame, getGames, deleteGame, clearError } = useGame();
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [gameType, setGameType] = useState('single');

  useEffect(() => {
    getGames();
  }, [getGames]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleCreateGame = async () => {
    const result = await createGame(gameType);
    if (result.success) {
      setCreateDialogOpen(false);
      navigate(`/game/${result.game._id}`);
    }
  };

  const handleJoinGame = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  const handleDeleteGame = async (gameId) => {
    await deleteGame(gameId);
  };

  const getGameStatus = (game) => {
    if (game.isComplete) {
      if (game.winner === 'draw') return 'Draw';
      return `${game.winner} Wins`;
    }
    return 'In Progress';
  };

  const getGameStatusColor = (game) => {
    if (game.isComplete) {
      if (game.winner === 'draw') return 'default';
      return 'success';
    }
    return 'warning';
  };

  const getWinRate = () => {
    if (!user?.stats?.gamesPlayed) return 0;
    return Math.round((user.stats.gamesWon / user.stats.gamesPlayed) * 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ready to play some Tic-Tac-Toe?
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <StatsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Games Played</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {user?.stats?.gamesPlayed || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrophyIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Wins</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {user?.stats?.gamesWon || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Losses</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {user?.stats?.gamesLost || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <StatsIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Win Rate</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {getWinRate()}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Game Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Your Games</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            New Game
          </Button>
        </Box>

        {games.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
            No games yet. Create your first game to get started!
          </Typography>
        ) : (
          <List>
            {games.map((game) => (
              <ListItem key={game._id} divider>
                <ListItemText
                  primary={`Game #${game._id.slice(-6)}`}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {game.gameType === 'single' ? 'Single Player' : 'Multiplayer'}
                        {game.player2 && ` • ${game.player2.username}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(game.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={getGameStatus(game)}
                      color={getGameStatusColor(game)}
                      size="small"
                    />
                    {!game.isComplete && (
                      <IconButton
                        color="primary"
                        onClick={() => handleJoinGame(game._id)}
                      >
                        <PlayIcon />
                      </IconButton>
                    )}
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteGame(game._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Create Game Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Game</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Choose the type of game you want to create:
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant={gameType === 'single' ? 'contained' : 'outlined'}
              onClick={() => setGameType('single')}
              fullWidth
            >
              Single Player
            </Button>
            <Button
              variant={gameType === 'multiplayer' ? 'contained' : 'outlined'}
              onClick={() => setGameType('multiplayer')}
              fullWidth
            >
              Multiplayer
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateGame} variant="contained">
            Create Game
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 