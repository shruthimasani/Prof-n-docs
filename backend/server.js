require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const xlsx = require("xlsx");
const Faculty = require("./models/Faculty");
const facultyProfileRoutes = require('./routes/facultyProfileRoutes');
const authRoutes = require('./routes/authRoutes');
const researchRoutes = require('./routes/research');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Basic error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Routes
console.log('🛣️  Setting up routes...');
try {
  app.use('/uploads', express.static(uploadsDir));
  app.use('/api/faculty', facultyProfileRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/research', researchRoutes);
  console.log('✅ Routes setup complete');
} catch (error) {
  console.error('❌ Error setting up routes:', error);
  process.exit(1);
}

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/faculty_db";

console.log('🔌 Connecting to MongoDB...');
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: 'majority',
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("📡 MongoDB connected successfully");
    
    // Start server only after MongoDB connection
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Available Routes:`);
      console.log(`   Test Route:`);
      console.log(`   - GET /test`);
      console.log(`\n   Auth Routes:`);
      console.log(`   - POST /api/auth/register`);
      console.log(`   - POST /api/auth/login`);
      console.log(`   - POST /api/auth/forgot-password`);
      console.log(`   - POST /api/auth/reset-password/:token`);
      console.log(`   - GET /api/auth/me`);
      console.log(`\n   Faculty Routes:`);
      console.log(`   - GET /api/faculty`);
      console.log(`   - GET /api/faculty/:id`);
      console.log(`   - POST /api/faculty/profile`);
      console.log(`   - PUT /api/faculty/:id`);
      console.log(`   - DELETE /api/faculty/:id`);
      console.log(`\n   Research Routes:`);
      console.log(`   - GET /api/research/:facultyId`);
      console.log(`   - POST /api/research/fetch-publication`);
      console.log(`   - POST /api/research/check-plagiarism/:publicationId`);
      console.log(`   - POST /api/research/update-metrics/:facultyId`);
      console.log(`   - POST /api/research/patents/:facultyId`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      process.exit(1);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    msg: "Server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`[${new Date().toISOString()}] 404: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url,
    method: req.method,
    availableRoutes: [
      '/test',
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/forgot-password',
      '/api/auth/reset-password/:token',
      '/api/auth/me',
      '/api/faculty',
      '/api/faculty/:id',
      '/api/faculty/profile',
      '/api/faculty/:id (PUT)',
      '/api/faculty/:id (DELETE)',
      '/api/research/:facultyId',
      '/api/research/fetch-publication',
      '/api/research/check-plagiarism/:publicationId',
      '/api/research/update-metrics/:facultyId',
      '/api/research/patents/:facultyId'
    ]
  });
});