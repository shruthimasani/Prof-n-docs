import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  MenuItem,
  Paper,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const FacultyProfileForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: null,
    gender: '',
    contact: '',
    designation: '',
    joiningDate: null,
    experience: '',
    educationalQualifications: [{
      degree: '',
      institution: '',
      year: ''
    }]
  });

  const [files, setFiles] = useState({
    photo: null,
    aadhar: null,
    pan: null,
    resume: null
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field, file) => {
    setFiles(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleAddQualification = () => {
    setFormData(prev => ({
      ...prev,
      educationalQualifications: [
        ...prev.educationalQualifications,
        { degree: '', institution: '', year: '' }
      ]
    }));
  };

  const handleRemoveQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      educationalQualifications: prev.educationalQualifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formDataToSend.append(key, file);
        }
      });

      // Format dates and numbers
      const formattedData = {
        ...formData,
        experience: Number(formData.experience),
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null,
        joiningDate: formData.joiningDate ? formData.joiningDate.toISOString() : null,
        educationalQualifications: formData.educationalQualifications.map(qual => ({
          ...qual,
          year: Number(qual.year)
        }))
      };

      // Add form data
      Object.entries(formattedData).forEach(([key, value]) => {
        if (key === 'educationalQualifications') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value);
        }
      });

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/faculty/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create profile');
      }

      setSuccess('Profile created successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to create profile. Please check all fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Faculty Profile
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          {/* Personal Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Personal Details
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={(date) => handleChange('dateOfBirth', date)}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Gender"
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              required
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Number"
              value={formData.contact}
              onChange={(e) => handleChange('contact', e.target.value)}
              required
            />
          </Grid>

          {/* Professional Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Professional Details
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Designation"
              value={formData.designation}
              onChange={(e) => handleChange('designation', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Joining Date"
                value={formData.joiningDate}
                onChange={(date) => handleChange('joiningDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Experience (in years)"
              type="number"
              value={formData.experience}
              onChange={(e) => handleChange('experience', e.target.value)}
              required
            />
          </Grid>

          {/* Educational Qualifications */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Educational Qualifications
            </Typography>
          </Grid>
          {formData.educationalQualifications.map((qual, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Degree"
                  value={qual.degree}
                  onChange={(e) => {
                    const newQualifications = [...formData.educationalQualifications];
                    newQualifications[index].degree = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      educationalQualifications: newQualifications
                    }));
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Institution"
                  value={qual.institution}
                  onChange={(e) => {
                    const newQualifications = [...formData.educationalQualifications];
                    newQualifications[index].institution = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      educationalQualifications: newQualifications
                    }));
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Year"
                  type="number"
                  value={qual.year}
                  onChange={(e) => {
                    const newQualifications = [...formData.educationalQualifications];
                    newQualifications[index].year = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      educationalQualifications: newQualifications
                    }));
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveQualification(index)}
                  disabled={formData.educationalQualifications.length === 1}
                >
                  Remove
                </Button>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={handleAddQualification}
            >
              Add Qualification
            </Button>
          </Grid>

          {/* Document Uploads */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Document Uploads
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              Upload Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFileChange('photo', e.target.files[0])}
              />
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              Upload Aadhar
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFileChange('aadhar', e.target.files[0])}
              />
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              Upload PAN
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFileChange('pan', e.target.files[0])}
              />
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              Upload Resume
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange('resume', e.target.files[0])}
              />
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Profile'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default FacultyProfileForm; 