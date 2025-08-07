import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import './FundedAccountDashboard.css';

const AccountSelection = ({ onAccountCreated }) => {
  const [options, setOptions] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAccountOptions();
  }, []);

  const fetchAccountOptions = async () => {
    try {
      const response = await api.get('/api/challenge/account-options');
      setOptions(response.data);
      setSelectedType(response.data[0]?.type || '');
    } catch (error) {
      console.error('Failed to fetch account options:', error);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!selectedType) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/api/challenge/create-account', {
        accountType: selectedType
      });
      setMessage(response.data.message);
      onAccountCreated(response.data.account);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const accountDescriptions = {
    '5k': {
      title: '$5,000 Challenge',
      subtitle: 'Perfect for beginners',
      features: ['Lower risk', 'Learn basics', 'Build confidence'],
      color: '#10b981'
    },
    '10k': {
      title: '$10,000 Challenge', 
      subtitle: 'Most popular choice',
      features: ['Balanced risk', 'Good profit potential', 'Recommended for most'],
      color: '#3b82f6'
    },
    '60k': {
      title: '$60,000 Challenge',
      subtitle: 'For experienced traders',
      features: ['Higher profit targets', 'Advanced strategies', 'Professional level'],
      color: '#8b5cf6'
    },
    '100k': {
      title: '$100,000 Challenge',
      subtitle: 'Elite trader level',
      features: ['Maximum profit potential', 'Institutional size', 'Expert traders only'],
      color: '#f59e0b'
    }
  };

  return (
    <div className="account-selection">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
          🚀 Choose Your Funded Trading Challenge
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
          Select your starting balance and begin your journey to becoming a funded trader
        </p>
      </div>
      
      <form onSubmit={handleCreateAccount}>
        <div className="account-options">
          {options.map(option => {
            const description = accountDescriptions[option.type];
            return (
              <div 
                key={option.type} 
                className={`account-option ${selectedType === option.type ? 'selected' : ''}`}
                onClick={() => setSelectedType(option.type)}
                style={{
                  borderColor: selectedType === option.type ? description?.color : '#e5e7eb',
                  background: selectedType === option.type ? `${description?.color}15` : 'rgba(248, 250, 252, 0.8)'
                }}
              >
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: description?.color, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <span style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}>
                    ${option.type.replace('k', 'K')}
                  </span>
                </div>
                
                <div className="option-title" style={{ color: description?.color }}>
                  {description?.title}
                </div>
                <div className="option-subtitle">
                  {description?.subtitle}
                </div>
                
                <div style={{ margin: '12px 0', fontSize: '0.875rem' }}>
                  {description?.features.map((feature, index) => (
                    <div key={index} style={{ margin: '4px 0', color: '#64748b' }}>
                      ✓ {feature}
                    </div>
                  ))}
                </div>
                
                <div style={{ 
                  padding: '8px 12px', 
                  background: 'rgba(255,255,255,0.8)', 
                  borderRadius: '8px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  Starting Balance: ${option.balance.toLocaleString()}
                </div>
                
                <input
                  type="radio"
                  value={option.type}
                  checked={selectedType === option.type}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{ display: 'none' }}
                />
              </div>
            );
          })}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button 
            type="submit" 
            disabled={loading || !selectedType}
            className="btn btn-buy"
            style={{ 
              fontSize: '1.1rem',
              padding: '16px 32px',
              minWidth: '200px'
            }}
          >
            {loading ? (
              <>
                <span className="loading" style={{ marginRight: '8px' }}></span>
                Creating Account...
              </>
            ) : (
              <>🚀 Start Trading Challenge</>
            )}
          </button>
        </div>
      </form>

      {message && (
        <div style={{ 
          marginTop: '24px',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center',
          backgroundColor: message.includes('successfully') ? '#f0f9ff' : '#fef2f2',
          border: `1px solid ${message.includes('successfully') ? '#0ea5e9' : '#ef4444'}`,
          color: message.includes('successfully') ? '#0c4a6e' : '#991b1b',
          fontSize: '1rem'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ 
        marginTop: '32px', 
        textAlign: 'center',
        padding: '20px',
        background: 'rgba(248, 250, 252, 0.8)',
        borderRadius: '12px',
        fontSize: '0.875rem',
        color: '#64748b'
      }}>
        <h4 style={{ color: '#1e293b', marginBottom: '8px' }}>📋 Challenge Rules</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li>✅ No time limits - trade at your own pace</li>
          <li>✅ Real market conditions with live data</li>
          <li>✅ All major US stocks available</li>
          <li>✅ Track your performance with detailed analytics</li>
          <li>✅ Reset anytime to start fresh</li>
        </ul>
      </div>
    </div>
  );
};

export default AccountSelection;