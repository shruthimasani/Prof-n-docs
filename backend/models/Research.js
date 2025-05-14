const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authors: [{ type: String }],
  journal: String,
  doi: { type: String, unique: true },
  year: Number,
  url: String,
  plagiarismScore: Number,
  createdAt: { type: Date, default: Date.now }
});

const collaborationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  collaborators: [{ type: String }],
  publications: { type: Number, default: 0 },
  lastCollaboration: Date
});

const patentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  filingDate: { type: Date, required: true },
  renewalDeadline: { type: Date, required: true },
  status: { type: String, enum: ['active', 'pending', 'expired'], default: 'active' }
});

const researchSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  publications: [publicationSchema],
  impactMetrics: {
    hIndex: { type: Number, default: 0 },
    citations: { type: Number, default: 0 },
    i10Index: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  collaborationNetwork: [collaborationSchema],
  patents: [patentSchema]
}, {
  timestamps: true
});

// Index for faster queries
researchSchema.index({ facultyId: 1 });
researchSchema.index({ 'publications.doi': 1 });
researchSchema.index({ 'patents.number': 1 });

module.exports = mongoose.model('Research', researchSchema); 