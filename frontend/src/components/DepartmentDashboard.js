import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaSearch, FaBell, FaChartBar, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';
import './DepartmentDashboard.css';

const DepartmentDashboard = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalFaculty: 0,
    pendingApprovals: 0,
    activeCourses: 0,
    pendingLeaves: 0
  });

  const departments = {
    'Computer Science': { name: 'Computer Science', color: '#4a90e2' },
    'Information Technology': { name: 'Information Technology', color: '#2ecc71' },
    'Data Science': { name: 'Data Science', color: '#e74c3c' },
    'Artificial Intelligence': { name: 'Artificial Intelligence', color: '#f1c40f' },
    'Electronics': { name: 'Electronics', color: '#9b59b6' }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!token || !user || user.role !== 'hod') {
      navigate('/login');
      return;
    }

    fetchFacultyData();
  }, [departmentId, navigate]);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Log the department ID we're fetching for
      console.log('Fetching faculty for department:', departmentId);

      // Use the department-specific endpoint
      const response = await fetch(`http://localhost:5000/api/faculty/department/${departmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch faculty data');
      }

      const data = await response.json();
      console.log('Department faculty data received:', data);

      // Process the faculty data from the department-specific response
      const facultyArray = data.profiles || [];
      console.log('Faculty array:', facultyArray);

      // Process the faculty data
      const processedFaculty = facultyArray.map(f => ({
        _id: f._id || f.id,
        firstName: f.firstName || f.first_name || '',
        lastName: f.lastName || f.last_name || '',
        designation: f.designation || f.role || '',
        photo: f.documents?.photo || '',
        status: f.status || 'active',
        activeCourses: f.activeCourses || f.courses?.length || 0,
        pendingLeaves: f.pendingLeaves || f.leaves?.filter(l => l.status === 'pending').length || 0,
        department: f.department || departmentId,
        email: f.userId?.email || '',
        phone: f.contact || '',
        qualification: f.educationalQualifications?.[0]?.degree || ''
      }));

      console.log('Processed faculty data:', processedFaculty);
      
      setFaculty(processedFaculty);
      calculateStats(processedFaculty);
    } catch (err) {
      console.error('Error fetching faculty data:', err);
      setError(err.message);
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (facultyList) => {
    if (!Array.isArray(facultyList)) {
      setStats({
        totalFaculty: 0,
        pendingApprovals: 0,
        activeCourses: 0,
        pendingLeaves: 0
      });
      return;
    }

    const newStats = {
      totalFaculty: facultyList.length,
      pendingApprovals: facultyList.filter(f => f.status === 'pending').length,
      activeCourses: facultyList.reduce((acc, f) => acc + (f.activeCourses || 0), 0),
      pendingLeaves: facultyList.reduce((acc, f) => acc + (f.pendingLeaves || 0), 0)
    };
    setStats(newStats);
  };

  const handleViewProfile = (profileId) => {
    navigate(`/view-faculty/${profileId}`);
  };

  const handleEdit = (profileId) => {
    navigate(`/edit-faculty/${profileId}`);
  };

  const filteredFaculty = Array.isArray(faculty) ? faculty.filter(f => 
    f.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const department = departments[departmentId];

  return (
    <div className="department-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/hod-dashboard')}>
            <FaArrowLeft /> Back to HOD Dashboard
          </button>
          <h1>{department.name} Dashboard</h1>
          <p className="department-description">
            Managing faculty members in the {department.name} department
          </p>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderColor: department.color }}>
          <FaUser />
          <div className="stat-info">
            <h3>Total Faculty</h3>
            <p>{stats.totalFaculty}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: department.color }}>
          <FaEdit />
          <div className="stat-info">
            <h3>Pending Approvals</h3>
            <p>{stats.pendingApprovals}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: department.color }}>
          <FaChartBar />
          <div className="stat-info">
            <h3>Active Courses</h3>
            <p>{stats.activeCourses}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: department.color }}>
          <FaCalendarAlt />
          <div className="stat-info">
            <h3>Leave Requests</h3>
            <p>{stats.pendingLeaves}</p>
          </div>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder={`Search ${department.name} faculty...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="faculty-grid">
        {filteredFaculty.length > 0 ? (
          filteredFaculty.map(f => (
            <div key={f._id} className="faculty-card">
              <div className="faculty-header">
                <img 
                  src={f.photo || 'https://via.placeholder.com/80'} 
                  alt={`${f.firstName} ${f.lastName}`}
                  className="faculty-photo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/80';
                  }}
                />
                <div className="faculty-info">
                  <h3>{`${f.firstName} ${f.lastName}`}</h3>
                  <p className="designation">{f.designation}</p>
                  <p className="status" style={{ 
                    color: f.status === 'pending' ? '#f1c40f' : 
                           f.status === 'active' ? '#2ecc71' : '#e74c3c'
                  }}>
                    {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                  </p>
                </div>
              </div>
              <div className="faculty-details">
                <p><strong>Email:</strong> {f.email}</p>
                <p><strong>Phone:</strong> {f.phone}</p>
                <p><strong>Qualification:</strong> {f.qualification}</p>
                <p><strong>Active Courses:</strong> {f.activeCourses}</p>
                <p><strong>Pending Leaves:</strong> {f.pendingLeaves}</p>
              </div>
              <div className="faculty-actions">
                <button onClick={() => handleViewProfile(f._id)} className="view-button">
                  <FaUser /> View Profile
                </button>
                <button onClick={() => handleEdit(f._id)} className="edit-button">
                  <FaEdit /> Edit
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-faculty-message">
            {searchTerm 
              ? `No faculty members found matching "${searchTerm}" in ${department.name}`
              : `No faculty members found in ${department.name} department.`}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentDashboard; 