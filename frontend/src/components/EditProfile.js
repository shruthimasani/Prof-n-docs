// Updated src/components/EditProfile.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './EditProfile.css';

const EditProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = location.state || {};
  const [formData, setFormData] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        dateOfBirth: profile.dateOfBirth?.slice(0, 10) || '',
        contact: profile.contact || '',
        designation: profile.designation || '',
        department: profile.department || '',
        experience: profile.experience || '',
        specialization: profile.specialization || '',
        educationalQualifications: profile.educationalQualifications || []
      });
    }
  }, [profile]);

  const handleChange = (e, index, field) => {
    const { name, value } = e.target;
    if (index !== undefined && field) {
      const updatedEdQual = [...formData.educationalQualifications];
      updatedEdQual[index][field] = value;
      setFormData({ ...formData, educationalQualifications: updatedEdQual });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles({ ...selectedFiles, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const form = new FormData();

    for (let key in formData) {
      if (key === 'educationalQualifications') {
        formData.educationalQualifications.forEach((qual, index) => {
          form.append(`educationalQualifications[${index}][degree]`, qual.degree);
          form.append(`educationalQualifications[${index}][specialization]`, qual.specialization);
          form.append(`educationalQualifications[${index}][institution]`, qual.institution);
          form.append(`educationalQualifications[${index}][year]`, qual.year);
          form.append(`educationalQualifications[${index}][university]`, qual.university);
        });
      } else {
        form.append(key, formData[key]);
      }
    }

    // Append files
    Object.keys(selectedFiles).forEach((key) => {
      form.append(key, selectedFiles[key]);
    });

    try {
      const res = await fetch(`http://localhost:5000/api/faculty/${profile._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });

      const data = await res.json();
      if (res.ok && data) {
        setMessage('Profile updated successfully');
        navigate('/faculty-dashboard');
      } else {
        setMessage(data.message || 'Update failed');
      }
    } catch (error) {
      setMessage('An error occurred while updating profile.');
    }
  };

  if (!formData) return <div className="loading">Loading...</div>;

  return (
    <div className="edit-profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate(-1)}>Back</button>
        <h1>Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="edit-form" encType="multipart/form-data">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input name="contact" value={formData.contact} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input name="designation" value={formData.designation} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input name="department" value={formData.department} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Experience (years)</label>
              <input name="experience" type="number" value={formData.experience} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input name="specialization" value={formData.specialization} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Educational Qualifications</h3>
          {formData.educationalQualifications.map((qual, index) => (
            <div className="qualification-form" key={index}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Degree</label>
                  <input value={qual.degree} onChange={(e) => handleChange(e, index, 'degree')} />
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <input value={qual.specialization} onChange={(e) => handleChange(e, index, 'specialization')} />
                </div>
                <div className="form-group">
                  <label>Institution</label>
                  <input value={qual.institution} onChange={(e) => handleChange(e, index, 'institution')} />
                </div>
                <div className="form-group">
                  <label>Year of Completion</label>
                  <input value={qual.year} onChange={(e) => handleChange(e, index, 'year')} />
                </div>
                <div className="form-group">
                  <label>University</label>
                  <input value={qual.university} onChange={(e) => handleChange(e, index, 'university')} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-section">
          <h3>Upload Documents</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Profile Photo</label>
              <input type="file" name="profilePhoto" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="form-group">
              <label>Aadhar Card</label>
              <input type="file" name="aadharCard" accept="application/pdf,image/*" onChange={handleFileChange} />
            </div>
            <div className="form-group">
              <label>PAN Card</label>
              <input type="file" name="panCard" accept="application/pdf,image/*" onChange={handleFileChange} />
            </div>
            <div className="form-group">
              <label>Resume</label>
              <input type="file" name="resume" accept="application/pdf" onChange={handleFileChange} />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">Save Changes</button>
          <button type="button" className="cancel-button" onClick={() => navigate('/faculty-dashboard')}>Cancel</button>
        </div>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default EditProfile;
