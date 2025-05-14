const mongoose = require('mongoose');

const FacultyProfileSchema = new mongoose.Schema({
  // Reference to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Personal Details
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  contact: {
    type: String,
    required: true
  },

  // Professional Details
  designation: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: [
      'Artificial Intelligence',
      'Computer Science',
      'Information Technology',
      'Data Science',
      'Electronics'
    ]
  },
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  experience: {
    type: Number,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },

  // Educational Qualifications
  educationalQualifications: [{
    degree: {
      type: String,
      required: true
    },
    specialization: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    university: {
      type: String,
      required: true
    }
  }],

  // Documents
  documents: {
    photo: {
      type: String,
      required: true
    },
    aadhar: {
      type: String,
      required: true
    },
    pan: {
      type: String,
      required: true
    },
    resume: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FacultyProfile', FacultyProfileSchema);