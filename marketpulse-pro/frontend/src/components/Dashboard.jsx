import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'; 
import MarketStatus from './MarketStatus';
import StockPrice from './StockPrice';
import TradingJournal from './TradingJournal';
import ChallengeDashboard from './ChallengeDashboard';
import './Dashboard.css';

const cardVariants = {
  hidden: { opacity: 0, y: 100 },  // Increased from 20 to 100
  visible: { opacity: 1, y: 0 }
};

const Dashboard = () => {
  return (
    <div className="dashboard">
      <motion.div 
        className="dashboard-card" 
        variants={cardVariants} 
        initial="hidden" 
        animate="visible" 
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ChallengeDashboard />
      </motion.div>

      <motion.div 
        className="dashboard-card" 
        variants={cardVariants} 
        initial="hidden" 
        animate="visible" 
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TradingJournal />
      </motion.div>

      <motion.div 
        className="dashboard-card" 
        variants={cardVariants} 
        initial="hidden" 
        animate="visible" 
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <MarketStatus />
        <hr />
        <StockPrice />
      </motion.div>
    </div>
  );
};

export default Dashboard;