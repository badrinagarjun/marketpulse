import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { token, logout } = useAuth();
  
  // A small component to handle logout within the Router context
  const LogoutButton = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
      logout();
      navigate('/login');
    };
    return <button onClick={handleLogout}>Logout</button>;
  };

  return (
    <Router>
      <div className="App">
        <nav>
          {token ? (
            <>
              <Link to="/">Dashboard</Link> | <LogoutButton />
            </>
          ) : (
            <>
              <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
            </>
          )}
        </nav>
        <h1>MarketPulse Pro 🚀</h1>
        <Routes>
          <Route 
            path="/" 
            element={<PrivateRoute><Dashboard /></PrivateRoute>} 
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;