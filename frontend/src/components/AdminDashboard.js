import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaSearch, FaFileDownload, FaEye } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalFaculty: 0,
    pendingApprovals: 0,
    activeFaculty: 0
  });

  // Sample data for publications pie chart
  const publicationData = [
    { name: 'Journals', value: 45 },
    { name: 'Conferences', value: 30 },
    { name: 'Books', value: 15 },
    { name: 'Patents', value: 10 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching faculty data...');
      const response = await fetch('http://localhost:5000/api/faculty', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch faculty data');
      }

      const data = await response.json();
      console.log('Received faculty data:', data);

      // Ensure data is an array
      const facultyArray = Array.isArray(data) ? data : 
                          (data.faculty && Array.isArray(data.faculty)) ? data.faculty : 
                          [];

      setFacultyData(facultyArray);
      setStats({
        totalFaculty: facultyArray.length,
        pendingApprovals: facultyArray.filter(f => f.status === 'pending').length,
        activeFaculty: facultyArray.filter(f => f.status === 'active').length
      });
    } catch (err) {
      console.error('Error fetching faculty data:', err);
      setError(err.message || 'Failed to fetch faculty data. Please try again later.');
      setFacultyData([]);
      setStats({
        totalFaculty: 0,
        pendingApprovals: 0,
        activeFaculty: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (profileId) => {
    navigate(`/view-faculty/${profileId}`);
  };

  const handleEditProfile = (facultyId) => {
    navigate(`/edit-faculty/${facultyId}`);
  };

  const handleExportData = () => {
    // Convert faculty data to CSV
    const headers = ['Name', 'Department', 'Designation', 'Email', 'Status'];
    const csvData = facultyData.map(faculty => [
      `${faculty.firstName} ${faculty.lastName}`,
      faculty.department,
      faculty.designation,
      faculty.email,
      faculty.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'faculty_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <button onClick={handleExportData} className="export-button">
            <FaFileDownload /> Export Data
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="stats-container">
        <div className="stat-card">
          <FaUser />
          <h3>Total Faculty</h3>
          <p className="stat-number">{stats.totalFaculty}</p>
        </div>
        <div className="stat-card">
          <FaUser />
          <h3>Pending Approvals</h3>
          <p className="stat-number">{stats.pendingApprovals}</p>
        </div>
        <div className="stat-card">
          <FaUser />
          <h3>Active Faculty</h3>
          <p className="stat-number">{stats.activeFaculty}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Faculty List */}
        <div className="faculty-list-section">
          <div className="section-header">
            <h2>Faculty List</h2>
            <div className="search-box">
              <FaSearch />
              <input type="text" placeholder="Search faculty..." />
            </div>
          </div>
          <div className="table-container">
            <table className="faculty-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facultyData.map(faculty => (
                  <tr key={faculty._id}>
                    <td>{`${faculty.firstName} ${faculty.lastName}`}</td>
                    <td>{faculty.department}</td>
                    <td>{faculty.designation}</td>
                    <td>{faculty.email}</td>
                    <td>
                      <span className={`status-badge ${faculty.status}`}>
                        {faculty.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button
                        onClick={() => handleViewProfile(faculty._id)}
                        className="view-button"
                      >
                        <FaEye /> View
                      </button>
                      <button
                        onClick={() => handleEditProfile(faculty._id)}
                        className="edit-button"
                      >
                        <FaEdit /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="analytics-section">
          <h2>Publications Overview</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={publicationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {publicationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;