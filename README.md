# 📊 MarketPulse Pro

A comprehensive, full-stack trading platform with real-time market data, paper trading capabilities, portfolio management, and trading journal features.

## 🚀 Project Overview

**MarketPulse Pro** is a professional-grade trading platform that enables users to:
- Track real-time stock prices and market data
- Practice trading with virtual accounts (paper trading)
- Maintain a trading journal for strategy analysis
- Compete in trading challenges with leaderboards
- Access technical indicators and market analytics
- View real-time financial news and market sentiment

## ✨ Key Features

### 📈 Real-Time Market Data
- Live stock quotes and price updates
- Technical indicators (RSI, MACD, Moving Averages)
- Forex rates and cryptocurrency prices
- Global market indices tracking
- Real-time chart visualization

### 💼 Paper Trading System
- Virtual trading accounts ($5K, $10K, $60K, $100K)
- Buy/Sell order execution
- Real-time P&L calculation
- Position tracking and portfolio management
- Risk management tools

### 🏆 Trading Challenges
- Competitive trading environment
- Leaderboard rankings
- Performance analytics
- Account growth tracking
- Challenge-based learning

### 📝 Trading Journal
- Track all trades and strategies
- Performance analysis and insights
- Entry/exit documentation
- Strategy backtesting support
- CRUD operations for journal entries

### 📰 Market News Integration
- Real-time financial news feed
- Sentiment analysis (Positive/Negative/Neutral)
- Category filtering (Stocks, Forex, Crypto, Economy)
- Source attribution (Reuters, Bloomberg, CNBC, MarketWatch)
- Impact rating indicators

### 🔐 Authentication & Security
- JWT-based authentication system
- Secure user registration and login
- Protected API routes
- Session management
- Password encryption

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.4
- **Routing**: React Router DOM 7.7.1
- **HTTP Client**: Axios 1.11.0
- **Animations**: Framer Motion 12.23.12
- **Date Handling**: Day.js 1.11.13
- **Styling**: CSS3 with custom animations

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4.19.2
- **Database**: MongoDB with Mongoose 8.4.1
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: Bcrypt 6.0.0
- **API Integration**: Axios 1.11.0
- **CORS**: cors 2.8.5
- **Environment Variables**: dotenv 16.4.5

### External APIs
- **Alpha Vantage**: Stock data & technical indicators
- **Finnhub**: Real-time market data
- **News API**: Financial news feeds
- **Polygon.io**: Advanced market data (optional)

### Development Tools
- **Backend Dev Server**: Nodemon 3.1.10
- **Linting**: ESLint 9.30.1
- **Module System**: ES Modules (type: "module")

## 📁 Project Structure

```
marketpulse/
├── marketpulse-pro/
│   ├── backend/
│   │   ├── middleware/        # Authentication & request handling
│   │   ├── models/            # MongoDB schemas (User, Journal, Challenge)
│   │   ├── routes/            # API endpoints
│   │   ├── server.js          # Express server setup
│   │   └── package.json       # Backend dependencies
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── api/           # API integration layer
│   │   │   ├── components/    # React components
│   │   │   ├── context/       # React Context (Auth)
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── pages/         # Page components
│   │   │   ├── services/      # Trading API services
│   │   │   ├── App.jsx        # Main app component
│   │   │   └── main.jsx       # App entry point
│   │   ├── public/            # Static assets
│   │   ├── index.html         # HTML template
│   │   ├── vite.config.js     # Vite configuration
│   │   └── package.json       # Frontend dependencies
│   │
│   ├── API_INTEGRATION_REPORT.md    # API status and documentation
│   ├── TRADING_API_SETUP.md         # API setup guide
│   └── FREE_TRADING_APIS.md         # Free API resources
│
└── README.md (this file)
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/badrinagarjun/marketpulse.git
   cd marketpulse/marketpulse-pro
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the backend directory:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

   Create a `.env.local` file in the frontend directory:
   ```env
   VITE_ALPHA_VANTAGE_KEY=your_alpha_vantage_key
   VITE_FINNHUB_KEY=your_finnhub_key
   VITE_NEWS_API_KEY=your_news_api_key
   VITE_POLYGON_KEY=your_polygon_key
   VITE_BACKEND_URL=http://localhost:5001
   VITE_ENABLE_LIVE_TRADING=false
   VITE_ENABLE_WEBSOCKET=true
   VITE_UPDATE_INTERVAL=5000
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:5001`

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173` (or another port shown in terminal)

3. **Access the Application**
   Open your browser and navigate to the frontend URL (typically `http://localhost:5173`)

## 🔑 API Keys Setup

To enable full functionality, you'll need to obtain free API keys:

1. **Alpha Vantage** (Required)
   - Sign up: https://www.alphavantage.co/support/#api-key
   - Free tier: 5 calls/minute, 500 calls/day

2. **Finnhub** (Recommended)
   - Sign up: https://finnhub.io/register
   - Free tier: 60 calls/minute

3. **News API** (Optional)
   - Sign up: https://newsapi.org/register
   - Free tier: 1000 requests/month

4. **Polygon.io** (Optional)
   - Sign up: https://polygon.io/
   - Free tier: 5 calls/minute

For detailed setup instructions, see [TRADING_API_SETUP.md](marketpulse-pro/TRADING_API_SETUP.md)

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Stock Data
- `GET /api/stock/:symbol` - Get stock quote

### Trading Challenge
- `POST /api/challenge/account` - Create trading account
- `GET /api/challenge/account` - Get account details
- `POST /api/challenge/order` - Execute trade
- `GET /api/challenge/positions` - Get positions
- `GET /api/challenge/leaderboard` - Get rankings

### Trading Journal
- `GET /api/journal` - Get all journal entries
- `POST /api/journal` - Create journal entry
- `PUT /api/journal/:id` - Update journal entry
- `DELETE /api/journal/:id` - Delete journal entry

For complete API documentation, see [API_INTEGRATION_REPORT.md](marketpulse-pro/API_INTEGRATION_REPORT.md)

## 🧪 Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Runs Vite dev server
```

### Linting
```bash
cd frontend
npm run lint  # Run ESLint
```

### Production Build
```bash
cd frontend
npm run build  # Build for production
npm run preview  # Preview production build
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Protected API routes
- Environment variable configuration
- CORS protection
- Input validation on all endpoints
- Rate limiting ready
- Request logging for monitoring

## 📊 Performance Features

- Real-time data caching
- Optimized API calls
- Rate limit management
- WebSocket support for live updates
- Efficient database queries
- Response compression ready

## 🎯 Use Cases

1. **Learning to Trade**: Practice trading without financial risk
2. **Strategy Testing**: Test trading strategies with real market data
3. **Portfolio Management**: Track and manage virtual portfolios
4. **Market Analysis**: Analyze stocks with technical indicators
5. **Trading Competition**: Compete with other traders
6. **Performance Tracking**: Monitor trading performance over time

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

Created by the MarketPulse Pro Team

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [API Integration Report](marketpulse-pro/API_INTEGRATION_REPORT.md)
- Review the [Trading API Setup Guide](marketpulse-pro/TRADING_API_SETUP.md)

## 🎉 Acknowledgments

- Alpha Vantage for stock market data
- Finnhub for real-time quotes
- News API for financial news
- MongoDB for database solutions
- React and Vite teams for excellent development tools

---

**Built with ❤️ for traders, by traders**
