import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const { token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!token) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">📈</span>
            <span className="brand-text">MarketPulse Pro</span>
          </Link>
        </div>
        
        <div className="navbar-menu">
          <Link 
            to="/" 
            className={`navbar-item ${isActive('/') ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span>Overview</span>
          </Link>
          
          <Link 
            to="/challenge" 
            className={`navbar-item ${isActive('/challenge') ? 'active' : ''}`}
          >
            <span className="nav-icon">🏆</span>
            <span>Challenge</span>
          </Link>
          
          <Link 
            to="/journal" 
            className={`navbar-item ${isActive('/journal') ? 'active' : ''}`}
          >
            <span className="nav-icon">📝</span>
            <span>Journal</span>
          </Link>
          
          <Link 
            to="/markets" 
            className={`navbar-item ${isActive('/markets') ? 'active' : ''}`}
          >
            <span className="nav-icon">🌍</span>
            <span>Global Markets</span>
          </Link>
          
          <Link 
            to="/analysis" 
            className={`navbar-item ${isActive('/analysis') ? 'active' : ''}`}
          >
            <span className="nav-icon">📈</span>
            <span>Analysis</span>
          </Link>
          
          <Link 
            to="/paper-trading" 
            className={`navbar-item ${isActive('/paper-trading') ? 'active' : ''}`}
          >
            <span className="nav-icon">🆓</span>
            <span>Paper Trading</span>
          </Link>
          
          <Link 
            to="/news" 
            className={`navbar-item ${isActive('/news') ? 'active' : ''}`}
          >
            <span className="nav-icon">📰</span>
            <span>Market News</span>
          </Link>
          
          <Link 
            to="/analysis" 
            className={`navbar-item ${isActive('/analysis') ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span>Analysis</span>
          </Link>
        </div>
        
        <div className="navbar-actions">
          <div className="market-status">
            <span className="status-dot status-open"></span>
            <span className="status-text">Market Open</span>
          </div>
          
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
