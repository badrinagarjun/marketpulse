
import React from 'react';
import MarketStatus from './components/MarketStatus';
import StockPrice from './components/StockPrice';
import './App.css';
import TradingJournal from './components/TradingJournal';

function App() {
  return (
    <div className="App">
      <h1>MarketPulse Pro 🚀</h1>
      <hr />
      <MarketStatus />
      <hr />
      <StockPrice />
      <hr />
      <TradingJournal /> {/* Add new component */}
    </div>
  );
}
export default App;