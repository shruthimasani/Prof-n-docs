import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './ResearchContributions.css';

const ResearchContributions = ({ facultyId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publications, setPublications] = useState([]);
  const [impactMetrics, setImpactMetrics] = useState({
    hIndex: 0,
    citations: 0,
    i10Index: 0
  });
  const [collaborationNetwork, setCollaborationNetwork] = useState([]);
  const [patents, setPatents] = useState([]);
  const [doiInput, setDoiInput] = useState('');
  
  // Dialog states
  const [openPatentDialog, setOpenPatentDialog] = useState(false);
  const [newPatent, setNewPatent] = useState({
    title: '',
    number: '',
    filingDate: '',
    renewalDeadline: ''
  });

  useEffect(() => {
    fetchResearchData();
  }, [facultyId]);

  const fetchResearchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/research/${facultyId}`);
      const { publications, impactMetrics, collaborationNetwork, patents } = response.data;
      setPublications(publications);
      setImpactMetrics(impactMetrics);
      setCollaborationNetwork(collaborationNetwork);
      setPatents(patents);
    } catch (err) {
      setError('Failed to fetch research data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDoiSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/research/fetch-publication`, { 
        doi: doiInput,
        facultyId 
      });
      setPublications([...publications, response.data]);
      setDoiInput('');
    } catch (err) {
      setError('Failed to fetch publication data');
    }
  };

  const handleDeletePublication = async (publicationId) => {
    try {
      await axios.delete(`/api/research/publications/${publicationId}`);
      setPublications(publications.filter(pub => pub._id !== publicationId));
    } catch (err) {
      setError('Failed to delete publication');
    }
  };

  const handleAddPatent = async () => {
    try {
      const response = await axios.post(`/api/research/patents/${facultyId}`, newPatent);
      setPatents([...patents, response.data]);
      setOpenPatentDialog(false);
      setNewPatent({
        title: '',
        number: '',
        filingDate: '',
        renewalDeadline: ''
      });
    } catch (err) {
      setError('Failed to add patent');
    }
  };

  const handleDeletePatent = async (patentId) => {
    try {
      await axios.delete(`/api/research/patents/${patentId}`);
      setPatents(patents.filter(patent => patent._id !== patentId));
    } catch (err) {
      setError('Failed to delete patent');
    }
  };

  const checkPlagiarism = async (publicationId) => {
    try {
      const response = await axios.post(`/api/research/check-plagiarism/${publicationId}`, {
        facultyId
      });
      return response.data.similarityScore;
    } catch (err) {
      setError('Failed to check plagiarism');
      return null;
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box className="research-contributions">
      <Typography variant="h4" gutterBottom>
        Research Contributions
      </Typography>

      {/* Publication Auto-Fetch Section */}
      <Paper className="section" elevation={3}>
        <Typography variant="h6">Publications</Typography>
        <form onSubmit={handleDoiSubmit} className="doi-form">
          <TextField
            label="Enter DOI/ISBN"
            value={doiInput}
            onChange={(e) => setDoiInput(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary">
            Fetch Publication
          </Button>
        </form>
        <Grid container spacing={2}>
          {publications.map((pub) => (
            <Grid item xs={12} md={6} key={pub._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{pub.title}</Typography>
                  <Typography color="textSecondary">{pub.authors.join(', ')}</Typography>
                  <Typography>{pub.journal}</Typography>
                  <Typography>DOI: {pub.doi}</Typography>
                  <IconButton 
                    onClick={() => handleDeletePublication(pub._id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Impact Metrics Section */}
      <Paper className="section" elevation={3}>
        <Typography variant="h6">Impact Metrics</Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                <Typography variant="h4">{impactMetrics.hIndex}</Typography>
                <Typography color="textSecondary">h-index</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                <Typography variant="h4">{impactMetrics.citations}</Typography>
                <Typography color="textSecondary">Total Citations</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card>
              <CardContent>
                <Typography variant="h4">{impactMetrics.i10Index}</Typography>
                <Typography color="textSecondary">i10-index</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Collaboration Network Section */}
      <Paper className="section" elevation={3}>
        <Typography variant="h6">Collaboration Network</Typography>
        <Box className="network-map">
          {collaborationNetwork.map((collab) => (
            <Card key={collab.id} className="collab-card">
              <CardContent>
                <Typography variant="h6">{collab.institution}</Typography>
                <Typography>{collab.collaborators.join(', ')}</Typography>
                <Typography color="textSecondary">
                  {collab.publications} joint publications
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>

      {/* Patent Tracker Section */}
      <Paper className="section" elevation={3}>
        <Typography variant="h6">Patent Tracker</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setOpenPatentDialog(true)}
          style={{ marginBottom: '1rem' }}
        >
          Add New Patent
        </Button>
        <Grid container spacing={2}>
          {patents.map((patent) => (
            <Grid item xs={12} md={6} key={patent._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{patent.title}</Typography>
                  <Typography>Patent Number: {patent.number}</Typography>
                  <Typography>Filing Date: {new Date(patent.filingDate).toLocaleDateString()}</Typography>
                  <Typography color="error">
                    Renewal Deadline: {new Date(patent.renewalDeadline).toLocaleDateString()}
                  </Typography>
                  <IconButton 
                    onClick={() => handleDeletePatent(patent._id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Add Patent Dialog */}
      <Dialog open={openPatentDialog} onClose={() => setOpenPatentDialog(false)}>
        <DialogTitle>Add New Patent</DialogTitle>
        <DialogContent>
          <TextField
            label="Patent Title"
            value={newPatent.title}
            onChange={(e) => setNewPatent({...newPatent, title: e.target.value})}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Patent Number"
            value={newPatent.number}
            onChange={(e) => setNewPatent({...newPatent, number: e.target.value})}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Filing Date"
            type="date"
            value={newPatent.filingDate}
            onChange={(e) => setNewPatent({...newPatent, filingDate: e.target.value})}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Renewal Deadline"
            type="date"
            value={newPatent.renewalDeadline}
            onChange={(e) => setNewPatent({...newPatent, renewalDeadline: e.target.value})}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPatentDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPatent} variant="contained" color="primary">
            Add Patent
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResearchContributions; 