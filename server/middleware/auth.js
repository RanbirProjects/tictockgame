const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (req.app.locals.useMongoDB) {
      // MongoDB logic
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'Token is not valid' });
      }
      
      req.user = user;
    } else {
      // In-memory logic
      const inMemoryUsers = req.app.locals.inMemoryDB.users;
      const user = inMemoryUsers.find(u => u.id === decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'Token is not valid' });
      }
      
      req.user = user;
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth; 