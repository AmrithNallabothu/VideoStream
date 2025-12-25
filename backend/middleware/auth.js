const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Set token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Make sure token exists
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no token provided' 
      });
    }

    try {
      // 3. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 4. Get user from the database using the ID in the token
      // We exclude the password for security
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'User no longer exists' 
        });
      }

      // 5. Move to the next middleware/controller
      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({ 
        success: false,
        message: 'Token is invalid or has expired' 
      });
    }
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error in Auth Middleware',
      error: error.message 
    });
  }
};