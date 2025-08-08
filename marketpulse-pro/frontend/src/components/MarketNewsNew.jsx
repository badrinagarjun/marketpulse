import React, { useState } from 'react';
import './MarketNews.css';
import { useMarketNews } from '../hooks/useMarketData';

const MarketNews = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const { news, loading, error } = useMarketNews(selectedCategory, 30);

  const categories = [
    { id: 'general', name: 'All News', icon: '📰' },
    { id: 'forex', name: 'Forex', icon: '💱' },
    { id: 'stocks', name: 'Stocks', icon: '📈' },
    { id: 'crypto', name: 'Crypto', icon: '₿' },
    { id: 'economy', name: 'Economy', icon: '🏦' },
    { id: 'commodities', name: 'Commodities', icon: '🛢️' }
  ];

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return '#2ed573';
      case 'negative': return '#ff4757';
      default: return '#747d8c';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const newsDate = new Date(date);
    const diffInMinutes = Math.floor((now - newsDate) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Mock data fallback for when API is not available
  const getMockNews = () => [
    {
      id: 1,
      title: "Federal Reserve Signals Potential Rate Cut Amid Economic Uncertainty",
      summary: "The Federal Reserve hints at possible interest rate adjustments following latest economic indicators showing mixed signals in the market.",
      source: "Reuters",
      publishedAt: new Date(Date.now() - 1800000),
      category: "economy",
      impact: "high",
      sentiment: "neutral",
      url: "#"
    },
    {
      id: 2,
      title: "Tech Stocks Rally as AI Sector Shows Strong Momentum",
      summary: "Major technology companies see significant gains as artificial intelligence investments continue to drive market optimism.",
      source: "Bloomberg",
      publishedAt: new Date(Date.now() - 3600000),
      category: "stocks",
      impact: "medium",
      sentiment: "positive",
      url: "#"
    },
    {
      id: 3,
      title: "Oil Prices Surge Following OPEC+ Production Agreement",
      summary: "Crude oil futures jump 3% after major oil producers agree to extend production cuts through the next quarter.",
      source: "Financial Times",
      publishedAt: new Date(Date.now() - 7200000),
      category: "commodities",
      impact: "high",
      sentiment: "positive",
      url: "#"
    },
    {
      id: 4,
      title: "Bitcoin Volatility Continues as Regulatory Clarity Awaited",
      summary: "Cryptocurrency markets remain volatile as investors await clearer regulatory frameworks from major economies.",
      source: "CoinDesk",
      publishedAt: new Date(Date.now() - 10800000),
      category: "crypto",
      impact: "medium",
      sentiment: "negative",
      url: "#"
    },
    {
      id: 5,
      title: "European Markets Open Higher on Manufacturing Data",
      summary: "European stock indices gain ground as positive manufacturing PMI data boosts investor confidence across the region.",
      source: "CNBC",
      publishedAt: new Date(Date.now() - 14400000),
      category: "stocks",
      impact: "low",
      sentiment: "positive",
      url: "#"
    },
    {
      id: 6,
      title: "Dollar Strengthens Against Major Currencies",
      summary: "The US Dollar continues its upward trend against the Euro and Yen as economic data supports Fed policy expectations.",
      source: "MarketWatch",
      publishedAt: new Date(Date.now() - 18000000),
      category: "forex",
      impact: "medium",
      sentiment: "neutral",
      url: "#"
    }
  ];

  const filteredNews = selectedCategory === 'general' 
    ? (news.length > 0 ? news : getMockNews())
    : (news.length > 0 ? news : getMockNews()).filter(article => article.category === selectedCategory);

  if (loading) {
    return (
      <div className="market-news">
        <div className="news-header">
          <h1>📰 Market News</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="market-news">
      {/* Header */}
      <div className="news-header">
        <h1>📰 Market News</h1>
        <p>Latest market updates and financial news</p>
        
        {error && (
          <div className="api-status demo">
            <span className="status-indicator">⚡</span>
            Demo news data - {error}
          </div>
        )}
        {!error && news.length > 0 && (
          <div className="api-status live">
            <span className="status-indicator">🟢</span>
            Live news feed
          </div>
        )}
      </div>

      {/* Breaking News Banner */}
      <div className="breaking-news">
        <div className="breaking-ticker">
          <span className="breaking-label">🔴 BREAKING</span>
          <div className="ticker-content">
            <span>Federal Reserve considers rate adjustments • </span>
            <span>Tech sector shows strong momentum • </span>
            <span>Oil prices surge on OPEC+ agreement • </span>
            <span>Crypto markets remain volatile • </span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="news-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* News Grid */}
      <div className="news-grid">
        {filteredNews.slice(0, 20).map((article, index) => (
          <div key={article.id || index} className="news-card">
            <div className="news-meta">
              <span className="news-source">{article.source}</span>
              <span className="news-time">{formatTimeAgo(article.publishedAt)}</span>
              <div className="news-indicators">
                <span 
                  className="impact-badge"
                  style={{ backgroundColor: getImpactColor(article.impact) }}
                >
                  {article.impact?.toUpperCase() || 'LOW'}
                </span>
                {article.sentiment && (
                  <span 
                    className="sentiment-badge"
                    style={{ color: getSentimentColor(article.sentiment) }}
                  >
                    {article.sentiment === 'positive' ? '📈' : 
                     article.sentiment === 'negative' ? '📉' : '➡️'}
                  </span>
                )}
              </div>
            </div>
            
            <h3 className="news-title">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
            </h3>
            
            <p className="news-summary">{article.summary}</p>
            
            <div className="news-footer">
              <span className="news-category">
                #{article.category}
              </span>
              <button className="read-more-btn">
                Read More →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="load-more-container">
        <button className="load-more-btn">
          📰 Load More News
        </button>
      </div>
    </div>
  );
};

export default MarketNews;
