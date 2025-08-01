import express from 'express';
import JournalEntry from '../models/JournalEntry.js';

const router = express.Router();

// GET all journal entries
router.get('/', async (req, res) => {
  try {
    const entries = await JournalEntry.find().sort({ tradeDate: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new journal entry
router.post('/', async (req, res) => {
  const entry = new JournalEntry({
    symbol: req.body.symbol,
    tradeType: req.body.tradeType,
    quantity: req.body.quantity,
    price: req.body.price,
    notes: req.body.notes
  });

  try {
    const newEntry = await entry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;