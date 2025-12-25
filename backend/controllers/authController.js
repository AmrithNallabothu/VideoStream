const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error("WARNING: JWT_SECRET is not defined in .env file");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Password hashing is handled by the pre-save hook in User.js
    const user = await User.create({
      username,
      email,
      password,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Server Error during registration' });
  }
};

// @desc    Authenticate a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Explicitly select password because it is hidden in the model
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server Error during login' });
  }
};

// @desc    Get current user data
exports.getMe = async (req, res) => {
  try {
    // req.user is populated by the protect middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ message: 'Server Error fetching user data' });
  }
};