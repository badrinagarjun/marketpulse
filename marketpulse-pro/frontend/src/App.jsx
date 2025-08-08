import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import FundedChallengeDashboard from './components/FundedChallengeDashboard';
import TradingJournal from './components/TradingJournal';
import GlobalMarkets from './components/GlobalMarkets';
import MarketNews from './components/MarketNews';
import Analysis from './components/Analysis';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { token } = useAuth();

  return (
    <Router>
      <div className="App">
        <Navigation />
        {!token && (
          <div className="app-header">
            <h1>MarketPulse Pro 🚀</h1>
            <p>Professional Trading Platform</p>
          </div>
        )}
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={<PrivateRoute><Dashboard /></PrivateRoute>} 
            />
            <Route 
              path="/challenge" 
              element={<PrivateRoute><FundedChallengeDashboard /></PrivateRoute>} 
            />
            <Route 
              path="/journal" 
              element={<PrivateRoute><TradingJournal /></PrivateRoute>} 
            />
            <Route 
              path="/markets" 
              element={<PrivateRoute><GlobalMarkets /></PrivateRoute>} 
            />
            <Route 
              path="/news" 
              element={<PrivateRoute><MarketNews /></PrivateRoute>} 
            />
            <Route 
              path="/analysis" 
              element={<PrivateRoute><Analysis /></PrivateRoute>} 
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;