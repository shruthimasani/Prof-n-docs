const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema({
  s_no: {
    type: Number,
    required: true
  },
  faculty_unique_id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String
  },
  middle_name: {
    type: String
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String
  },
  pan: {
    type: String,
    required: true,
    unique: true
  },
  pan_first_name: {
    type: String
  },
  pan_last_name: {
    type: String
  },
  current_age: {
    type: Number
  },
  email_address: {
    type: String,
    required: true,
    unique: true
  },
  designation: {
    type: String
  },
  department: {
    type: String
  },
  course: {
    type: String
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  }
});

module.exports = mongoose.model("Faculty", FacultySchema);
