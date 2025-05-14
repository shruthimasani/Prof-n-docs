const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle admin and HOD authentication separately
    if (decoded.role === 'admin' || decoded.role === 'hod') {
      // For admin and HOD, we don't need to check the database since they're static users
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        department: decoded.department
      };
      req.token = token;
      return next();
    }

    // For other users, check in database
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(401).json({ msg: "Token is not valid" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Role-based access control middleware
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: "Access denied. You don't have permission to perform this action." 
      });
    }
    next();
  };
};

module.exports = { auth, checkRole }; 