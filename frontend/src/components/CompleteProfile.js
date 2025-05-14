import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CompleteProfile.css';
import { getUser } from '../auth';
import axios from 'axios';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Other',
    mobileNumber: '',
    
    // Professional Details
    designation: '',
    department: '',
    experience: '',
    specialization: '',
    
    // Educational Qualifications
    degree: '',
    educationSpecialization: '',
    institutionName: '',
    yearOfCompletion: '',
    universityName: ''
  });

  const [files, setFiles] = useState({
    photo: null,
    aadhar: null,
    pan: null,
    resume: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const departments = [
    'Artificial Intelligence',
    'Computer Science',
    'Information Technology',
    'Data Science'
  ];
  const degrees = ['B.Sc.', 'M.Sc.', 'M.Tech', 'Ph.D.'];

  // Check authentication on component mount
  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate('/login', { state: { message: 'Please login to complete your profile' } });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList[0]) {
      // Check file size (max 5MB)
      if (fileList[0].size > 5 * 1024 * 1024) {
        setError(`${name} file size should be less than 5MB`);
        e.target.value = ''; // Clear the file input
        return;
      }
      setFiles(prev => ({ ...prev, [name]: fileList[0] }));
      setError(null);
    }
  };

  const validateStep = (step) => {
    const errors = [];
    
    switch(step) {
      case 1: // Personal Details
        if (!formData.firstName) errors.push('First name is required');
        if (!formData.lastName) errors.push('Last name is required');
        if (!formData.dateOfBirth) errors.push('Date of birth is required');
        if (!formData.mobileNumber) errors.push('Mobile number is required');
        if (!files.photo) errors.push('Profile photo is required');
        if (!files.aadhar) errors.push('Aadhar card is required');
        if (!files.pan) errors.push('PAN card is required');
        break;
      
      case 2: // Professional Details
        if (!formData.designation) errors.push('Designation is required');
        if (!formData.department) errors.push('Department is required');
        if (!formData.experience) errors.push('Experience is required');
        if (!formData.specialization) errors.push('Specialization is required');
        if (!files.resume) errors.push('Resume is required');
        break;
      
      case 3: // Educational Details
        if (!formData.degree) errors.push('Degree is required');
        if (!formData.institutionName) errors.push('Institution name is required');
        if (!formData.yearOfCompletion) errors.push('Year of completion is required');
        break;
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError(null);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate all required fields
      const requiredFields = {
        firstName: 'First Name',
        lastName: 'Last Name',
        dateOfBirth: 'Date of Birth',
        mobileNumber: 'Mobile Number',
        designation: 'Designation',
        department: 'Department',
        experience: 'Experience',
        specialization: 'Specialization',
        degree: 'Degree',
        educationSpecialization: 'Specialization',
        institutionName: 'Institution Name',
        yearOfCompletion: 'Year of Completion',
        universityName: 'University Name'
      };

      const missingFields = [];
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field] || formData[field].trim() === '') {
          missingFields.push(label);
        }
      }

      // Validate required files
      const requiredFiles = {
        photo: 'Profile Photo',
        aadhar: 'Aadhar Card',
        pan: 'PAN Card',
        resume: 'Resume'
      };

      for (const [file, label] of Object.entries(requiredFiles)) {
        if (!files[file]) {
          missingFields.push(label);
        }
      }

      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Create FormData object
      const submitData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'photo' && key !== 'aadhar' && key !== 'pan' && key !== 'resume') {
          submitData.append(key, formData[key]);
        }
      });

      // Add files
      if (files.photo) submitData.append('photo', files.photo);
      if (files.aadhar) submitData.append('aadhar', files.aadhar);
      if (files.pan) submitData.append('pan', files.pan);
      if (files.resume) submitData.append('resume', files.resume);

      // Log the data being sent
      console.log('Submitting form data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        mobileNumber: formData.mobileNumber,
        designation: formData.designation,
        department: formData.department,
        experience: formData.experience,
        specialization: formData.specialization,
        degree: formData.degree,
        educationSpecialization: formData.educationSpecialization,
        institutionName: formData.institutionName,
        yearOfCompletion: formData.yearOfCompletion,
        universityName: formData.universityName,
        files: {
          photo: files.photo ? files.photo.name : null,
          aadhar: files.aadhar ? files.aadhar.name : null,
          pan: files.pan ? files.pan.name : null,
          resume: files.resume ? files.resume.name : null
        }
      });

      const response = await axios.post(
        'http://localhost:5000/api/faculty/profile',
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Profile completed successfully! Redirecting to login...');
        // Clear token and redirect to login after 2 seconds
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Profile submission error:', error);
      setError(error.response?.data?.message || 'Error submitting profile. Please try again.');
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <section className="form-section">
            <h3>Personal Details</h3>
            <p className="form-help-text">Please provide your personal information and upload required documents.</p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input 
                  id="firstName"
                  name="firstName" 
                  placeholder="e.g., John" 
                  value={formData.firstName}
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input 
                  id="lastName"
                  name="lastName" 
                  placeholder="e.g., Smith" 
                  value={formData.lastName}
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth *</label>
                <input 
                  id="dateOfBirth"
                  name="dateOfBirth" 
                  type="date" 
                  value={formData.dateOfBirth}
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="mobileNumber">Mobile Number *</label>
                <input 
                  id="mobileNumber"
                  name="mobileNumber" 
                  placeholder="e.g., 9876543210" 
                  value={formData.mobileNumber}
                  onChange={handleChange} 
                  pattern="\d{10}"
                  required 
                />
                <small className="help-text">Enter 10-digit mobile number</small>
              </div>
            </div>
            
            <div className="file-uploads">
              <div className="form-group">
                <label>Profile Photo *</label>
                <input 
                  type="file" 
                  name="photo" 
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange} 
                  required 
                />
                <small className="help-text">Upload a professional photo (max 5MB)</small>
              </div>

              <div className="form-group">
                <label>Aadhar Card *</label>
                <input 
                  type="file" 
                  name="aadhar" 
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange} 
                  required 
                />
                <small className="help-text">Upload scanned copy (max 5MB)</small>
              </div>

              <div className="form-group">
                <label>PAN Card *</label>
                <input 
                  type="file" 
                  name="pan" 
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange} 
                  required 
                />
                <small className="help-text">Upload scanned copy (max 5MB)</small>
              </div>
            </div>
          </section>
        );

      case 2:
        return (
          <section className="form-section">
            <h3>Professional Details</h3>
            <p className="form-help-text">Please provide your professional information and upload your resume.</p>
            
            <div className="form-group">
              <label htmlFor="designation">Designation *</label>
              <input 
                id="designation"
                name="designation" 
                placeholder="e.g., Assistant Professor" 
                value={formData.designation}
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select 
                id="department"
                name="department" 
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="experience">Experience (in years) *</label>
              <input 
                id="experience"
                name="experience" 
                type="number" 
                min="0"
                placeholder="e.g., 5" 
                value={formData.experience}
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="specialization">Areas of Specialization *</label>
              <input 
                id="specialization"
                name="specialization" 
                placeholder="e.g., Machine Learning, Data Structures" 
                value={formData.specialization}
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="file-uploads">
              <div className="form-group">
                <label>Resume *</label>
                <input 
                  type="file" 
                  name="resume" 
                  accept=".pdf"
                  onChange={handleFileChange} 
                  required 
                />
                <small className="help-text">Upload your updated CV (PDF, max 5MB)</small>
              </div>
            </div>
          </section>
        );

      case 3:
        return (
          <section className="form-section">
            <h3>Educational Qualifications</h3>
            <p className="form-help-text">Please provide your highest educational qualification details.</p>
            
            <div className="form-group">
              <label htmlFor="degree">Degree *</label>
              <select 
                id="degree"
                name="degree" 
                value={formData.degree}
                onChange={handleChange}
                required
              >
                <option value="">Select Degree</option>
                {degrees.map(degree => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="educationSpecialization">Specialization *</label>
              <input 
                id="educationSpecialization"
                name="educationSpecialization" 
                placeholder="e.g., Computer Science" 
                value={formData.educationSpecialization}
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="institutionName">Institution Name *</label>
              <input 
                id="institutionName"
                name="institutionName" 
                placeholder="e.g., Indian Institute of Technology" 
                value={formData.institutionName}
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="yearOfCompletion">Year of Completion *</label>
              <input 
                id="yearOfCompletion"
                name="yearOfCompletion" 
                type="number" 
                min="1950"
                max={new Date().getFullYear()}
                placeholder="e.g., 2020" 
                value={formData.yearOfCompletion}
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="universityName">University Name *</label>
              <input 
                id="universityName"
                name="universityName" 
                placeholder="e.g., IIT Delhi" 
                value={formData.universityName}
                onChange={handleChange} 
                required 
              />
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-form-container">
      <h2>Complete Your Faculty Profile</h2>
      
      <div className="step-indicator">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>Personal Details</div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>Professional Details</div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>Educational Details</div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        {renderStep()}
        
        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="nav-button prev">
              Previous
            </button>
          )}
          
          {currentStep < 3 ? (
            <button type="button" onClick={nextStep} className="nav-button next">
              Next
            </button>
          ) : (
            <button 
              type="submit" 
              className="submit-button" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Profile'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CompleteProfile;