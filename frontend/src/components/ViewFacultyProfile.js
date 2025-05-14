import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResearchContributions from './ResearchContributions';
import './ViewFacultyProfile.css';

const ViewFacultyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/faculty/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to fetch profile');
      }

      setProfile(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!profile) return <div className="error">Profile not found</div>;

  return (
    <div className="view-profile-container">
      <div className="profile-header">
        <button onClick={handleBack} className="back-button">
          ← Back
        </button>
        <h1>Faculty Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <div className="profile-photo-container">
            <img
              src={profile.photo || '/default-avatar.png'}
              alt={`${profile.firstName} ${profile.lastName}`}
              className="profile-photo"
            />
          </div>

          <div className="profile-info">
            <h2>{`${profile.firstName} ${profile.lastName}`}</h2>
            <p className="designation">{profile.designation}</p>
            <p className="department">{profile.department}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-section">
            <h3>Personal Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Email</label>
                <p>{profile.userId?.email}</p>
              </div>
              <div className="detail-item">
                <label>Contact</label>
                <p>{profile.contact}</p>
              </div>
              <div className="detail-item">
                <label>Date of Birth</label>
                <p>{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div className="detail-item">
                <label>Gender</label>
                <p>{profile.gender}</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Professional Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Experience</label>
                <p>{profile.experience} years</p>
              </div>
              <div className="detail-item">
                <label>Specialization</label>
                <p>{profile.specialization}</p>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <p className={`status ${profile.status}`}>{profile.status}</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Educational Qualifications</h3>
            {profile.qualifications?.map((qual, index) => (
              <div key={index} className="qualification-item">
                <h4>{qual.degree}</h4>
                <p>{qual.institution}</p>
                <p>{qual.year}</p>
              </div>
            ))}
          </div>

          <div className="detail-section">
            <h3>Documents</h3>
            <div className="documents-grid">
              {profile.documents?.resume && (
                <a href={profile.documents.resume} target="_blank" rel="noopener noreferrer" className="document-link">
                  Resume
                </a>
              )}
              {profile.documents?.certificates?.map((cert, index) => (
                <a key={index} href={cert} target="_blank" rel="noopener noreferrer" className="document-link">
                  Certificate {index + 1}
                </a>
              ))}
            </div>
          </div>

          {/* Research Contributions Section */}
          <div className="detail-section">
            <h3>Research Contributions</h3>
            <ResearchContributions facultyId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewFacultyProfile; 