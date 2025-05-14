const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find().select('username email role department');
    console.log('\nRegistered Users:');
    console.log('-----------------');
    users.forEach(user => {
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Department: ${user.department || 'N/A'}`);
      console.log('-----------------');
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

listUsers(); 