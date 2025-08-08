import React, { useState, useEffect } from 'react';
import './MarketNews.css';

const MarketNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchMarketNews();
    const interval = setInterval(fetchMarketNews, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchMarketNews = async () => {
    try {
      // Mock news data - in production, integrate with real news APIs
      const mockNews = [
        {
          id: 1,
          title: "Federal Reserve Signals Potential Rate Cut Amid Economic Uncertainty",
          summary: "The Federal Reserve hints at possible interest rate adjustments following latest economic indicators showing mixed signals in the market.",
          source: "Reuters",
          publishedAt: new Date(Date.now() - 1800000), // 30 min ago
          category: "economy",
          impact: "high",
          url: "#"
        },
        {
          id: 2,
          title: "Tech Stocks Rally as AI Sector Shows Strong Momentum",
          summary: "Major technology companies see significant gains as artificial intelligence investments continue to drive market optimism.",
          source: "Bloomberg",
          publishedAt: new Date(Date.now() - 3600000), // 1 hour ago
          category: "stocks",
          impact: "medium",
          url: "#"
        },
        {
          id: 3,
          title: "Oil Prices Surge Following OPEC+ Production Agreement",
          summary: "Crude oil futures jump 3% after major oil producers agree to extend production cuts through the next quarter.",
          source: "Financial Times",
          publishedAt: new Date(Date.now() - 7200000), // 2 hours ago
          category: "commodities",
          impact: "high",
          url: "#"
        },
        {
          id: 4,
          title: "Dollar Strengthens Against Major Currencies on Inflation Data",
          summary: "USD gains ground against EUR and GBP following better-than-expected inflation numbers from the US.",
          source: "Wall Street Journal",
          publishedAt: new Date(Date.now() - 10800000), // 3 hours ago
          category: "forex",
          impact: "medium",
          url: "#"
        },
        {
          id: 5,
          title: "Bitcoin Breaks Above $45,000 as Institutional Adoption Grows",
          summary: "Cryptocurrency markets see renewed interest as more institutional investors allocate funds to digital assets.",
          source: "CoinDesk",
          publishedAt: new Date(Date.now() - 14400000), // 4 hours ago
          category: "crypto",
          impact: "medium",
          url: "#"
        },
        {
          id: 6,
          title: "European Markets Open Higher on Positive Economic Outlook",
          summary: "Major European indices gain at market open following encouraging PMI data from Germany and France.",
          source: "CNBC",
          publishedAt: new Date(Date.now() - 18000000), // 5 hours ago
          category: "global",
          impact: "low",
          url: "#"
        },
        {
          id: 7,
          title: "Gold Reaches New Monthly High Amid Geopolitical Tensions",
          summary: "Precious metals rally as investors seek safe-haven assets during ongoing international uncertainties.",
          source: "MarketWatch",
          publishedAt: new Date(Date.now() - 21600000), // 6 hours ago
          category: "commodities",
          impact: "high",
          url: "#"
        },
        {
          id: 8,
          title: "Earnings Season Preview: Tech Giants Report This Week",
          summary: "Major technology companies prepare to release quarterly earnings with high expectations from analysts.",
          source: "Yahoo Finance",
          publishedAt: new Date(Date.now() - 25200000), // 7 hours ago
          category: "stocks",
          impact: "medium",
          url: "#"
        }
      ];

      setNews(mockNews);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching market news:', error);
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All News', icon: '📰' },
    { value: 'stocks', label: 'Stocks', icon: '📈' },
    { value: 'forex', label: 'Forex', icon: '💱' },
    { value: 'commodities', label: 'Commodities', icon: '🏗️' },
    { value: 'crypto', label: 'Crypto', icon: '₿' },
    { value: 'economy', label: 'Economy', icon: '🏦' },
    { value: 'global', label: 'Global', icon: '🌍' }
  ];

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'impact-high';
      case 'medium': return 'impact-medium';
      case 'low': return 'impact-low';
      default: return 'impact-low';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInHours === 0) {
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="market-news">
        <div className="news-header">
          <h1>Market News</h1>
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
        <p>Latest financial news and market updates</p>
        <div className="last-updated">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category.value}
            className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.value)}
          >
            <span className="category-icon">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* News Grid */}
      <div className="news-grid">
        {filteredNews.map(article => (
          <article key={article.id} className="news-card">
            <div className="news-header-info">
              <div className="news-meta">
                <span className="news-source">{article.source}</span>
                <span className="news-time">{formatTimeAgo(article.publishedAt)}</span>
              </div>
              <div className={`impact-indicator ${getImpactColor(article.impact)}`}>
                {article.impact.toUpperCase()}
              </div>
            </div>
            
            <h2 className="news-title">{article.title}</h2>
            <p className="news-summary">{article.summary}</p>
            
            <div className="news-footer">
              <span className="news-category">
                {categories.find(cat => cat.value === article.category)?.icon} {article.category}
              </span>
              <button className="read-more-btn">
                Read More →
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="no-news">
          <span className="no-news-icon">📭</span>
          <h3>No news found</h3>
          <p>Try selecting a different category or check back later.</p>
        </div>
      )}

      {/* Breaking News Banner */}
      <div className="breaking-news">
        <div className="breaking-label">
          <span className="breaking-icon">🚨</span>
          BREAKING
        </div>
        <div className="breaking-content">
          <marquee>
            Federal Reserve announces emergency meeting • Oil prices surge 5% • Tech stocks rally continues • Bitcoin hits new resistance level • Gold reaches monthly high
          </marquee>
        </div>
      </div>
    </div>
  );
};

export default MarketNews;
