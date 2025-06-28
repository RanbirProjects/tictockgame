import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Slider,
  Card,
  CardContent
} from '@mui/material';
import {
  Close as CloseIcon,
  RadioButtonUnchecked as OIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  EmojiEvents as TrophyIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as MuteIcon,
  DarkMode as DarkIcon,
  LightMode as LightIcon,
  SmartToy as RobotIcon,
  Person as PersonIcon,
  Speed as SpeedIcon,
  Psychology as BrainIcon
} from '@mui/icons-material';

const SimpleGame = () => {
  // Game state
  const [board, setBoard] = useState([['', '', ''], ['', '', ''], ['', '', '']]);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [boardSize, setBoardSize] = useState(3);
  
  // Game modes and settings
  const [gameMode, setGameMode] = useState('pvp'); // 'pvp', 'ai'
  const [aiDifficulty, setAiDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  const [aiThinking, setAiThinking] = useState(false);
  
  // UI and theme
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  
  // Statistics and history
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [gameHistory, setGameHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Game features
  const [highlightWinningLine, setHighlightWinningLine] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [gameDuration, setGameDuration] = useState(0);

  // Initialize board based on size
  useEffect(() => {
    const newBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(''));
    setBoard(newBoard);
    setCurrentPlayer('X');
    setWinner(null);
    setGameOver(false);
    setHighlightWinningLine([]);
    setLastMove(null);
    setGameStartTime(Date.now());
  }, [boardSize]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameStartTime && !gameOver) {
      interval = setInterval(() => {
        setGameDuration(Math.floor((Date.now() - gameStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStartTime, gameOver]);

  // AI move effect
  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === 'O' && !gameOver && !aiThinking) {
      const timer = setTimeout(() => {
        makeAiMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameOver, aiThinking, gameMode]);

  const playSound = (type) => {
    if (!soundEnabled) return;
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'move':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        break;
      case 'win':
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
        break;
      case 'draw':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
        break;
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const checkWinner = useCallback((board) => {
    const size = board.length;
    
    // Check rows
    for (let i = 0; i < size; i++) {
      if (board[i][0] && board[i].every(cell => cell === board[i][0])) {
        return { winner: board[i][0], line: board[i].map((_, col) => [i, col]) };
      }
    }
    
    // Check columns
    for (let i = 0; i < size; i++) {
      if (board[0][i] && board.every(row => row[i] === board[0][i])) {
        return { winner: board[0][i], line: board.map((_, row) => [row, i]) };
      }
    }
    
    // Check diagonals
    if (board[0][0] && board.every((row, i) => row[i] === board[0][0])) {
      return { winner: board[0][0], line: board.map((_, i) => [i, i]) };
    }
    
    if (board[0][size-1] && board.every((row, i) => row[size-1-i] === board[0][size-1])) {
      return { winner: board[0][size-1], line: board.map((_, i) => [i, size-1-i]) };
    }
    
    // Check for draw
    const isDraw = board.every(row => row.every(cell => cell !== ''));
    return isDraw ? { winner: 'draw', line: [] } : null;
  }, []);

  const makeAiMove = () => {
    if (gameOver) return;
    
    setAiThinking(true);
    
    setTimeout(() => {
      const move = getAiMove();
      if (move) {
        handleCellClick(move.row, move.col);
      }
      setAiThinking(false);
    }, 300);
  };

  const getAiMove = () => {
    const emptyCells = [];
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board[i][j] === '') {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    
    if (emptyCells.length === 0) return null;
    
    switch (aiDifficulty) {
      case 'easy':
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
      case 'medium':
        // 50% chance of smart move, 50% random
        return Math.random() < 0.5 ? getSmartMove() : emptyCells[Math.floor(Math.random() * emptyCells.length)];
      case 'hard':
        return getSmartMove();
      default:
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
  };

  const getSmartMove = () => {
    // Try to win
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board[i][j] === '') {
          const testBoard = board.map(row => [...row]);
          testBoard[i][j] = 'O';
          const result = checkWinner(testBoard);
          if (result && result.winner === 'O') {
            return { row: i, col: j };
          }
        }
      }
    }
    
    // Block opponent's win
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board[i][j] === '') {
          const testBoard = board.map(row => [...row]);
          testBoard[i][j] = 'X';
          const result = checkWinner(testBoard);
          if (result && result.winner === 'X') {
            return { row: i, col: j };
          }
        }
      }
    }
    
    // Take center if available
    const center = Math.floor(boardSize / 2);
    if (board[center][center] === '') {
      return { row: center, col: center };
    }
    
    // Take corners
    const corners = [
      [0, 0], [0, boardSize-1], [boardSize-1, 0], [boardSize-1, boardSize-1]
    ];
    const availableCorners = corners.filter(([row, col]) => board[row][col] === '');
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Random move
    const emptyCells = [];
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board[i][j] === '') {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  const handleCellClick = (row, col) => {
    if (board[row][col] !== '' || gameOver || (gameMode === 'ai' && currentPlayer === 'O')) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    
    setBoard(newBoard);
    setLastMove({ row, col, player: currentPlayer });
    
    if (animationsEnabled) {
      playSound('move');
    }
    
    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult.winner);
      setGameOver(true);
      setHighlightWinningLine(gameResult.line);
      
      if (gameResult.winner === 'draw') {
        playSound('draw');
      } else {
        playSound('win');
      }
      
      // Update scores
      const newScores = { ...scores };
      if (gameResult.winner === 'draw') {
        newScores.draws++;
      } else {
        newScores[gameResult.winner]++;
      }
      setScores(newScores);
      
      // Add to history
      const historyEntry = {
        id: Date.now(),
        winner: gameResult.winner,
        duration: gameDuration,
        boardSize,
        gameMode,
        timestamp: new Date().toLocaleString(),
        moves: gameHistory.length + 1
      };
      setGameHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 games
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    const newBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(''));
    setBoard(newBoard);
    setCurrentPlayer('X');
    setWinner(null);
    setGameOver(false);
    setHighlightWinningLine([]);
    setLastMove(null);
    setGameStartTime(Date.now());
    setGameDuration(0);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
    setGameHistory([]);
  };

  const isWinningCell = (row, col) => {
    return highlightWinningLine.some(([r, c]) => r === row && c === col);
  };

  const isLastMove = (row, col) => {
    return lastMove && lastMove.row === row && lastMove.col === col;
  };

  const renderCell = (value, row, col) => {
    const isClickable = !gameOver && value === '';
    const isWinning = isWinningCell(row, col);
    const isLast = isLastMove(row, col);

    return (
      <Box
        sx={{
          width: boardSize === 3 ? 100 : boardSize === 4 ? 80 : 70,
          height: boardSize === 3 ? 100 : boardSize === 4 ? 80 : 70,
          border: '2px solid #1976d2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: boardSize === 3 ? '3rem' : boardSize === 4 ? '2.5rem' : '2rem',
          fontWeight: 'bold',
          cursor: isClickable ? 'pointer' : 'default',
          backgroundColor: isWinning 
            ? '#4caf50' 
            : isLast 
            ? '#ffeb3b' 
            : isClickable 
            ? '#e3f2fd' 
            : 'transparent',
          '&:hover': {
            backgroundColor: isClickable ? '#bbdefb' : 'transparent',
            transform: isClickable ? 'scale(1.05)' : 'none',
          },
          transition: animationsEnabled ? 'all 0.2s ease-in-out' : 'none',
          animation: isLast && animationsEnabled ? 'pulse 0.5s ease-in-out' : 'none',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
            '100%': { transform: 'scale(1)' }
          }
        }}
        onClick={() => handleCellClick(row, col)}
      >
        {value === 'X' && <CloseIcon sx={{ fontSize: 'inherit', color: '#f44336' }} />}
        {value === 'O' && <OIcon sx={{ fontSize: 'inherit', color: '#2196f3' }} />}
      </Box>
    );
  };

  const getGameStatus = () => {
    if (aiThinking) {
      return 'AI is thinking...';
    } else if (winner === 'draw') {
      return 'Game ended in a draw!';
    } else if (winner) {
      return `${winner} wins!`;
    } else {
      return `Current turn: ${currentPlayer} ${gameMode === 'ai' && currentPlayer === 'O' ? '(AI)' : ''}`;
    }
  };

  const getGameStatusColor = () => {
    if (aiThinking) return 'warning';
    if (winner === 'draw') return 'default';
    if (winner) return 'success';
    return 'info';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Game Header */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: darkMode ? '#424242' : 'white' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h3" sx={{ color: darkMode ? 'white' : 'inherit' }}>
            Tic-Tac-Toe
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Game History">
              <IconButton onClick={() => setShowHistory(true)}>
                <HistoryIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton onClick={() => setShowSettings(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
              <IconButton onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <LightIcon /> : <DarkIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={soundEnabled ? "Mute Sound" : "Enable Sound"}>
              <IconButton onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? <VolumeIcon /> : <MuteIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box display="flex" justifyContent="center" mb={2}>
          <Chip 
            icon={gameMode === 'ai' ? <RobotIcon /> : <PersonIcon />}
            label={gameMode === 'ai' ? 'vs AI' : 'vs Player'} 
            color="primary" 
            sx={{ mr: 1 }}
          />
          {gameMode === 'ai' && (
            <Chip 
              icon={<BrainIcon />}
              label={aiDifficulty} 
              color="secondary"
            />
          )}
        </Box>

        <Box display="flex" justifyContent="center">
          <Alert severity={getGameStatusColor()} sx={{ fontSize: '1.1rem' }}>
            {getGameStatus()}
          </Alert>
        </Box>
      </Paper>

      {/* Score Board */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: darkMode ? '#424242' : 'white' }}>
        <Box display="flex" justifyContent="space-around" alignItems="center">
          <Box textAlign="center">
            <Typography variant="h6" color="error">Player X</Typography>
            <Typography variant="h4">{scores.X}</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" color="info">Player O</Typography>
            <Typography variant="h4">{scores.O}</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" color="text.secondary">Draws</Typography>
            <Typography variant="h4">{scores.draws}</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" color="text.secondary">Time</Typography>
            <Typography variant="h4">{formatTime(gameDuration)}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Game Board */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: darkMode ? '#424242' : 'white' }}>
        <Box display="flex" justifyContent="center">
          <Grid container spacing={0} sx={{ width: 'fit-content' }}>
            {board.map((row, rowIndex) => (
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
      <Paper sx={{ p: 3, backgroundColor: darkMode ? '#424242' : 'white' }}>
        <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={resetGame}
            disabled={aiThinking}
          >
            New Game
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={resetScores}
          >
            Reset Scores
          </Button>
        </Box>
      </Paper>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Game Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Game Mode</InputLabel>
              <Select
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value)}
                label="Game Mode"
              >
                <MenuItem value="pvp">Player vs Player</MenuItem>
                <MenuItem value="ai">Player vs AI</MenuItem>
              </Select>
            </FormControl>
            
            {gameMode === 'ai' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>AI Difficulty</InputLabel>
                <Select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value)}
                  label="AI Difficulty"
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
            )}
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Board Size</InputLabel>
              <Select
                value={boardSize}
                onChange={(e) => setBoardSize(e.target.value)}
                label="Board Size"
              >
                <MenuItem value={3}>3x3</MenuItem>
                <MenuItem value={4}>4x4</MenuItem>
                <MenuItem value={5}>5x5</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={animationsEnabled}
                  onChange={(e) => setAnimationsEnabled(e.target.checked)}
                />
              }
              label="Enable Animations"
              sx={{ mb: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
              }
              label="Enable Sound Effects"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle>Game History</DialogTitle>
        <DialogContent>
          {gameHistory.length === 0 ? (
            <Typography>No games played yet.</Typography>
          ) : (
            <List>
              {gameHistory.map((game, index) => (
                <React.Fragment key={game.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          {game.winner === 'draw' ? (
                            <Typography>Draw</Typography>
                          ) : (
                            <>
                              <Typography>{game.winner} won</Typography>
                              <TrophyIcon color="primary" />
                            </>
                          )}
                        </Box>
                      }
                      secondary={`${game.boardSize}x${game.boardSize} board • ${game.gameMode} • ${formatTime(game.duration)} • ${game.timestamp}`}
                    />
                  </ListItem>
                  {index < gameHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Instructions */}
      <Paper sx={{ p: 3, mt: 3, backgroundColor: darkMode ? '#424242' : 'white' }}>
        <Typography variant="h6" gutterBottom sx={{ color: darkMode ? 'white' : 'inherit' }}>
          How to Play:
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: darkMode ? 'white' : 'inherit' }}>
          • Click on any empty cell to make your move
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: darkMode ? 'white' : 'inherit' }}>
          • Players take turns placing X and O
        </Typography>
        <Typography variant="body1" paragraph sx={{ color: darkMode ? 'white' : 'inherit' }}>
          • Get {boardSize} in a row (horizontally, vertically, or diagonally) to win
        </Typography>
        <Typography variant="body1" sx={{ color: darkMode ? 'white' : 'inherit' }}>
          • If all cells are filled without a winner, it's a draw
        </Typography>
      </Paper>
    </Container>
  );
};

export default SimpleGame; 