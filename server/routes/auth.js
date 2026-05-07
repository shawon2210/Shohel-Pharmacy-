const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Mock user for mock mode
const MOCK_USER = {
  _id: 'mock_user_123',
  username: 'admin',
  email: 'admin@shohelpharmacy.com',
  fullName: 'Shohel Admin',
  role: 'admin',
  isActive: true,
  passwordHash: bcrypt.hashSync('admin123', 10) // Pre-hashed password
};

// Middleware to handle mock mode
const mockModeCheck = (req, res, next) => {
  if (global.mockMode) {
    // For verify endpoint
    if (req.path === '/verify') {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token === 'mock_token_123') {
        return res.json({
          user: {
            id: MOCK_USER._id,
            username: MOCK_USER.username,
            email: MOCK_USER.email,
            fullName: MOCK_USER.fullName,
            role: MOCK_USER.role
          }
        });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
  next();
};

router.use(mockModeCheck);

const User = require('../models/User');

// Login
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, password } = req.body;
    
    // MOCK MODE: Accept admin/admin123
    if (global.mockMode) {
      console.log('🔧 Mock mode: Checking credentials', { username });
      if (username === 'admin' && password === 'admin123') {
        const token = 'mock_token_123';
        console.log('✅ Mock login successful');
        return res.json({
          token,
          user: {
            id: MOCK_USER._id,
            username: MOCK_USER.username,
            email: MOCK_USER.email,
            fullName: MOCK_USER.fullName,
            role: MOCK_USER.role
          }
        });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }
    
    // REAL MODE: Find user in database
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }],
      isActive: true 
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register (for adding new users)
router.post('/register', [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('fullName').notEmpty().withMessage('Full name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { username, email, password, fullName, role = 'staff', phone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      fullName,
      role,
      phone
    });
    
    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        username: newUser.username, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;