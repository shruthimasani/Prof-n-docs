const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function registerUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const newUser = new User({
      username: 'sarika',
      email: 'sarika@example.com', // You'll need to provide a valid email
      password: 'sarika12',
      role: 'faculty',
      department: 'Computer Science' // You can change this to your department
    });

    await newUser.save();
    console.log('User registered successfully!');
    console.log('You can now login with:');
    console.log('Username: sarika');
    console.log('Password: sarika12');
    console.log('Role: faculty');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

registerUser(); 