const express = require('express');
const router = express.Router();
const FacultyProfile = require('../models/FacultyProfile');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, checkRole } = require('../middleware/auth');
const User = require('../models/User');
const cors = require('cors');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Only JPEG, PNG and PDF are allowed.'));
    }
    cb(null, true);
  }
});

// @route   GET /api/faculty
// @desc    Get all faculty profiles
router.get('/', auth, async (req, res) => {
  try {
    const profiles = await FacultyProfile.find();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profiles', error: error.message });
  }
});

// @route   GET /api/faculty/:id
// @desc    Get single faculty profile
router.get('/:id', auth, async (req, res) => {
  try {
    const profile = await FacultyProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// @route   POST /api/faculty/profile
// @desc    Create new faculty profile
router.post('/profile', 
  auth,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 },
    { name: 'pan', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('Profile creation request received');
      console.log('User:', req.user);
      console.log('Body:', req.body);
      console.log('Files:', req.files);

      // Validate required fields
      const requiredFields = {
        firstName: 'First Name',
        lastName: 'Last Name',
        dateOfBirth: 'Date of Birth',
        mobileNumber: 'Mobile Number',
        designation: 'Designation',
        department: 'Department',
        experience: 'Experience',
        specialization: 'Specialization',
        degree: 'Degree',
        educationSpecialization: 'Specialization',
        institutionName: 'Institution Name',
        yearOfCompletion: 'Year of Completion',
        universityName: 'University Name'
      };

      const missingFields = [];
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!req.body[field] || req.body[field].trim() === '') {
          missingFields.push(label);
        }
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Validate files
      const requiredFiles = {
        photo: 'Profile Photo',
        aadhar: 'Aadhar Card',
        pan: 'PAN Card',
        resume: 'Resume'
      };

      for (const [file, label] of Object.entries(requiredFiles)) {
        if (!req.files[file]) {
          missingFields.push(label);
        }
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required documents: ${missingFields.join(', ')}`
        });
      }

      // Create new profile
      const newProfile = new FacultyProfile({
        userId: req.user._id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dateOfBirth: new Date(req.body.dateOfBirth),
        gender: req.body.gender || 'Other',
        contact: req.body.mobileNumber, // Map mobileNumber to contact
        designation: req.body.designation,
        department: req.body.department,
        joiningDate: new Date(),
        experience: Number(req.body.experience),
        specialization: req.body.specialization,
        educationalQualifications: [{
          degree: req.body.degree,
          specialization: req.body.educationSpecialization,
          institution: req.body.institutionName,
          year: Number(req.body.yearOfCompletion),
          university: req.body.universityName
        }],
        documents: {
          photo: req.files.photo[0].path,
          aadhar: req.files.aadhar[0].path,
          pan: req.files.pan[0].path,
          resume: req.files.resume[0].path
        }
      });

      console.log('Attempting to save profile:', newProfile);

      await newProfile.save();

      console.log('Profile saved successfully');

      // Update user's hasProfile status
      await User.findByIdAndUpdate(req.user._id, { hasProfile: true });

      res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        profile: newProfile
      });

    } catch (error) {
      console.error('Error creating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating profile',
        error: error.message
      });
    }
  }
);

// @route   PUT /api/faculty/:id
// @desc    Update faculty profile
router.put('/:id', 
  auth,
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'aadharCard', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const profile = await FacultyProfile.findById(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      // Update fields
      const updateData = { ...req.body };
      if (req.files) {
        if (req.files['profilePhoto']) updateData.documents.profilePhoto = req.files['profilePhoto'][0].path;
        if (req.files['aadharCard']) updateData.documents.aadharCard = req.files['aadharCard'][0].path;
        if (req.files['panCard']) updateData.documents.panCard = req.files['panCard'][0].path;
        if (req.files['resume']) updateData.documents.resume = req.files['resume'][0].path;
      }
// Reconstruct educationalQualifications array if sent via multipart
      const eduKeys = Object.keys(req.body).filter(key => key.startsWith('educationalQualifications'));
      if (eduKeys.length > 0) {
        const qualifications = {};
        eduKeys.forEach(key => {
          const match = key.match(/educationalQualifications\[(\d+)\]\[(\w+)\]/);
          if (match) {
            const index = parseInt(match[1]);
            const field = match[2];
            qualifications[index] = qualifications[index] || {};
            qualifications[index][field] = req.body[key];
          }
        });
        updateData.educationalQualifications = Object.values(qualifications);
      }

      const updatedProfile = await FacultyProfile.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
  }
);

// @route   DELETE /api/faculty/:id
// @desc    Delete faculty profile
router.delete('/:id', auth, async (req, res) => {
  try {
    const profile = await FacultyProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Delete associated files
    const files = [profile.documents.profilePhoto, profile.documents.aadharCard, profile.documents.panCard, profile.documents.resume];
    files.forEach(file => {
      if (file && fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    await profile.remove();
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profile', error: error.message });
  }
});

// Get all faculty profiles (Admin only)
router.get("/all", auth, checkRole(['admin']), async (req, res) => {
  try {
    const profiles = await FacultyProfile.find()
      .populate('userId', 'username email department')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      profiles
    });
  } catch (err) {
    console.error('Error fetching all profiles:', err);
    res.status(500).json({ 
      success: false,
      msg: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get department-wise profiles (HOD only)
router.get("/department/:dept", auth, checkRole(['hod']), async (req, res) => {
  try {
    const { dept } = req.params;
    
    // Find users in the specified department
    const profiles = await FacultyProfile.find()
      .populate({
        path: 'userId',
        match: { department: dept },
        select: 'username email department'
      })
      .sort({ createdAt: -1 });

    // Filter out profiles where userId is null (users not in the department)
    const filteredProfiles = profiles.filter(profile => profile.userId !== null);
    
    res.json({
      success: true,
      profiles: filteredProfiles
    });
  } catch (err) {
    console.error('Error fetching department profiles:', err);
    res.status(500).json({ 
      success: false,
      msg: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get single faculty profile
router.get("/:id", auth, checkRole(['admin', 'hod']), async (req, res) => {
  try {
    const profile = await FacultyProfile.findById(req.params.id)
      .populate('userId', 'username email department');

    if (!profile) {
      return res.status(404).json({
        success: false,
        msg: "Profile not found"
      });
    }

    // For HOD, verify the profile belongs to their department
    if (req.user.role === 'hod') {
      const hod = await User.findById(req.user.id);
      if (hod.department !== profile.userId.department) {
        return res.status(403).json({
          success: false,
          msg: "You can only view profiles from your department"
        });
      }
    }

    res.json({
      success: true,
      profile
    });
  } catch (err) {
    console.error('Error fetching faculty profile:', err);
    res.status(500).json({
      success: false,
      msg: "Error fetching faculty profile",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get faculty profile
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const profile = await FacultyProfile.findOne({ userId: req.params.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    res.json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// Add this to facultyProfileRoutes.js
router.get('/test-profiles', async (req, res) => {
    try {
        const profiles = await FacultyProfile.find();
        res.json({
            count: profiles.length,
            profiles
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;