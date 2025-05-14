const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const departments = [
  'cse',
  'csm',
  'ds',
  'it'
];

const defaultUsers = [
  {
    username: 'admin',
    email: 'admin@university.edu',
    password: 'admin123',
    role: 'admin'
  }
];

// Add HOD users for each department
departments.forEach(dept => {
  defaultUsers.push({
    username: `hod_${dept}`,
    email: `hod_${dept}@university.edu`,
    password: 'hod123',
    role: 'hod',
    department: dept
  });
});

const createDefaultUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    for (const userData of defaultUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ username: userData.username });
      if (existingUser) {
        console.log(`${userData.role} user already exists: ${userData.username}`);
        continue;
      }

      // Create user
      const user = await User.create(userData);
      console.log(`${userData.role} user created successfully: ${user.username}`);
    }

    console.log('Default users creation completed');
    process.exit(0);
  } catch (error) {
    console.error('Error creating default users:', error);
    process.exit(1);
  }
};

createDefaultUsers(); 