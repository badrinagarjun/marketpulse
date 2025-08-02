import express from 'express';
import axios from 'axios';
import ChallengeAccount from '../models/ChallengeAccount.js';
import Position from '../models/Position.js';

const router = express.Router();
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// --- A one-time route to create the initial account for testing ---
router.get('/init', async (req, res) => {
  try {
    const existingAccount = await ChallengeAccount.findOne();
    if (existingAccount) {
      return res.status(400).send('Account already exists.');
    }
    const account = new ChallengeAccount();
    await account.save();
    res.status(201).send('Challenge account created successfully.');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// POST a new order (handles both Buy and Sell)
router.post('/order', async (req, res) => {
  const { symbol, tradeType, quantity: tradeQuantity } = req.body;
  const quantity = Number(tradeQuantity);

  try {
    // 1. Get current stock price
    const priceResponse = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
    const currentPrice = parseFloat(priceResponse.data['Global Quote']['05. price']);
    if (!currentPrice) return res.status(400).json({ message: 'Could not fetch a valid price.' });

    // 2. Get user account and existing position
    const account = await ChallengeAccount.findOne();
    const existingPosition = await Position.findOne({ symbol });

    if (tradeType === 'Buy') {
      const tradeCost = currentPrice * quantity;
      if (account.currentBalance < tradeCost) return res.status(400).json({ message: 'Insufficient funds.' });

      account.currentBalance -= tradeCost;

      if (existingPosition) {
        // Update existing position (averaging down/up)
        const totalQuantity = existingPosition.quantity + quantity;
        const newAveragePrice = ((existingPosition.averagePrice * existingPosition.quantity) + (currentPrice * quantity)) / totalQuantity;
        existingPosition.quantity = totalQuantity;
        existingPosition.averagePrice = newAveragePrice;
        await existingPosition.save();
      } else {
        // Create new position
        const newPosition = new Position({ symbol, quantity, averagePrice: currentPrice });
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
        // Selling all shares, so remove the position
        await Position.findByIdAndDelete(existingPosition._id);
      } else {
        // Selling some shares, so update quantity
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

// GET the main challenge account
router.get('/account', async (req, res) => {
  try {
    const account = await ChallengeAccount.findOne();
    if (!account) return res.status(404).json({ message: 'Account not found. Please initialize it.' });
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all open positions
router.get('/positions', async (req, res) => {
  try {
    const positions = await Position.find();
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;