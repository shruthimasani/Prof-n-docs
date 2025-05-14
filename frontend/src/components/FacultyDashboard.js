// src/components/FacultyDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../auth';
import './FacultyDashboard.css';
import { FaUser, FaGraduationCap, FaBriefcase, FaFileUpload, FaFileDownload, FaSignOutAlt, FaChevronDown, FaChevronUp, FaBook } from 'react-icons/fa';
import ResearchContributions from './ResearchContributions';

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    professional: true,
    educational: true,
    research: true
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/faculty/profile/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      } else {
        throw new Error('Profile data not found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const downloadProfilePDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/faculty/profile/pdf', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.firstName}_${profile.lastName}_Profile.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Failed to download profile PDF');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!profile) {
    return <div className="error">No profile data found</div>;
  }

  return (
    <div className="faculty-dashboard">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome, {profile.firstName} {profile.lastName}</h1>
          <p className="department">{profile.department}</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </header>

      <div className="profile-summary">
        <h2>Profile Summary</h2>
        <p>{profile.summary || `${profile.firstName} ${profile.lastName} is a ${profile.designation} in the ${profile.department} department with ${profile.experience} years of experience. Specializing in ${profile.specialization}.`}</p>
      </div>

      <div className="dashboard-content">
        <section className="profile-section">
          <div className="section-header" onClick={() => toggleSection('personal')}>
            <h3><FaUser /> Personal Information</h3>
            {expandedSections.personal ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {expandedSections.personal && (
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{profile.firstName} {profile.lastName}</p>
                </div>
                <div className="info-item">
                  <label>Date of Birth</label>
                  <p>{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div className="info-item">
                  <label>Contact Number</label>
                  <p>{profile.contact}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="profile-section">
          <div className="section-header" onClick={() => toggleSection('professional')}>
            <h3><FaBriefcase /> Professional Information</h3>
            {expandedSections.professional ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {expandedSections.professional && (
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Designation</label>
                  <p>{profile.designation}</p>
                </div>
                <div className="info-item">
                  <label>Department</label>
                  <p>{profile.department}</p>
                </div>
                <div className="info-item">
                  <label>Experience</label>
                  <p>{profile.experience} years</p>
                </div>
                <div className="info-item">
                  <label>Specialization</label>
                  <p>{profile.specialization}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="profile-section">
          <div className="section-header" onClick={() => toggleSection('educational')}>
            <h3><FaGraduationCap /> Educational Qualifications</h3>
            {expandedSections.educational ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {expandedSections.educational && (
            <div className="section-content">
              <div className="info-grid">
                {profile.educationalQualifications.map((qual, index) => (
                  <React.Fragment key={index}>
                    <div className="info-item">
                      <label>Degree</label>
                      <p>{qual.degree}</p>
                    </div>
                    <div className="info-item">
                      <label>Specialization</label>
                      <p>{qual.specialization}</p>
                    </div>
                    <div className="info-item">
                      <label>Institution</label>
                      <p>{qual.institution}</p>
                    </div>
                    <div className="info-item">
                      <label>Year of Completion</label>
                      <p>{qual.year}</p>
                    </div>
                    <div className="info-item">
                      <label>University</label>
                      <p>{qual.university}</p>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="profile-section">
          <div className="section-header" onClick={() => toggleSection('research')}>
            <h3><FaBook /> Research Contributions</h3>
            {expandedSections.research ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {expandedSections.research && (
            <div className="section-content">
              <ResearchContributions facultyId={profile._id} />
            </div>
          )}
        </section>

        <section className="documents-section">
          <h3><FaFileUpload /> Documents</h3>
          <div className="documents-grid">
            <div className="document-item">
              <label>Profile Photo</label>
              <img src={profile.documents.photo} alt="Profile" className="profile-photo" />
            </div>
            <div className="document-item">
              <label>Resume</label>
              <a href={profile.documents.resume} target="_blank" rel="noopener noreferrer">View Resume</a>
            </div>
          </div>
        </section>

        <div className="action-buttons">
          <button
            className="edit-button"
            onClick={() => navigate('/edit-profile', { state: { profile } })}
          >
            <FaUser /> Edit Profile
          </button>
          <button className="download-button" onClick={downloadProfilePDF}>
            <FaFileDownload /> Download Profile as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
