const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// In-memory user storage for fallback
const inMemoryUsers = [];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if using MongoDB or in-memory
    if (req.app.locals.useMongoDB) {
      // MongoDB logic
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) {
        return res.status(400).json({ 
          message: 'User with this email or username already exists' 
        });
      }

      user = new User({
        username,
        email,
        password
      });

      await user.save();

      const payload = { userId: user._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          stats: user.stats
        }
      });
    } else {
      // In-memory logic
      const existingUser = inMemoryUsers.find(u => u.email === email || u.username === username);
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this email or username already exists' 
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password: hashedPassword,
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          gamesLost: 0,
          gamesDrawn: 0
        },
        createdAt: new Date()
      };

      inMemoryUsers.push(newUser);

      const payload = { userId: newUser.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          stats: newUser.stats
        }
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    if (req.app.locals.useMongoDB) {
      // MongoDB logic
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const payload = { userId: user._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          stats: user.stats
        }
      });
    } else {
      // In-memory logic
      const user = inMemoryUsers.find(u => u.email === email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const payload = { userId: user.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          stats: user.stats
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    if (req.app.locals.useMongoDB) {
      const user = await User.findById(req.user._id).select('-password');
      res.json(user);
    } else {
      const user = inMemoryUsers.find(u => u.id === req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('username')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email } = req.body;

    if (req.app.locals.useMongoDB) {
      // MongoDB logic
      const updateFields = {};
      if (username) updateFields.username = username;
      if (email) updateFields.email = email;

      if (username || email) {
        const existingUser = await User.findOne({
          $or: [
            { email: email || req.user.email },
            { username: username || req.user.username }
          ],
          _id: { $ne: req.user._id }
        });

        if (existingUser) {
          return res.status(400).json({ 
            message: 'Username or email already exists' 
          });
        }
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updateFields,
        { new: true }
      ).select('-password');

      res.json(user);
    } else {
      // In-memory logic
      const userIndex = inMemoryUsers.findIndex(u => u.id === req.user.id);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (username || email) {
        const existingUser = inMemoryUsers.find(u => 
          (email && u.email === email) || (username && u.username === username)
        );

        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(400).json({ 
            message: 'Username or email already exists' 
          });
        }
      }

      if (username) inMemoryUsers[userIndex].username = username;
      if (email) inMemoryUsers[userIndex].email = email;

      const { password, ...userWithoutPassword } = inMemoryUsers[userIndex];
      res.json(userWithoutPassword);
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 