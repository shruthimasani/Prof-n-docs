import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEdit, FaSearch, FaFileDownload, FaBell, FaChartBar, FaUserPlus, FaCalendarAlt, FaFilter, FaArrowRight, FaLaptopCode, FaNetworkWired, FaDatabase, FaRobot, FaMicrochip } from 'react-icons/fa';
import './HODDashboard.css';

const HODDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const departments = [
    {
      id: 'Computer Science',
      name: 'Computer Science',
      icon: <FaLaptopCode />,
      color: '#4a90e2'
    },
    {
      id: 'Information Technology',
      name: 'Information Technology',
      icon: <FaNetworkWired />,
      color: '#2ecc71'
    },
    {
      id: 'Data Science',
      name: 'Data Science',
      icon: <FaDatabase />,
      color: '#e74c3c'
    },
    {
      id: 'Artificial Intelligence',
      name: 'Artificial Intelligence',
      icon: <FaRobot />,
      color: '#f1c40f'
    }
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!token || !user || user.role !== 'hod') {
      navigate('/login');
      return;
    }

    fetchNotifications();
    setLoading(false);
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleDepartmentSelect = (e) => {
    const deptId = e.target.value;
    setSelectedDepartment(deptId);
    if (deptId) {
      navigate(`/department-dashboard/${deptId}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="hod-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>HOD Dashboard</h1>
          <div className="header-actions">
            <div className="notifications-icon" onClick={() => setShowNotifications(!showNotifications)}>
              <FaBell />
              {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="department-selection">
        <h2>Select Department Dashboard</h2>
        <div className="department-grid">
          {departments.map(dept => (
            <div 
              key={dept.id} 
              className="department-card"
              style={{ borderColor: dept.color }}
              onClick={() => navigate(`/department-dashboard/${dept.id}`)}
            >
              <div className="department-icon" style={{ backgroundColor: dept.color }}>
                {dept.icon}
              </div>
              <h3>{dept.name}</h3>
              <p>View Department Dashboard</p>
              <FaArrowRight className="arrow-icon" />
            </div>
          ))}
        </div>
      </div>

      {showNotifications && (
        <div className="notifications-panel">
          <h3>Recent Notifications</h3>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div key={notification._id} className="notification-item">
                <p>{notification.message}</p>
                <span className="notification-time">{new Date(notification.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HODDashboard;
