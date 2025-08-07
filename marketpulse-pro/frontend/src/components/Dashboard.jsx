import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import MarketStatus from './MarketStatus';
import EnhancedStockPrice from './EnhancedStockPrice';
import TradingJournal from './TradingJournal';
import FundedChallengeDashboard from './FundedChallengeDashboard';
import './FundedAccountDashboard.css';

const cardVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0 }
};

const Dashboard = () => {
  return (
    <div className="funded-dashboard">
      {/* Header */}
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="header-title">MarketPulse Pro</h1>
        <p className="header-subtitle">Professional Trading Platform & Funded Challenge</p>
      </motion.div>

      {/* Global Market Status */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <MarketStatus />
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Stock Price & Charts */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <EnhancedStockPrice />
        </motion.div>

        {/* Funded Trading Challenge */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <FundedChallengeDashboard />
        </motion.div>
      </div>

      {/* Trading Journal */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="dashboard-card">
          <TradingJournal />
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;