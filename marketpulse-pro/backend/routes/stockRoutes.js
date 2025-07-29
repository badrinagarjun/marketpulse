import express from 'express';
import axios from 'axios';

const router = express.Router();
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;

  try {
    const response = await axios.get(url);
    // Check for Alpha Vantage error message
    if (response.data.Note || response.data['Error Message']) {
      return res.status(400).json({ error: response.data.Note || response.data['Error Message'] });
    }
    res.json(response.data);
  } catch (error) {
    console.error('Alpha Vantage fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

export default router;