// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.registrationSuccess) {
      setLoginError('Registration successful! Please log in.');
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (loginError && name === 'username') {
      setLoginError('');
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.role) newErrors.role = 'Please select a role';
    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 4) newErrors.username = 'Must be at least 4 characters';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.msg || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      switch (data.user.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'hod':
          navigate('/hod-dashboard');
          break;
        case 'faculty':
          navigate(data.user.hasProfile ? '/faculty-dashboard' : '/complete-profile');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleLabel =
    formData.role?.charAt(0).toUpperCase() + formData.role?.slice(1) || 'User';

  return (
    <div className="username-login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Prof-N-Docs</h1>
          <p>Sign in with your institutional credentials</p>
        </div>

        {loginError && <div className="error-message">{loginError}</div>}

        {/* Role buttons */}
        
        <div className="role-buttons">
  {['faculty', 'hod', 'admin'].map((role) => (
    <button
      key={role}
      type="button"
      className={`role-button ${formData.role === role ? 'active' : ''}`}
      onClick={() => handleRoleSelect(role)}
    >
      {role.toUpperCase()}
    </button>
  ))}
</div>


        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder={`Enter your ${formData.role || 'username'}`}
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              autoComplete="username"
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              autoComplete="current-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />{' '}
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" /> Signing in…
              </>
            ) : (
              `Sign in as ${roleLabel}`
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="login-link">
              Register here
            </Link>
          </p>
          <p>
            Technical support:{' '}
            <a href="mailto:support@university.edu">support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
