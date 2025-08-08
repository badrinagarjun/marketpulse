import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../components/AnimatedLoginPage.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setMessage('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5001/api/auth/register', { 
        username, 
        email, 
        password 
      });
      setSuccess('Account created successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Floating Background Icons */}
      <div className="floating-icons">
        <div className="floating-icon">🎯</div>
        <div className="floating-icon">💼</div>
        <div className="floating-icon">📊</div>
        <div className="floating-icon">🚀</div>
        <div className="floating-icon">💰</div>
      </div>

      <div className="login-container register-container">
        <div className="login-header">
          <h1 className="login-title">
            Join MarketPulse Pro
            <span className="pulse-indicator"></span>
          </h1>
          <p className="login-subtitle">
            Create your account and start your trading journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input 
              type="text" 
              className="form-input"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter your username" 
              required 
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input 
              type="email" 
              className="form-input"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email address" 
              required 
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input 
              type="password" 
              className="form-input"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Create a password (min. 6 characters)" 
              required 
              disabled={loading}
              minLength="6"
            />
          </div>

          <div className="form-group">
            <input 
              type="password" 
              className="form-input"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Confirm your password" 
              required 
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? '' : '🎯 Create Trading Account'}
          </button>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              ✅ {success}
            </div>
          )}

          {message && (
            <div className={message.includes('success') ? 'success-message' : 'error-message'}>
              {message.includes('success') ? '✅' : '❌'} {message}
            </div>
          )}
        </form>

        <div className="register-link">
          <p className="register-text">
            Already have an account?{' '}
            <Link to="/login" className="register-button">
              Sign In
            </Link>
          </p>
        </div>

        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center',
          padding: '16px',
          background: 'rgba(248, 250, 252, 0.8)',
          borderRadius: '12px',
          fontSize: '0.875rem',
          color: '#64748b'
        }}>
          <p style={{ margin: 0 }}>
            🎯 Join thousands of traders competing in funded challenges
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;