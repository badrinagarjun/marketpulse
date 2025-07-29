
import React from 'react';
import MarketStatus from './components/MarketStatus';
import StockPrice from './components/StockPrice';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>MarketPulse Pro 🚀</h1>
      <hr />
      <MarketStatus />
      <hr />
      <StockPrice /> {/* Add new component */}
    </div>
  );
}

export default App;