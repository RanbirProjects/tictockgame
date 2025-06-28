import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Close as CloseIcon,
  RadioButtonUnchecked as OIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';

const Game = () => {
  const { gameId } = useParams();
  const { user } = useAuth();
  const { currentGame, loading, error, getGame, makeMove, joinGame, clearError } = useGame();
  const navigate = useNavigate();
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  useEffect(() => {
    if (gameId) {
      getGame(gameId);
    }
  }, [gameId, getGame]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (currentGame && currentGame.gameType === 'multiplayer' && !currentGame.player2) {
      setShowJoinDialog(true);
    }
  }, [currentGame]);

  const handleCellClick = async (row, col) => {
    if (!currentGame || currentGame.isComplete) return;

    // Check if it's the user's turn
    const isPlayer1 = currentGame.player1._id === user.id;
    const isPlayer2 = currentGame.player2 && currentGame.player2._id === user.id;
    
    if (!isPlayer1 && !isPlayer2) return;

    const playerSymbol = isPlayer1 ? 'X' : 'O';
    if (currentGame.currentPlayer !== playerSymbol) return;

    // Check if cell is empty
    if (currentGame.board[row][col] !== '') return;

    await makeMove(gameId, row, col);
  };

  const handleJoinGame = async () => {
    const result = await joinGame(gameId);
    if (result.success) {
      setShowJoinDialog(false);
    }
  };

  const handleNewGame = () => {
    navigate('/dashboard');
  };

  const getPlayerSymbol = () => {
    if (!currentGame || !user) return null;
    
    if (currentGame.player1._id === user.id) return 'X';
    if (currentGame.player2 && currentGame.player2._id === user.id) return 'O';
    return null;
  };

  const getCurrentPlayerName = () => {
    if (!currentGame) return '';
    
    if (currentGame.currentPlayer === 'X') {
      return currentGame.player1.username;
    } else if (currentGame.player2) {
      return currentGame.player2.username;
    }
    return 'Waiting for player...';
  };

  const getGameStatus = () => {
    if (!currentGame) return '';
    
    if (currentGame.isComplete) {
      if (currentGame.winner === 'draw') {
        return 'Game ended in a draw!';
      }
      return `${currentGame.winner} wins!`;
    }
    
    return `Current turn: ${getCurrentPlayerName()}`;
  };

  const getGameStatusColor = () => {
    if (!currentGame) return 'info';
    
    if (currentGame.isComplete) {
      if (currentGame.winner === 'draw') return 'default';
      return 'success';
    }
    return 'info';
  };

  const renderCell = (value, row, col) => {
    const isClickable = !currentGame?.isComplete && value === '';
    const playerSymbol = getPlayerSymbol();
    const isMyTurn = currentGame?.currentPlayer === playerSymbol;

    return (
      <Box
        sx={{
          width: 100,
          height: 100,
          border: '2px solid #1976d2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          fontWeight: 'bold',
          cursor: isClickable && isMyTurn ? 'pointer' : 'default',
          backgroundColor: isClickable && isMyTurn ? '#e3f2fd' : 'transparent',
          '&:hover': {
            backgroundColor: isClickable && isMyTurn ? '#bbdefb' : 'transparent',
          },
          transition: 'background-color 0.2s',
        }}
        onClick={() => handleCellClick(row, col)}
      >
        {value === 'X' && <CloseIcon sx={{ fontSize: '3rem', color: '#f44336' }} />}
        {value === 'O' && <OIcon sx={{ fontSize: '3rem', color: '#2196f3' }} />}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentGame) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">Game not found</Alert>
        <Button
          variant="contained"
          startIcon={<BackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Game Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">
            Tic-Tac-Toe
          </Typography>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="text.secondary">
            {currentGame.gameType === 'single' ? 'Single Player' : 'Multiplayer'}
          </Typography>
          <Chip
            label={getGameStatus()}
            color={getGameStatusColor()}
            variant="outlined"
          />
        </Box>

        {/* Player Info */}
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Player X: {currentGame.player1.username}
            </Typography>
            {currentGame.player2 && (
              <Typography variant="body2" color="text.secondary">
                Player O: {currentGame.player2.username}
              </Typography>
            )}
          </Box>
          {getPlayerSymbol() && (
            <Chip
              label={`You are: ${getPlayerSymbol()}`}
              color="primary"
              size="small"
            />
          )}
        </Box>
      </Paper>

      {/* Game Board */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="center">
          <Grid container spacing={0} sx={{ width: 'fit-content' }}>
            {currentGame.board.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <Grid item key={`${rowIndex}-${colIndex}`}>
                  {renderCell(cell, rowIndex, colIndex)}
                </Grid>
              ))
            ))}
          </Grid>
        </Box>
      </Paper>

      {/* Game Actions */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleNewGame}
          >
            New Game
          </Button>
        </Box>
      </Paper>

      {/* Join Game Dialog */}
      <Dialog open={showJoinDialog} onClose={() => setShowJoinDialog(false)}>
        <DialogTitle>Join Multiplayer Game</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {currentGame?.player1?.username} has created a multiplayer game. 
            Would you like to join as Player O?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJoinDialog(false)}>Cancel</Button>
          <Button onClick={handleJoinGame} variant="contained">
            Join Game
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Game; 