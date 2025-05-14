const express = require('express');
const router = express.Router();
const FacultyProfile = require('../models/FacultyProfile');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Validate file types
    if (file.fieldname === 'resume') {
      if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
        return cb(new Error('Please upload a valid document file'));
      }
    } else {
      if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
        return cb(new Error('Please upload a valid image or PDF file'));
      }
    }
    cb(null, true);
  }
});

// Create faculty profile route
router.post('/profile', 
  auth, // Authentication middleware
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('Received profile creation request:', req.body);

      // Get user ID from auth middleware
      const userId = req.user._id;

      // Check if profile already exists
      const existingProfile = await FacultyProfile.findOne({ userId });
      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: 'Profile already exists for this user'
        });
      }

      // Parse educational qualifications
      let educationalQualifications;
      try {
        educationalQualifications = JSON.parse(req.body.educationalQualifications);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid educational qualifications format'
        });
      }

      // Create document paths object
      const documents = {};
      if (req.files) {
        Object.keys(req.files).forEach(key => {
          documents[key] = req.files[key][0].path;
        });
      }

      // Create new profile
      const newProfile = new FacultyProfile({
        userId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dateOfBirth: new Date(req.body.dateOfBirth),
        gender: req.body.gender,
        contact: req.body.contact,
        designation: req.body.designation,
        joiningDate: new Date(req.body.joiningDate),
        experience: Number(req.body.experience),
        educationalQualifications,
        documents
      });

      // Save profile to database
      await newProfile.save();

      // Send success response
      res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        profile: newProfile
      });

    } catch (error) {
      console.error('Profile creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router; 