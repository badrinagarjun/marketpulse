import express from 'express';
import axios from 'axios';
import ChallengeAccount from '../models/ChallengeAccount.js';
import Position from '../models/Position.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Account balance options
const ACCOUNT_OPTIONS = {
  '5k': 5000,
  '10k': 10000,
  '60k': 60000,
  '100k': 100000
};

// GET available account types
router.get('/account-options', (req, res) => {
  const options = Object.keys(ACCOUNT_OPTIONS).map(key => ({
    type: key,
    balance: ACCOUNT_OPTIONS[key],
    label: `$${ACCOUNT_OPTIONS[key].toLocaleString()} Challenge`
  }));
  res.json(options);
});

// POST - Create user's challenge account with selected balance
router.post('/create-account', protect, async (req, res) => {
  try {
    const { accountType } = req.body;
    
    // Check if user already has an account
    const existingAccount = await ChallengeAccount.findOne({ user: req.user.id });
    if (existingAccount) {
      return res.status(400).json({ 
        message: 'You already have a challenge account', 
        account: existingAccount 
      });
    }

    // Validate account type
    if (!ACCOUNT_OPTIONS[accountType]) {
      return res.status(400).json({ 
        message: 'Invalid account type. Choose from: 5k, 10k, 60k, 100k' 
      });
    }

    const startingBalance = ACCOUNT_OPTIONS[accountType];

    // Create new account
    const newAccount = new ChallengeAccount({
      user: req.user.id,
      accountType,
      startingBalance,
      currentBalance: startingBalance
    });

    await newAccount.save();
    res.status(201).json({ 
      message: `${accountType} challenge account created successfully!`, 
      account: newAccount 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create account', error: error.message });
  }
});

// GET user's challenge account
router.get('/account', protect, async (req, res) => {
  try {
    const account = await ChallengeAccount.findOne({ user: req.user.id });
    if (!account) {
      return res.status(404).json({ 
        message: 'No challenge account found. Please create one first.' 
      });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET user's positions
router.get('/positions', protect, async (req, res) => {
  try {
    const positions = await Position.find({ user: req.user.id });
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new order (handles both Buy and Sell)
router.post('/order', protect, async (req, res) => {
  const { symbol, tradeType, quantity: tradeQuantity } = req.body;
  const quantity = Number(tradeQuantity);

  try {
    // Get current stock price
    const priceResponse = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
    const currentPrice = parseFloat(priceResponse.data['Global Quote']['05. price']);
    if (!currentPrice) return res.status(400).json({ message: 'Could not fetch a valid price.' });

    // Get user account and existing position
    const account = await ChallengeAccount.findOne({ user: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'No challenge account found. Please create one first.' });
    }

    const existingPosition = await Position.findOne({ symbol, user: req.user.id });

    if (tradeType === 'Buy') {
      const tradeCost = currentPrice * quantity;
      if (account.currentBalance < tradeCost) {
        return res.status(400).json({ message: 'Insufficient funds.' });
      }

      account.currentBalance -= tradeCost;

      if (existingPosition) {
        // Update existing position
        const totalQuantity = existingPosition.quantity + quantity;
        const newAveragePrice = ((existingPosition.averagePrice * existingPosition.quantity) + (currentPrice * quantity)) / totalQuantity;
        existingPosition.quantity = totalQuantity;
        existingPosition.averagePrice = newAveragePrice;
        await existingPosition.save();
      } else {
        // Create new position
        const newPosition = new Position({ 
          user: req.user.id,
          symbol, 
          quantity, 
          averagePrice: currentPrice 
        });
        await newPosition.save();
      }
      
      await account.save();
      res.status(201).json({ message: `Successfully bought ${quantity} of ${symbol}.` });

    } else if (tradeType === 'Sell') {
      if (!existingPosition || existingPosition.quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient shares to sell.' });
      }

      const proceeds = currentPrice * quantity;
      account.currentBalance += proceeds;

      if (existingPosition.quantity === quantity) {
        // Remove position if selling all shares
        await Position.findByIdAndDelete(existingPosition._id);
      } else {
        // Update quantity
        existingPosition.quantity -= quantity;
        await existingPosition.save();
      }
      
      await account.save();
      res.status(201).json({ message: `Successfully sold ${quantity} of ${symbol}.` });
    } else {
      res.status(400).json({ message: 'Invalid trade type.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to process order.' });
  }
});

// DELETE - Reset user's account (for testing)
router.delete('/reset', protect, async (req, res) => {
  try {
    await ChallengeAccount.findOneAndDelete({ user: req.user.id });
    await Position.deleteMany({ user: req.user.id });
    res.json({ message: 'Account reset successfully. You can create a new one.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset account', error: error.message });
  }
});

export default router;