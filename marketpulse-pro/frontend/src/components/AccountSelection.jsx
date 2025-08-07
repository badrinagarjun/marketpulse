import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

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

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      margin: '20px 0' 
    }}>
      <h3>Choose Your Challenge Account</h3>
      <p>Select your starting balance for the trading challenge:</p>
      
      <form onSubmit={handleCreateAccount}>
        {options.map(option => (
          <div key={option.type} style={{ margin: '10px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value={option.type}
                checked={selectedType === option.type}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ marginRight: '10px' }}
              />
              <span style={{ fontSize: '16px' }}>
                <strong>{option.label}</strong> - Start with ${option.balance.toLocaleString()}
              </span>
            </label>
          </div>
        ))}
        
        <button 
          type="submit" 
          disabled={loading || !selectedType}
          style={{ 
            marginTop: '15px', 
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating Account...' : 'Create Challenge Account'}
        </button>
      </form>

      {message && (
        <p style={{ 
          marginTop: '15px', 
          color: message.includes('successfully') ? 'green' : 'red' 
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AccountSelection;