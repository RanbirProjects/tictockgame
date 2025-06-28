const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  board: {
    type: [[String]],
    default: [['', '', ''], ['', '', ''], ['', '', '']]
  },
  currentPlayer: {
    type: String,
    enum: ['X', 'O'],
    default: 'X'
  },
  winner: {
    type: String,
    enum: ['X', 'O', 'draw', null],
    default: null
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  gameType: {
    type: String,
    enum: ['single', 'multiplayer'],
    default: 'single'
  },
  moves: [{
    player: {
      type: String,
      enum: ['X', 'O']
    },
    position: {
      row: Number,
      col: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Method to check if game is won
gameSchema.methods.checkWinner = function() {
  const board = this.board;
  
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
      return board[i][0];
    }
  }
  
  // Check columns
  for (let i = 0; i < 3; i++) {
    if (board[0][i] && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
      return board[0][i];
    }
  }
  
  // Check diagonals
  if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
    return board[0][0];
  }
  
  if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
    return board[0][2];
  }
  
  // Check for draw
  const isDraw = board.every(row => row.every(cell => cell !== ''));
  return isDraw ? 'draw' : null;
};

// Method to make a move
gameSchema.methods.makeMove = function(row, col, player) {
  if (this.isComplete || this.board[row][col] !== '') {
    return false;
  }
  
  this.board[row][col] = player;
  this.moves.push({
    player,
    position: { row, col }
  });
  
  // Check for winner
  const winner = this.checkWinner();
  if (winner) {
    this.winner = winner;
    this.isComplete = true;
    this.completedAt = new Date();
  } else {
    // Switch players
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
  }
  
  return true;
};

module.exports = mongoose.model('Game', gameSchema); 