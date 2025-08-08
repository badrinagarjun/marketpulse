import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axiosConfig';
import './FundedAccountDashboard.css';

const UserChallengeLeaderboard = () => {
  const [challenges, setChallenges] = useState([]);
  const [userAccount, setUserAccount] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all'); // all, week, month
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
    fetchUserAccount();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      // This would be a new API endpoint to get all challenge accounts
      const response = await api.get('/api/challenge/leaderboard');
      setChallenges(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Mock data for demonstration
      setChallenges([
        {
          _id: '1',
          userId: { username: 'TraderPro', email: 'trader@example.com' },
          accountType: '$25K Challenge',
          startingBalance: 25000,
          currentBalance: 28500,
          createdAt: new Date('2024-01-15'),
          positions: [
            { symbol: 'AAPL', quantity: 100, averagePrice: 180, currentPrice: 185 },
            { symbol: 'MSFT', quantity: 50, averagePrice: 320, currentPrice: 330 }
          ]
        },
        {
          _id: '2',
          userId: { username: 'MarketMaster', email: 'market@example.com' },
          accountType: '$50K Challenge',
          startingBalance: 50000,
          currentBalance: 47800,
          createdAt: new Date('2024-01-10'),
          positions: [
            { symbol: 'TSLA', quantity: 20, averagePrice: 220, currentPrice: 210 },
          ]
        },
        {
          _id: '3',
          userId: { username: 'BullRunner', email: 'bull@example.com' },
          accountType: '$10K Challenge',
          startingBalance: 10000,
          currentBalance: 12200,
          createdAt: new Date('2024-01-20'),
          positions: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAccount = async () => {
    try {
      const response = await api.get('/api/challenge/account');
      setUserAccount(response.data);
    } catch {
      console.error('User has no challenge account');
    }
  };

  const calculatePerformanceStats = (account) => {
    const unrealizedPnL = account.positions?.reduce((total, pos) => {
      return total + ((pos.currentPrice - pos.averagePrice) * pos.quantity);
    }, 0) || 0;

    const totalEquity = account.currentBalance + unrealizedPnL;
    const totalReturn = totalEquity - account.startingBalance;
    const returnPercentage = (totalReturn / account.startingBalance) * 100;
    
    const daysSinceStart = Math.ceil((new Date() - new Date(account.createdAt)) / (1000 * 60 * 60 * 24));
    const dailyReturn = daysSinceStart > 0 ? returnPercentage / daysSinceStart : 0;

    return {
      totalEquity,
      totalReturn,
      returnPercentage,
      unrealizedPnL,
      daysSinceStart,
      dailyReturn,
      riskLevel: Math.abs(returnPercentage) > 10 ? 'High' : Math.abs(returnPercentage) > 5 ? 'Medium' : 'Low'
    };
  };

  const sortedChallenges = useMemo(() => {
    return challenges
      .map(account => ({
        ...account,
        stats: calculatePerformanceStats(account)
      }))
      .sort((a, b) => b.stats.returnPercentage - a.stats.returnPercentage);
  }, [challenges]);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getPerformanceColor = (percentage) => {
    if (percentage > 0) return 'performance-positive';
    if (percentage < 0) return 'performance-negative';
    return 'performance-neutral';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="loading"></div>
        <p>Loading Challenge Leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 className="card-title">
          <span className="card-icon">🏆</span>
          Challenge Leaderboard
        </h3>
        
        <select 
          value={timeFilter} 
          onChange={(e) => setTimeFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: 'white',
            fontSize: '0.875rem'
          }}
        >
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="week">This Week</option>
        </select>
      </div>

      {/* User's Current Position */}
      {userAccount && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>
            👤 Your Current Position
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {formatCurrency(calculatePerformanceStats(userAccount).totalEquity)}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Portfolio Value</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {calculatePerformanceStats(userAccount).returnPercentage >= 0 ? '+' : ''}
                {calculatePerformanceStats(userAccount).returnPercentage.toFixed(2)}%
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Total Return</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                {userAccount.accountType}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Challenge Type</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="positions-table" style={{ minWidth: '800px' }}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Trader</th>
              <th>Challenge</th>
              <th>Portfolio Value</th>
              <th>Return</th>
              <th>Daily Avg</th>
              <th>Risk Level</th>
              <th>Days Active</th>
            </tr>
          </thead>
          <tbody>
            {sortedChallenges.map((account, index) => (
              <tr key={account._id} style={{
                background: userAccount && account._id === userAccount._id ? 
                  'rgba(102, 126, 234, 0.1)' : 'transparent'
              }}>
                <td style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '700',
                  textAlign: 'center',
                  minWidth: '60px'
                }}>
                  {getRankIcon(index)}
                </td>
                
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '0.875rem'
                    }}>
                      {account.userId.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        {account.userId.username}
                      </div>
                      {userAccount && account._id === userAccount._id && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: '#667eea',
                          fontWeight: '600' 
                        }}>
                          (You)
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                
                <td>
                  <span style={{
                    padding: '4px 8px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {account.accountType}
                  </span>
                </td>
                
                <td style={{ fontWeight: '600' }}>
                  {formatCurrency(account.stats.totalEquity)}
                </td>
                
                <td className={getPerformanceColor(account.stats.returnPercentage)} style={{ fontWeight: '600' }}>
                  {account.stats.returnPercentage >= 0 ? '+' : ''}
                  {account.stats.returnPercentage.toFixed(2)}%
                  <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                    {formatCurrency(account.stats.totalReturn)}
                  </div>
                </td>
                
                <td className={getPerformanceColor(account.stats.dailyReturn)} style={{ fontWeight: '600' }}>
                  {account.stats.dailyReturn >= 0 ? '+' : ''}
                  {account.stats.dailyReturn.toFixed(3)}%
                </td>
                
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: account.stats.riskLevel === 'High' ? 'rgba(239, 68, 68, 0.1)' :
                               account.stats.riskLevel === 'Medium' ? 'rgba(245, 158, 11, 0.1)' :
                               'rgba(5, 150, 105, 0.1)',
                    color: account.stats.riskLevel === 'High' ? '#ef4444' :
                          account.stats.riskLevel === 'Medium' ? '#f59e0b' :
                          '#059669'
                  }}>
                    {account.stats.riskLevel}
                  </span>
                </td>
                
                <td style={{ color: '#64748b' }}>
                  {account.stats.daysSinceStart} days
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Competition Stats */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        background: 'rgba(248, 250, 252, 0.8)',
        borderRadius: '12px'
      }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>📊 Competition Overview</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4f46e5' }}>
              {challenges.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Active Traders</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>
              {challenges.filter(c => calculatePerformanceStats(c).returnPercentage > 0).length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Profitable</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#dc2626' }}>
              {challenges.filter(c => calculatePerformanceStats(c).returnPercentage < 0).length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>In Loss</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
              {formatCurrency(challenges.reduce((sum, c) => sum + calculatePerformanceStats(c).totalEquity, 0))}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total AUM</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserChallengeLeaderboard;
