import express from 'express';
import JournalEntry from '../models/JournalEntry.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// This applies the 'protect' middleware to all routes defined after it in this file
router.use(protect);

// GET all journal entries for the logged-in user
router.get('/', async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user.id }).sort({ tradeDate: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new journal entry for the logged-in user
router.post('/', async (req, res) => {
  const entry = new JournalEntry({
    symbol: req.body.symbol,
    tradeType: req.body.tradeType,
    quantity: req.body.quantity,
    price: req.body.price,
    notes: req.body.notes,
    user: req.user.id // Associate entry with the logged-in user
  });

  try {
    const newEntry = await entry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a journal entry owned by the logged-in user
router.delete('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!entry) return res.status(404).json({ message: 'Cannot find entry' });
    res.json({ message: 'Deleted journal entry' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT (update) a journal entry owned by the logged-in user
router.put('/:id', async (req, res) => {
  try {
    const updatedEntry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, 
      req.body, 
      { new: true }
    );
    if (!updatedEntry) return res.status(404).json({ message: 'Cannot find entry' });
    res.json(updatedEntry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;