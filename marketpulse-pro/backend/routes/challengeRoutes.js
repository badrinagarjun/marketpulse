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

// POST a new "Buy" order
router.post('/order', async (req, res) => {
  const { symbol, tradeType, quantity } = req.body;
  
  if (tradeType !== 'Buy') {
    return res.status(400).json({ message: 'Only "Buy" orders are supported in this version.' });
  }

  try {
    // 1. Get the current stock price from Alpha Vantage
    const priceResponse = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
    const currentPrice = parseFloat(priceResponse.data['Global Quote']['05. price']);

    if (!currentPrice) {
      return res.status(400).json({ message: 'Could not fetch a valid price for the symbol.' });
    }

    // 2. Get the challenge account
    const account = await ChallengeAccount.findOne();
    const tradeCost = currentPrice * quantity;

    // 3. Check if there is enough balance
    if (account.currentBalance < tradeCost) {
      return res.status(400).json({ message: 'Insufficient funds.' });
    }

    // 4. Update balance and create/update position (simplified logic for now)
    account.currentBalance -= tradeCost;
    
    // For now, we assume each buy creates a new position for simplicity
    const newPosition = new Position({
      symbol,
      quantity,
      averagePrice: currentPrice,
    });

    await newPosition.save();
    await account.save();
    
    res.status(201).json({ message: `Successfully bought ${quantity} of ${symbol}.`, account });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to process order.' });
  }
});

export default router;