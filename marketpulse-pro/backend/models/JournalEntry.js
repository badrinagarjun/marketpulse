import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  tradeType: { type: String, enum: ['Buy', 'Sell'], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  notes: { type: String },
  tradeDate: { type: Date, default: Date.now }
});

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

export default JournalEntry;