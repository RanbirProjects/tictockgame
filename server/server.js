const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple in-memory database for development
const inMemoryDB = {
  users: [],
  games: [],
  nextUserId: 1,
  nextGameId: 1
};

// Connect to MongoDB with fallback
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
  // Set flag to use MongoDB
  app.locals.useMongoDB = true;
})
.catch(err => {
  console.log('MongoDB connection failed, using in-memory database');
  console.log('Error:', err.message);
  // Set flag to use in-memory database
  app.locals.useMongoDB = false;
  app.locals.inMemoryDB = inMemoryDB;
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Tic-Tac-Toe API is running!',
    database: app.locals.useMongoDB ? 'MongoDB' : 'In-Memory'
  });
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${app.locals.useMongoDB ? 'MongoDB' : 'In-Memory'}`);
}); 