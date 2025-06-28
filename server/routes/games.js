const express = require('express');
const Game = require('../models/Game');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/games
// @desc    Create a new game
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { gameType = 'single' } = req.body;
    
    const game = new Game({
      player1: req.user._id,
      gameType
    });
    
    await game.save();
    
    res.json(game);
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games
// @desc    Get user's games
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const games = await Game.find({
      $or: [{ player1: req.user._id }, { player2: req.user._id }]
    })
    .populate('player1', 'username')
    .populate('player2', 'username')
    .sort({ createdAt: -1 })
    .limit(20);
    
    res.json(games);
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/:id
// @desc    Get a specific game
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('player1', 'username')
      .populate('player2', 'username');
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Check if user is part of this game
    if (game.player1._id.toString() !== req.user._id.toString() && 
        (!game.player2 || game.player2._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(game);
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/games/:id/move
// @desc    Make a move in the game
// @access  Private
router.put('/:id/move', auth, async (req, res) => {
  try {
    const { row, col } = req.body;
    
    if (row === undefined || col === undefined || row < 0 || row > 2 || col < 0 || col > 2) {
      return res.status(400).json({ message: 'Invalid move position' });
    }
    
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Check if user is part of this game
    if (game.player1.toString() !== req.user._id.toString() && 
        (!game.player2 || game.player2.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Determine player symbol
    let playerSymbol;
    if (game.player1.toString() === req.user._id.toString()) {
      playerSymbol = 'X';
    } else if (game.player2 && game.player2.toString() === req.user._id.toString()) {
      playerSymbol = 'O';
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if it's the user's turn
    if (game.currentPlayer !== playerSymbol) {
      return res.status(400).json({ message: 'Not your turn' });
    }
    
    // Make the move
    const moveSuccess = game.makeMove(row, col, playerSymbol);
    
    if (!moveSuccess) {
      return res.status(400).json({ message: 'Invalid move' });
    }
    
    await game.save();
    
    // Update user stats if game is complete
    if (game.isComplete && game.winner !== 'draw') {
      const player1 = await User.findById(game.player1);
      const player2 = game.player2 ? await User.findById(game.player2) : null;
      
      if (game.winner === 'X') {
        await player1.updateStats('win');
        if (player2) await player2.updateStats('loss');
      } else if (game.winner === 'O') {
        if (player2) await player2.updateStats('win');
        await player1.updateStats('loss');
      }
    } else if (game.isComplete && game.winner === 'draw') {
      const player1 = await User.findById(game.player1);
      const player2 = game.player2 ? await User.findById(game.player2) : null;
      
      await player1.updateStats('draw');
      if (player2) await player2.updateStats('draw');
    }
    
    // Populate player info for response
    await game.populate('player1', 'username');
    if (game.player2) await game.populate('player2', 'username');
    
    res.json(game);
  } catch (error) {
    console.error('Make move error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/games/:id/join
// @desc    Join a multiplayer game
// @access  Private
router.put('/:id/join', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    if (game.gameType !== 'multiplayer') {
      return res.status(400).json({ message: 'This is not a multiplayer game' });
    }
    
    if (game.player2) {
      return res.status(400).json({ message: 'Game is full' });
    }
    
    if (game.player1.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot join your own game' });
    }
    
    game.player2 = req.user._id;
    await game.save();
    
    await game.populate('player1', 'username');
    await game.populate('player2', 'username');
    
    res.json(game);
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/games/:id
// @desc    Delete a game
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Check if user is the creator of the game
    if (game.player1.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Game.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Game deleted' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 