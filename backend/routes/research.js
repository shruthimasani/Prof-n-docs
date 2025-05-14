const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const axios = require('axios');
const Research = require('../models/Research');

// Get all research data for a faculty member
router.get('/:facultyId', auth, async function(req, res) {
  try {
    const { facultyId } = req.params;
    
    let researchData = await Research.findOne({ facultyId });
    
    if (!researchData) {
      researchData = await Research.create({
        facultyId,
        publications: [],
        impactMetrics: {
          hIndex: 0,
          citations: 0,
          i10Index: 0
        },
        collaborationNetwork: [],
        patents: []
      });
    }

    res.json(researchData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Fetch publication data from CrossRef API
router.post('/fetch-publication', auth, async function(req, res) {
  try {
    const { doi, facultyId } = req.body;
    
    // Check if publication already exists
    const existingResearch = await Research.findOne({
      facultyId,
      'publications.doi': doi
    });

    if (existingResearch) {
      return res.status(400).json({ msg: 'Publication already exists' });
    }

    // Fetch from CrossRef API
    const response = await axios.get(`https://api.crossref.org/works/${doi}`);
    const work = response.data.message;

    const publication = {
      title: work.title[0],
      authors: work.author.map(a => `${a.given} ${a.family}`),
      journal: work['container-title'][0],
      doi: work.DOI,
      year: work.published['date-parts'][0][0],
      url: work.URL
    };

    // Save to database
    await Research.findOneAndUpdate(
      { facultyId },
      { $push: { publications: publication } },
      { upsert: true }
    );

    res.json(publication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Failed to fetch publication data' });
  }
});

// Check plagiarism for a publication
router.post('/check-plagiarism/:publicationId', auth, async function(req, res) {
  try {
    const { publicationId } = req.params;
    const { facultyId } = req.body;
    
    // TODO: Implement actual plagiarism checking logic
    const similarityScore = Math.random() * 100; // Placeholder

    // Update plagiarism score in database
    await Research.findOneAndUpdate(
      { 
        facultyId,
        'publications._id': publicationId 
      },
      { 
        $set: { 'publications.$.plagiarismScore': similarityScore }
      }
    );

    res.json({ similarityScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Failed to check plagiarism' });
  }
});

// Update impact metrics
router.post('/update-metrics/:facultyId', auth, async function(req, res) {
  try {
    const { facultyId } = req.params;
    
    // TODO: Implement actual metrics calculation logic
    const metrics = {
      hIndex: Math.floor(Math.random() * 50),
      citations: Math.floor(Math.random() * 1000),
      i10Index: Math.floor(Math.random() * 20),
      lastUpdated: new Date()
    };

    await Research.findOneAndUpdate(
      { facultyId },
      { $set: { impactMetrics: metrics } },
      { upsert: true }
    );

    res.json(metrics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Failed to update metrics' });
  }
});

// Add patent
router.post('/patents/:facultyId', auth, async function(req, res) {
  try {
    const { facultyId } = req.params;
    const { title, number, filingDate, renewalDeadline } = req.body;

    const patent = {
      title,
      number,
      filingDate: new Date(filingDate),
      renewalDeadline: new Date(renewalDeadline),
      status: 'active'
    };

    await Research.findOneAndUpdate(
      { facultyId },
      { $push: { patents: patent } },
      { upsert: true }
    );

    res.json(patent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Failed to add patent' });
  }
});

// Delete a publication
router.delete('/publications/:publicationId', auth, async function(req, res) {
  try {
    const { publicationId } = req.params;
    const { facultyId } = req.body;

    await Research.findOneAndUpdate(
      { facultyId },
      { $pull: { publications: { _id: publicationId } } }
    );

    res.json({ msg: 'Publication deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Failed to delete publication' });
  }
});

// Delete a patent
router.delete('/patents/:patentId', auth, async function(req, res) {
  try {
    const { patentId } = req.params;
    const { facultyId } = req.body;

    await Research.findOneAndUpdate(
      { facultyId },
      { $pull: { patents: { _id: patentId } } }
    );

    res.json({ msg: 'Patent deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Failed to delete patent' });
  }
});

module.exports = router; 