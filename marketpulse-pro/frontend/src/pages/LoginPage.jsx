import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/AnimatedLoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      setSuccess('Login successful! Redirecting...');
      login(res.data.token);
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      setError('Invalid credentials. Please check your email and password.');
      console.error('Login error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Floating Background Icons */}
      <div className="floating-icons">
        <div className="floating-icon">📈</div>
        <div className="floating-icon">💰</div>
        <div className="floating-icon">📊</div>
        <div className="floating-icon">🚀</div>
        <div className="floating-icon">💎</div>
      </div>

      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">
            MarketPulse Pro
            <span className="pulse-indicator"></span>
          </h1>
          <p className="login-subtitle">
            Welcome back to your trading journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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
              placeholder="Enter your password" 
              required 
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? '' : '🚀 Login to Trading'}
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
        </form>

        <div className="register-link">
          <p className="register-text">
            Don't have an account?{' '}
            <Link to="/register" className="register-button">
              Join the Challenge
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;