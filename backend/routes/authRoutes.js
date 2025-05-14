const express = require("express");
const User = require("../models/User");
const FacultyProfile = require("../models/FacultyProfile");
const { auth, checkRole } = require("../middleware/auth");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Register new faculty user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, department } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Validate department
    const validDepartments = [
      "Artificial Intelligence",
      "Computer Science",
      "Information Technology",
      "Data Science",
      "Electronics"
    ];

    if (!validDepartments.includes(department)) {
      return res.status(400).json({ msg: "Invalid department selected" });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password, // Will be hashed by pre-save middleware
      role: 'faculty',
      department
    });

    await newUser.save();

    // Generate token
    const token = newUser.generateAuthToken();

    // Return success response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false,
      msg: "Registration failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    console.log('Login attempt received:', JSON.stringify(req.body, null, 2));
    
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password || !role) {
      return res.status(400).json({ 
        success: false,
        msg: "Please provide username, password, and role"
      });
    }

    // Validate role
    if (!['admin', 'faculty', 'hod'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        msg: "Invalid role selected. Must be admin, faculty, or hod"
      });
    }

    // For admin and hod, check predefined credentials
    if (role === 'admin' || role === 'hod') {
      // For admin, use predefined credentials
      if (role === 'admin') {
        if (username !== 'admin' || password !== 'admin123') {
          return res.status(400).json({ 
            success: false,
            msg: "Invalid admin credentials"
          });
        }

        // Create admin token with consistent payload
        const adminPayload = { 
          id: 'admin',
          username: 'admin',
          role: 'admin',
          department: 'Administration'
        };

        const token = jwt.sign(
          adminPayload,
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
        );

        return res.json({
          success: true,
          token,
          user: adminPayload,
          redirectTo: '/admin-dashboard'
        });
      }

      // For HOD, use simple credentials
      if (role === 'hod') {
        if (username !== 'hod1' || password !== 'hod123') {
          return res.status(400).json({ 
            success: false,
            msg: "Invalid HOD credentials"
          });
        }

        // Create token with proper payload
        const token = jwt.sign(
          { 
            id: 'hod1',
            username: 'hod1',
            role: 'hod',
            department: 'Computer Science' // Add specific department
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Return response with token and user data
        return res.json({
          success: true,
          token,
          user: {
            id: 'hod1',
            username: 'hod1',
            role: 'hod',
            department: 'Computer Science',
            hasProfile: true
          },
          redirectTo: '/hod-dashboard'
        });
      }
    }

    // For faculty, proceed with normal login
    const user = await User.findOne({ username }).select('+password');
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        msg: "Invalid username or password" 
      });
    }

    // Check if the role matches
    if (user.role !== role) {
      return res.status(400).json({ 
        success: false,
        msg: "Invalid role for this user" 
      });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        msg: "Invalid username or password" 
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Check if profile exists
    const profile = await FacultyProfile.findOne({ userId: user._id });
    const hasProfile = !!profile;

    const token = user.generateAuthToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        hasProfile
      },
      redirectTo: hasProfile ? '/dashboard' : '/complete-profile'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      msg: "Server error", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        msg: "Please provide your email address" 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        msg: "No account found with this email address" 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true,
      msg: "Password reset email sent successfully" 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ 
      success: false,
      msg: "Error sending password reset email",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// Reset password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        success: false,
        msg: "Please provide a new password" 
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        msg: "Invalid or expired password reset token" 
      });
    }

    // Update password and clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Successful",
      html: `
        <h2>Password Reset Successful</h2>
        <p>Your password has been successfully reset.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true,
      msg: "Password has been reset successfully" 
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ 
      success: false,
      msg: "Error resetting password",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
