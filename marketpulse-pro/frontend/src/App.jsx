
import React from 'react';
import MarketStatus from './components/MarketStatus';
import StockPrice from './components/StockPrice';
import './App.css';
import TradingJournal from './components/TradingJournal';
import ChallengeDashboard from './components/ChallengeDashboard';

function App() {
  return (
    <div className="App">
      <h1>MarketPulse Pro 🚀</h1>
      <hr />
      <ChallengeDashboard /> {/* Add new component */}
      <hr />
      <MarketStatus />
      <hr />
      <StockPrice />
      <hr />
      <TradingJournal />
    </div>
  );
}
export default App;